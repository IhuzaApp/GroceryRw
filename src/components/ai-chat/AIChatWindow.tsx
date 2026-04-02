import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getGenerativeModel } from "firebase/ai";
import { ai } from "../../lib/firebase";

interface CartConfirmPayload {
  product_id: string;
  shop_id: string;
  product_name: string;
  price: number | string;
  quantity: number;
  image?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  // Optional: cart confirmation action card
  cartConfirm?: CartConfirmPayload;
  cartAdded?: boolean; // true after successful add
}

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Cart Confirmation Card ────────────────────────────────────────────────────
function CartConfirmCard({
  msgId,
  payload,
  isDone,
  onConfirm,
  onDecline,
}: {
  msgId: string;
  payload: CartConfirmPayload;
  isDone?: boolean;
  onConfirm: (msgId: string, payload: CartConfirmPayload, qty: number) => void;
  onDecline: (msgId: string) => void;
}) {
  const [qty, setQty] = React.useState(payload.quantity || 1);
  if (isDone) {
    return (
      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="max-w-[85%] rounded-3xl rounded-tl-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white text-lg">✓</div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Added to cart!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{payload.product_name} ×{qty}</p>
            </div>
          </div>
          <a href="/Cart" className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#115e59] to-[#047857] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
            🛒 Go to Cart &amp; Checkout →
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="max-w-[85%] overflow-hidden rounded-3xl rounded-tl-sm border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        {/* Product header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#064e3b]/10 to-[#047857]/5 px-4 py-3 dark:from-[#064e3b]/30">
          <img
            src={payload.image || "/images/groceryPlaceholder.png"}
            alt={payload.product_name}
            className="h-12 w-12 rounded-xl object-cover shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).src = "/images/groceryPlaceholder.png"; }}
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-gray-800 dark:text-white">{payload.product_name}</p>
            <p className="text-xs font-semibold text-[#115e59]">{Number(payload.price).toLocaleString()} RWF</p>
          </div>
        </div>
        {/* Quantity + actions */}
        <div className="px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Quantity</span>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-2 py-1 dark:border-gray-600">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">−</button>
              <span className="w-6 text-center text-sm font-bold text-gray-800 dark:text-white">{qty}</span>
              <button onClick={() => setQty(q => Math.min(20, q + 1))} className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">+</button>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Icon-only Add to Cart button */}
            <button
              onClick={() => onConfirm(msgId, payload, qty)}
              title="Add to cart"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#115e59] to-[#047857] py-2.5 text-white shadow-sm transition hover:opacity-90 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                <line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/>
              </svg>
            </button>
            <button
              onClick={() => onDecline(msgId)}
              className="flex-1 rounded-2xl border border-gray-200 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >No thanks</button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";

  const getInitialMessage = () => ({
    id: "1",
    text: `Hey there, ${userName}! 👋 I'm Plas Agent, your personal grocery & dining assistant! Whether you're craving a quick bite, hunting for the best deals, or planning your weekly shopping, I'm here to help. What's on your mind today? 🍔🛒`,
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

  // Hook dedicated ONLY to resetting the chat state when closing
  useEffect(() => {
    if (!isOpen) {
      setMessages([getInitialMessage()]);
      setInputValue("");
      setIsTyping(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
            },
            {
              name: "search_recipes",
              description: "Search for recipe ideas and cooking instructions from a global recipe database. Use this when the user asks how to cook something, wants recipe ideas, or asks about ingredients for a dish.",
              parameters: {
                type: "OBJECT",
                properties: {
                  keyword: { type: "STRING", description: "The recipe name or main ingredient to search for, e.g., 'pasta', 'chicken', 'chocolate cake'." },
                  category: { type: "STRING", description: "Filter by meal category, e.g., 'Seafood', 'Chicken', 'Vegan', 'Dessert'. Use this for broad category requests." }
                }
              }
            },
            {
              name: "search_web",
              description: "Search the web for any recipe-related question that the recipe database may not cover — e.g. cooking tips, nutrition facts, substitution advice, dish history, or any food topic the user is curious about.",
              parameters: {
                type: "OBJECT",
                properties: {
                  query: { type: "STRING", description: "A specific, focused search query about food, cooking, or nutrition, e.g., 'how to make fluffy scrambled eggs without butter'." }
                },
                required: ["query"]
              }
            },
            {
              name: "add_to_cart",
              description: "Add a specific shop product to the user's cart. ONLY use this AFTER the user explicitly confirms they want to add an item. The product_id and shop_id must come from a prior search_products result.",
              parameters: {
                type: "OBJECT",
                properties: {
                  product_id: { type: "STRING", description: "The exact UUID of the product from the search_products result." },
                  shop_id: { type: "STRING", description: "The exact UUID of the shop from the search_products result." },
                  product_name: { type: "STRING", description: "Human-readable product name to display in the confirmation card." },
                  price: { type: "NUMBER", description: "The product price in RWF." },
                  quantity: { type: "NUMBER", description: "How many units to add, default 1." },
                  image: { type: "STRING", description: "Optional image URL of the product or its store logo." }
                },
                required: ["product_id", "shop_id", "product_name", "price"]
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
          parts: [{ text: `You are Plas Agent, a helpful, friendly AI assistant for the Plas grocery & dining app. You can help with shopping, orders, food recommendations, store locations, recipes, and food-related topics!\n\nYou have access to FIVE tools:\n1. search_products — searches real-time grocery inventory from shops (with prices, product_id, shop_id).\n2. search_stores — searches shops, restaurants, and businesses (with coordinates, operating hours, reviews).\n3. search_recipes — searches TheMealDB for step-by-step cooking instructions.\n4. search_web — searches the web for food/recipe topics NOT in the recipe database.\n5. add_to_cart — adds a shop product to the user's cart. ONLY call this AFTER the user explicitly says YES/confirm. DO NOT call add_to_cart unprompted — always ask first: "Would you like me to add [item] to your cart?".\n\nWhen the user asks to order something or you suggest a product: first show it with search_products, then ASK: "Would you like me to add [product name] to your cart?" — wait for confirmation before calling add_to_cart.\n\nThe current date and time is ${new Date().toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric' })}. Use this to determine if a store is currently open.\n\nFormatting rules:\n- Stores: [![Logo](image_url)](/shops/shop_id) **Store Name**\n- Restaurants: [![Logo](image_url)](/restaurant/id) **Restaurant Name**\n- Businesses: [![Logo](image_url)](/plasBusiness/store/id) **Business Name**\n- Recipes: [![Thumb](image_url)](/Recipes/recipe_id) **Recipe Name**, then full instructions.\n- Never share raw Google or DuckDuckGo URLs.\n- Use • bullets or numbered steps. Keep responses concise and scannable.` }]
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

          let apiUrl = "/api/ai/search-plas-data";
          let body: any = { action: fnName, params: args };

          // Route recipes calls to a separate lightweight endpoint
          if (fnName === "search_recipes") {
            apiUrl = "/api/ai/search-recipes";
            body = { keyword: args.keyword || "", category: args.category || "" };
          } else if (fnName === "search_web") {
            apiUrl = "/api/ai/search-web";
            body = { query: args.query || "" };
          } else if (fnName === "add_to_cart") {
            // Show an inline confirmation card in the chat instead of calling the API immediately
            const confirmPayload: CartConfirmPayload = {
              product_id: args.product_id,
              shop_id: args.shop_id,
              product_name: args.product_name || "Item",
              price: args.price || 0,
              quantity: Number(args.quantity) || 1,
              image: args.image,
            };
            setIsTyping(false);
            setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              text: "",
              sender: "ai",
              timestamp: new Date(),
              cartConfirm: confirmPayload,
            }]);
            // Tell AI the card was shown so it can send a follow-up message
            await handleStream([{
              functionResponse: {
                name: fnName,
                response: { status: "confirmation_card_shown", message: "A confirmation card was displayed to the user. Wait for user to click 'Yes, add it!' or 'No thanks'." }
              }
            }]);
            return; // Don't proceed with normal API call
          }

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
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

  // Handle cart confirmation — called when user clicks "Yes, add it!" on the inline card
  const handleConfirmCart = async (msgId: string, payload: CartConfirmPayload, qty: number) => {
    try {
      const res = await fetch("/api/ai/search-plas-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_to_cart",
          params: { product_id: payload.product_id, shop_id: payload.shop_id, quantity: qty },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      // Mark the card as "added"
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, cartAdded: true } : m));

      // Add a follow-up AI message
      setMessages(prev => [...prev, {
        id: (Date.now() + 3).toString(),
        text: `✅ **${payload.product_name}** (×${qty}) has been added to your cart! Ready to checkout? Head to your cart whenever you're ready. 🛒`,
        sender: "ai",
        timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 3).toString(),
        text: `❌ Oops! I couldn't add that to your cart right now. Please try adding it manually from the shop page.`,
        sender: "ai",
        timestamp: new Date(),
      }]);
    }
  };

  const handleDeclineCart = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, cartAdded: false, cartConfirm: { ...m.cartConfirm!, quantity: -1 } } : m));
    setMessages(prev => [...prev, {
      id: (Date.now() + 3).toString(),
      text: `No problem! Let me know if there's anything else I can help you with. 😊`,
      sender: "ai",
      timestamp: new Date(),
    }]);
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
      <div className="fixed inset-0 z-[10000] flex flex-col overflow-hidden bg-white/95 backdrop-blur-2xl transition-all duration-300 dark:bg-gray-900/95 md:inset-auto md:bottom-24 md:right-6 md:h-[600px] md:w-full md:max-w-md md:rounded-3xl md:border md:border-white/20 md:shadow-[0_20px_50px_-12px_rgba(17,94,89,0.3)] dark:md:border-gray-700/50">
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#064e3b] via-[#115e59] to-[#047857] px-6 py-4 shadow-md">
          {/* Subtle lime accent line */}
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#84cc16] to-transparent opacity-50"></div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {/* Active pulsing dot */}
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#84cc16] opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#84cc16]"></span>
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white drop-shadow-sm">Plas Agent</h3>
              <p className="text-xs font-medium text-[#84cc16]">Online & Ready</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-110 active:scale-95"
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
        <div className="flex-1 space-y-5 overflow-y-auto p-5 pb-6">
          {messages.map((message) => {
            // Cart confirmation card — special render
            if (message.cartConfirm && message.cartConfirm.quantity !== -1) {
              return (
                <CartConfirmCard
                  key={message.id}
                  msgId={message.id}
                  payload={message.cartConfirm}
                  isDone={message.cartAdded}
                  onConfirm={handleConfirmCart}
                  onDecline={handleDeclineCart}
                />
              );
            }

            // Standard message bubble
            return (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } animate-in fade-in slide-in-from-bottom-3 duration-300`}
            >
              <div
                className={`max-w-[85%] rounded-3xl px-5 py-3.5 shadow-sm ${
                  message.sender === "user"
                    ? "rounded-tr-sm bg-gradient-to-br from-[#115e59] to-[#047857] text-white shadow-[#115e59]/20"
                    : "rounded-tl-sm bg-white border border-gray-100 text-gray-800 shadow-gray-200/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:shadow-none"
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
                      // Recipe thumbnails (![Thumb](url)) — large card style. Handles both http URLs and data: URIs
                      .replace(/!\[Thumb\]\(([^)]*)\)/g, '<img src="$1" alt="Recipe" onerror="this.onerror=null; this.src=\'/images/groceryPlaceholder.png\';" style="display:block; width:100%; max-width:280px; height:160px; border-radius:16px; object-fit:cover; margin:8px 0; box-shadow:0 4px 12px rgba(0,0,0,0.12);" />')
                      // Standalone base64 images (no markdown wrapper) — render as large card
                      .replace(/(data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+)/g, '<img src="$1" alt="Image" onerror="this.onerror=null; this.src=\'/images/groceryPlaceholder.png\';" style="display:block; width:100%; max-width:280px; border-radius:16px; object-fit:cover; margin:8px 0; box-shadow:0 4px 12px rgba(0,0,0,0.12);" />')
                      // Store/restaurant logos (![Logo](url)) — small circular icon. [^)]* handles base64 data URIs too
                      .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, '<img src="$2" alt="$1" onerror="this.onerror=null; this.src=\'/images/groceryPlaceholder.png\';" style="display:inline-block; height:24px; width:24px; border-radius:9999px; object-fit:cover; vertical-align:middle; margin-right:4px;" />')
                      // Make clickable links
                      .replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2" class="text-[#115e59] underline hover:text-green-700">$1</a>')
                  }}
                />
                <span
                  className={`mt-2 block text-[10px] font-medium tracking-wider uppercase ${
                    message.sender === "user"
                      ? "text-white/60"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-2xl rounded-tl-sm bg-white/80 border border-gray-100 px-5 py-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="flex space-x-1.5 items-center">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#115e59]/60 [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#115e59]/80 [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#115e59]"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 bg-white/80 backdrop-blur-xl p-4 dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50/50 px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-inner focus:border-[#84cc16] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#84cc16]/10 transition-all dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100 dark:focus:bg-gray-800"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#115e59] to-[#047857] text-white shadow-md shadow-[#115e59]/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#115e59]/40 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Send message"
            >
              <svg
                className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-active:translate-x-0 group-active:translate-y-0"
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

        </div>
      </div>
    </>
  );
}
