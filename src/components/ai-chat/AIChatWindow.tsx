import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getGenerativeModel } from "firebase/ai";
import { ai } from "../../lib/firebase";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";

  const getInitialMessage = () => ({
    id: "1",
    text: `Hello ${userName}! 😊 I'm your Plas Agent. I can help you with orders, food recommendations, and more. How can I assist you today?`,
    sender: "ai" as const,
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update initial message when user name changes (only if it's still the initial message)
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === "1") {
      const newInitialMessage = getInitialMessage();
      if (messages[0].text !== newInitialMessage.text) {
        setMessages([newInitialMessage]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Call Gemini AI
    try {
      if (!ai) {
        throw new Error("AI is not initialized");
      }

      const model = getGenerativeModel(ai, { 
        model: "gemini-2.5-flash",
        tools: [{
          functionDeclarations: [
            {
              name: "search_products",
              description: "Search for available grocery items, food products, or restaurant dishes by name, optionally filtered by a maximum price/budget.",
              parameters: {
                type: "OBJECT",
                properties: {
                  keyword: { type: "STRING", description: "The keyword to search for, e.g., 'pizza', 'burger', 'milk'. Omit to view all." },
                  max_price: { type: "NUMBER", description: "The maximum price the user is willing to pay. Omit if not specified." },
                  store_name: { type: "STRING", description: "If the user mentions a specific shop or restaurant, put the name here. Omit to search everywhere." }
                }
              }
            },
            {
              name: "search_stores",
              description: "Search for available shops, restaurants, or grocery stores by keyword or category.",
              parameters: {
                type: "OBJECT",
                properties: {
                  keyword: { type: "STRING", description: "The store name or type to search for, e.g., 'supermarket', 'bakery'. Omit to see all." }
                }
              }
            }
          ]
        } as any]
      });

      // Prepare chat history (exclude initial greeting to keep context clean, or map it)
      const history = messages
        .filter(m => m.id !== "1") // Optional: filter out system greeting
        .map(m => ({
          role: (m.sender === "user" ? "user" : "model") as "user" | "model",
          parts: [{ text: m.text }]
        }));

      const chat = model.startChat({
        history,
        systemInstruction: {
          role: "system",
          parts: [{ text: `You are Plas Agent, a helpful, friendly AI assistant for a grocery and food delivery app called Plas. Provide concise, helpful answers about food recommendations, orders, and delivery. If the user asks for recommendations or what they can buy with a certain budget, use your search tools to find real data to show them. You have access to store coordinates and reviews; use them to evaluate distance (ask for the user's location if unknown) and recommend places based on their actual ratings!\n\nThe current date and time is ${new Date().toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric' })}. Use this to determine if a store or restaurant is currently open based on their operating hours.\n\nFormatting rules:\n- Use neat spacing and line breaks for readability.\n- Use • (bullet points) or numbered lists for items instead of asterisks.\n- Bold the store names and prices for emphasis.` }]
        },
      });

      const responseId = (Date.now() + 1).toString();
      let isFirstChunk = true;

      // Wrap the message handling in a helper so we can recursively call it if a function is used
      const handleStream = async (requestPayload: any) => {
        const streamResult = await chat.sendMessageStream(requestPayload);
        let fullText = "";
        let functionCallToHandle: any = null;

        for await (const chunk of streamResult.stream) {
          const fCalls = typeof chunk.functionCalls === "function" ? chunk.functionCalls() : chunk.functionCalls;
          if (fCalls && Array.isArray(fCalls) && fCalls.length > 0) {
            functionCallToHandle = fCalls[0];
            break;
          }

          if (isFirstChunk) {
            setIsTyping(false);
            setMessages(prev => [...prev, {
              id: responseId,
              text: "",
              sender: "ai",
              timestamp: new Date(),
            }]);
            isFirstChunk = false;
          }
          
          if (chunk.text && typeof chunk.text === "function") {
             const chunkStr = chunk.text();
             if (chunkStr) {
               fullText += chunkStr;
               setMessages(prev => prev.map(m => 
                 m.id === responseId ? { ...m, text: fullText } : m
               ));
             }
          }
        }
        
        return functionCallToHandle;
      };

      let pendingFunctionCall = await handleStream(inputValue);

      if (pendingFunctionCall) {
        // Show typing again while we fetch
        if (isFirstChunk) setIsTyping(true);
        
        try {
          const fnName = pendingFunctionCall.name;
          const args = pendingFunctionCall.args || pendingFunctionCall.arguments || {};
          
          const response = await fetch("/api/ai/search-plas-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: fnName, params: args })
          });
          const data = await response.json();

          // Pass the database results back to the AI
          await handleStream([{
            functionResponse: {
              name: fnName,
              response: { results: data.results || [] }
            }
          }]);
        } catch (fnErr) {
          console.error("Function call error:", fnErr);
          await handleStream([{
            functionResponse: {
              name: pendingFunctionCall.name,
              response: { error: "Error contacting internal database API." }
            }
          }]);
        }
      }

      if (isFirstChunk) { // Fallback if stream was empty
        setIsTyping(false);
      }

    } catch (error) {
      console.error("AI Error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Hidden on mobile, shown on desktop */}
      <div
        className="hidden md:fixed md:inset-0 md:z-40 md:bg-black/50 md:backdrop-blur-sm md:transition-opacity md:duration-300"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div className="fixed inset-0 z-[10000] flex flex-col bg-white transition-all duration-300 dark:bg-gray-800 md:inset-auto md:bottom-20 md:right-4 md:h-[500px] md:w-full md:max-w-md md:rounded-2xl md:border md:border-gray-200 md:shadow-2xl dark:md:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#115e59] px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Plas Agent</h3>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close chat"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-[#115e59] text-white"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                }`}
              >
                <div 
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: message.text
                      // Convert markdown bold to HTML bold
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      // Convert markdown asterisk bullet point to a proper dot bullet point
                      .replace(/(^|\n)\*\s/g, '$1• ')
                      // Make sure links are clickable (if model passes them)
                      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-[#115e59] underline hover:text-green-700">$1</a>')
                  }}
                />
                <span
                  className={`mt-1 block text-xs ${
                    message.sender === "user"
                      ? "text-white/70"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-700">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-green-400"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#115e59] text-white transition-all duration-200 hover:bg-[#197a74] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#115e59]"
              aria-label="Send message"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Powered by Firebase AI Logic
          </p>
        </div>
      </div>
    </>
  );
}
