import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getGenerativeModel } from "firebase/ai";
import { ai } from "../../lib/firebase";
import { useCart } from "../../context/CartContext";
import { useFoodCart } from "../../context/FoodCartContext";

interface CartConfirmPayload {
  product_id: string;
  shop_id: string;
  product_name: string;
  price: number | string;
  quantity: number;
  image?: string;
  item_source?: "Shop" | "Restaurant" | "BusinessStore";
  cart_payload?: any;
  restaurant_payload?: any;
  dish_payload?: any;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  // Optional: cart confirmation action card
  cartConfirm?: CartConfirmPayload;
  cartAdded?: boolean; // true after successful add
  isComplete?: boolean; // true after streaming finishes
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
          <a 
            href={payload.item_source === "Restaurant" ? "/Cart/FoodCart" : "/Cart"} 
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#115e59] to-[#047857] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
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


// ─── Message Text Formatter ──────────────────────────────────────────────────
// Safely converts Markdown to HTML using a placeholder system to avoid 
// nested/mangled tags during multiple replacement passes.
function formatMessageText(text: string, isComplete?: boolean): string {
  const imagePlaceholders: string[] = [];
  const linkPlaceholders: string[] = [];

  // 1. Collect Images: ![alt](url)
  // We do this first so images don't get matched by the link regex.
  let processed = text.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (match, alt, url) => {
    const idx = imagePlaceholders.length;
    // Remove all whitespace (crucial for long Base64 strings with newlines)
    const sanitizedUrl = url.replace(/\s+/g, "");
    
    // SAFETY: If it's a huge data URL and the message isn't complete yet, 
    // we don't render it to avoid "appearing/disappearing" and chrome errors.
    if (sanitizedUrl.startsWith("data:") && !isComplete) {
      return `[AI is sending an image...]`;
    }

    if (alt === "Thumb") {
      imagePlaceholders.push(
        `<img src="${sanitizedUrl}" alt="Recipe" onerror="this.onerror=null; this.src='/images/groceryPlaceholder.png';" style="display:block; width:100%; max-width:280px; height:160px; border-radius:16px; object-fit:cover; margin:8px 0; box-shadow:0 4px 12px rgba(0,0,0,0.12);" />`
      );
    } else {
      imagePlaceholders.push(
        `<img src="${sanitizedUrl}" alt="${alt}" onerror="this.onerror=null; this.src='/images/groceryPlaceholder.png';" style="display:inline-block; height:24px; width:24px; border-radius:9999px; object-fit:cover; vertical-align:middle; margin-right:4px;" />`
      );
    }
    return `__IMG_${idx}__`;
  });

  // 2. Collect Links: [label](url)
  processed = processed.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (match, label, url) => {
    const idx = linkPlaceholders.length;
    const sanitizedUrl = url.trim();
    linkPlaceholders.push(
      `<a href="${sanitizedUrl}" class="text-[#115e59] underline hover:text-green-700 font-medium">${label}</a>`
    );
    return `__LINK_${idx}__`;
  });

  // 3. Simple Formatting (Bold & Bullets)
  processed = processed
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\n)\*\s/g, "$1• ");

  // 4. Standalone Image URLs (Base64) - only render if complete
  // IMPORTANT: We remove \s from the set to prevent greedy matching across 
  // lines which was corrupting the rest of the AI message.
  processed = processed.replace(/(data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+)/g, (match) => {
    if (!isComplete) return `[AI is sending an image...]`;

    const idx = imagePlaceholders.length;
    const sanitizedBase64 = match.replace(/\s+/g, "");
    imagePlaceholders.push(
      `<img src="${sanitizedBase64}" alt="Image" onerror="this.onerror=null; this.src='/images/groceryPlaceholder.png';" style="display:block; width:100%; max-width:280px; border-radius:16px; object-fit:cover; margin:8px 0; box-shadow:0 4px 12px rgba(0,0,0,0.12);" />`
    );
    return `__IMG_${idx}__`;
  });

  // 5. Restore Placeholders (Links first, then Images)
  processed = processed.replace(/__LINK_(\d+)__/g, (_, i) => linkPlaceholders[parseInt(i)]);
  processed = processed.replace(/__IMG_(\d+)__/g, (_, i) => imagePlaceholders[parseInt(i)]);

  return processed;
}

export default function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";
  
  // Cart Contexts
  const shopCart = useCart();
  const foodCart = useFoodCart();

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
              description: "Add an item to the user's cart. Use the 'ordering_payload' provided in the search results.",
              parameters: {
                type: "OBJECT",
                properties: {
                  product_name: { type: "STRING", description: "Name of the item." },
                  price: { type: "NUMBER", description: "Price in RWF." },
                  quantity: { type: "NUMBER", description: "Quantity to add." },
                  image: { type: "STRING", description: "Product image URL." },
                  ordering_payload: { type: "STRING", description: "The EXACT ordering_payload string from the search result. Do not modify it." }
                },
                required: ["product_name", "price", "ordering_payload"]
              }
            }
          ]
        } as any]
      });

      // Prepare chat history (exclude initial greeting and merge consecutive turns to satisfy Gemini API requirements)
      const history: any[] = [];
      messages
        .filter(m => m.id !== "1" && m.text.trim() !== "")
        .forEach(m => {
          const role = (m.sender === "user" ? "user" : "model") as "user" | "model";
          const last = history[history.length - 1];
          if (last && last.role === role) {
            // Append text to the previous entry of the same role
            last.parts[0].text += "\n\n" + m.text;
          } else {
            history.push({
              role,
              parts: [{ text: m.text }]
            });
          }
        });

      const chat = model.startChat({
        history,
        systemInstruction: {
          role: "system",
          parts: [{ text: `You are Plas Agent, a helpful, friendly AI assistant for the Plas grocery & dining app. You can help with shopping, orders, food recommendations, store locations, recipes, and food-related topics!\n\nYou have access to FIVE tools:\n1. search_products — searches real-time grocery inventory and restaurant dishes.\n2. search_stores — searches shops, restaurants, and businesses.\n3. search_recipes — searches TheMealDB for cooking instructions.\n4. search_web — searches the web for food/cooking topics.\n5. add_to_cart — adds an item to the user's cart.\n\nCRITICAL RULES:\n- NEVER hallucinate or make up products, prices, or images. Only use what the tools return.\n- When you search for products, results include an 'ordering_payload' string for each item. NEVER make up your own IDs or payloads. If results are empty, tell the user you couldn't find anything.\n- To add an item, you MUST call "add_to_cart" and pass the EXACT 'ordering_payload' string found in the search result for that specific item.\n- ALWAYS ask for explicit confirmation before adding an item.\n- IMAGES: Tool results may contain huge Base64 strings. ALWAYS output them exactly as provided in markdown format, e.g., ![Logo](image_string). If the string looks truncated in the tool output, still use it; our system will handle the fallback.\n\nThe current date and time is ${new Date().toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric' })}. \n\nFormatting rules:\n- Stores: [![Logo](image_url)](/shops/shop_id) **Store Name**\n- Restaurants: [![Logo](image_url)](/restaurant/id) **Restaurant Name**\n- Businesses: [![Logo](image_url)](/plasBusiness/store/id) **Business Name**\n- Recipes: [![Thumb](image_url)](/Recipes/recipe_id) **Recipe Name**\n- Use • bullets. Keep responses concise.` }]
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

      let currentFunctionCall = await handleStream(inputValue);

      while (currentFunctionCall) {
        // Show typing while we process each step
        setIsTyping(true);
        
        try {
          const fnName = currentFunctionCall.name;
          const args = currentFunctionCall.args || currentFunctionCall.arguments || {};
          console.log(`[AI Chat] Handling function call: ${fnName}`, args);

          let apiUrl = "/api/ai/search-plas-data";
          let body: any = { action: fnName, params: args };
          let isDirectResponse = false;

          if (fnName === "search_recipes") {
            apiUrl = "/api/ai/search-recipes";
            body = { keyword: args.keyword || "", category: args.category || "" };
          } else if (fnName === "search_web") {
            apiUrl = "/api/ai/search-web";
            body = { query: args.query || "" };
          } else if (fnName === "add_to_cart") {
            const parsePayload = (val: any) => {
              if (!val) return null;
              if (typeof val === "object") return val;
              try { return JSON.parse(val); } catch (e) { return null; }
            };

            const ord_p = parsePayload(args.ordering_payload);
            if (!ord_p) {
               console.warn("[AI Chat] Missing or invalid ordering_payload from tool call. Args:", args);
            }

            const confirmPayload: CartConfirmPayload = {
              product_id: ord_p?.productId || ord_p?.dish_payload?.id || args.product_id || "",
              shop_id: ord_p?.shopId || ord_p?.restaurant_payload?.id || args.shop_id || "",
              product_name: args.product_name || ord_p?.dish_payload?.name || "Item",
              price: args.price || ord_p?.dish_payload?.price || 0,
              quantity: Number(args.quantity) || 1,
              image: args.image || ord_p?.dish_payload?.image,
              item_source: ord_p?.item_source as any,
              cart_payload: ord_p?.item_source === "Shop" ? ord_p : null,
              restaurant_payload: ord_p?.restaurant_payload || null,
              dish_payload: ord_p?.dish_payload || null,
            };
            
            console.log("[AI Chat] Cart confirm payload generated:", { 
              source: confirmPayload.item_source,
              productId: confirmPayload.product_id,
              shopId: confirmPayload.shop_id,
              parsedPayload: ord_p 
            });
            setIsTyping(false);
            
            // Mark previous search result as complete before showing the cart card
            setMessages(prev => prev.map(m => m.id === responseId ? { ...m, isComplete: true } : m));

            setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              text: "",
              sender: "ai",
              timestamp: new Date(),
              cartConfirm: confirmPayload,
              isComplete: true,
            }]);
            
            // Feed back to AI that we showed the card
            currentFunctionCall = await handleStream([{
              functionResponse: {
                name: fnName,
                response: { status: "confirmation_card_shown", message: "A confirmation card was displayed. User must confirm." }
              }
            }]);
            // If the AI has more tools to call after add_to_cart, the loop continues.
            // Usually it stops here or sends text.
            continue; 
          }

          // Default API call flow (for search tools)
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          const data = await response.json();
          console.log(`[AI Chat] Tool Response for ${fnName}:`, data);

          // Give results back to AI and get NEXT action
          currentFunctionCall = await handleStream([{
            functionResponse: {
              name: fnName,
              response: { results: data.results || [] }
            }
          }]);
          
        } catch (fnErr) {
          console.error("Function call error:", fnErr);
          currentFunctionCall = await handleStream([{
            functionResponse: {
              name: currentFunctionCall?.name || "unknown",
              response: { error: "Error contacting internal database API." }
            }
          }]);
        }
      }

      // Mark the final AI response as complete
      setMessages(prev => prev.map(m => m.id === responseId ? { ...m, isComplete: true } : m));

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
          isComplete: true,
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
    console.log("[AI Chat] Confirming cart item:", { payload, qty });
    try {
      if (payload.item_source === "Restaurant") {
        if (!foodCart) throw new Error("Food cart context not available");
        foodCart.addItem(payload.restaurant_payload, payload.dish_payload, qty);
      } else {
        // Default to Shop flow
        if (!shopCart) throw new Error("Shop cart context not available");
        const shopId = payload.cart_payload?.shopId || payload.shop_id;
        const productId = payload.cart_payload?.productId || payload.product_id;
        
        if (!shopId || !productId) {
          throw new Error("Missing shop_id or product_id for order");
        }

        await shopCart.addItem(shopId, productId, qty);
      }

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
                    __html: formatMessageText(message.text, message.isComplete)
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
