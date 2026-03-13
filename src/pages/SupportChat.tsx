import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Bot,
  User,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/router";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  attachment?: {
    name: string;
    type: string;
    url?: string;
  };
  suggestedActions?: string[];
}

export function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Welcome to our support center. How can we help you with product selection, quotes, or technical specifications today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { navigate } = useRouter();
  const { addToCart, openCart } = useCart();

  const detectProductFile = (fileName: string): boolean => {
    const productKeywords = [
      "product",
      "pump",
      "hydraulic",
      "order",
      "quote",
      "item",
      "part",
    ];
    const lowerName = fileName.toLowerCase();
    return productKeywords.some((keyword) => lowerName.includes(keyword));
  };

  const addRandomProductsToCart = (count: number = 5) => {
    const availableProducts = products.filter(
      (p) => p.stockStatus === "In Stock",
    );
    const selectedProducts: typeof products = [];

    for (let i = 0; i < Math.min(count, availableProducts.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableProducts.length);
      selectedProducts.push(availableProducts[randomIndex]);
      availableProducts.splice(randomIndex, 1);
    }

    selectedProducts.forEach((product) => {
      const quantity = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    });

    return selectedProducts.length;
  };

  const handleSend = () => {
    if (!inputText.trim() && !selectedFile) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
      attachment: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            url: URL.createObjectURL(selectedFile),
          }
        : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);

    const userInput = inputText.toLowerCase();
    const hadFile = selectedFile !== null;
    const wasProductFile = hadFile && detectProductFile(selectedFile.name);

    setInputText("");
    setSelectedFile(null);

    setTimeout(() => {
      let botResponse = "";
      let suggestedActions: string[] = [];

      if (
        userInput.includes("add") &&
        (userInput.includes("cart") || userInput.includes("products"))
      ) {
        const addedCount = addRandomProductsToCart(5);
        botResponse = `Great! I've added ${addedCount} products to your cart with varying quantities. You can review them in your cart.`;
        suggestedActions = ["View my cart", "Request a quote"];
      } else if (hadFile) {
        if (wasProductFile) {
          botResponse = `I've received your product file "${selectedFile?.name}". I can see product details in this file. Would you like me to add these products to your cart?`;
          suggestedActions = [
            "Add these products to cart",
            "Tell me more about these products",
            "Request a quote",
          ];
        } else {
          botResponse = `Thank you for uploading "${selectedFile?.name}". I've received your file. How can I assist you with this?`;
          suggestedActions = ["I have a question", "Request a quote"];
        }
      } else if (userInput.includes("price") || userInput.includes("cost")) {
        botResponse =
          "Our hydraulic pumps range from $84.99 to $225.00 depending on flow rate and pressure. Would you like to see our catalog?";
        suggestedActions = [
          "Show me the catalog",
          "Tell me about discounts",
          "Request a quote",
        ];
      } else if (
        userInput.includes("shipping") ||
        userInput.includes("delivery")
      ) {
        botResponse =
          "Free shipping and returns available on all orders! We ship all US domestic orders within 5-10 business days. Expedited shipping is available upon request.";
        suggestedActions = ["What are shipping costs?", "Track my order"];
      } else if (userInput.includes("warranty")) {
        botResponse =
          "All HYDRAULIC pumps products come with a 2-year manufacturer's warranty. That's 24 months of peace of mind!";
        suggestedActions = ["Learn more about warranty", "Request a quote"];
      } else if (
        userInput.includes("stock") ||
        userInput.includes("available")
      ) {
        botResponse =
          "Most of our products are in stock and ready to ship. You can check specific product availability on our catalog page.";
        suggestedActions = ["View catalog", "Check specific product"];
      } else {
        botResponse =
          "Thanks for your message. Our team is here to help with product selection, quotes, and technical specifications. What would you like to know?";
        suggestedActions = ["View catalog", "Request a quote"];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: botResponse,
          sender: "bot",
          timestamp: new Date(),
          suggestedActions:
            suggestedActions.length > 0 ? suggestedActions : undefined,
        },
      ]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSuggestedAction = (action: string) => {
    const lowerAction = action.toLowerCase();

    if (lowerAction.includes("view") && lowerAction.includes("cart")) {
      openCart();
      return;
    }

    if (lowerAction.includes("catalog") || lowerAction.includes("products")) {
      navigate("/catalog");
      return;
    }

    if (lowerAction.includes("quote")) {
      navigate("/request-quote");
      return;
    }

    setInputText(action);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 h-[calc(100vh-80px)]">
      <div className="grid h-full grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl lg:grid-cols-4">
        {/* Sidebar */}
        <div className="hidden border-r border-slate-100 bg-slate-50 p-6 lg:block">
          <div className="mb-8">
            <h2 className="mb-2 text-lg font-bold text-slate-900">
              Support Center
            </h2>
            <p className="text-sm text-slate-500">
              We are here to help you 24/7.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-sm mb-1">Contact Info</h3>
              <p className="text-xs text-slate-500">
                support@hydraulicpumps.com
              </p>
              <p className="text-xs text-slate-500 mt-1">+1 (800) 555-0123</p>
            </div>

            <div className="rounded-xl bg-[#4567a4]/10 p-4 border border-[#4567a4]/30">
              <h3 className="font-semibold text-sm mb-1 text-[#4567a4]">
                Operating Hours
              </h3>
              <p className="text-xs text-[#4567a4]/70">Mon-Fri: 8am - 6pm EST</p>
              <p className="text-xs text-[#4567a4]/70 mt-1">Sat: 9am - 1pm EST</p>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="col-span-1 flex flex-col lg:col-span-3 bg-white h-full overflow-hidden">
          {/* Chat Header */}
          <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white shadow-md">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Customer Support</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-slate-500">
                    Online Now
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages - Scrollable Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#cbd5e1 #f1f5f9",
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "bot" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-[#4567a4] mt-1">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`flex max-w-[80%] flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#4567a4]/10 border border-[#4567a4]/30  text-black rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      {msg.text && <p>{msg.text}</p>}

                      {msg.attachment && (
                        <div
                          className={`mt-2 flex items-center gap-3 rounded-lg p-2 ${
                            msg.sender === "user"
                              ? "bg-white/10 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-white/20">
                            {msg.attachment.type.startsWith("image") ? (
                              <ImageIcon size={20} />
                            ) : (
                              <FileText size={20} />
                            )}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-xs font-medium max-w-[150px]">
                              {msg.attachment.name}
                            </span>
                            <span className="text-[10px] opacity-70 uppercase">
                              {msg.attachment.type.split("/")[1] || "FILE"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="mt-1.5 text-[11px] text-slate-400">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {msg.sender === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 mt-1">
                      <User size={16} />
                    </div>
                  )}
                </div>

                {/* Suggested Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 ml-12 flex flex-wrap gap-2">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedAction(action)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#4567a4]/30 bg-[#4567a4]/10 px-3 py-1.5 text-xs font-medium text-[#4567a4] hover:bg-[#4567a4]/20 hover:border-[#4567a4]/50 transition-colors"
                      >
                        {action.toLowerCase().includes("cart") && (
                          <ShoppingCart size={12} />
                        )}
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t border-slate-100 bg-white p-4 lg:p-6">
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-[#4567a4] focus-within:ring-1 focus-within:ring-[#4567a4] transition-all shadow-sm">
              {/* File Preview Area */}
              {selectedFile && (
                <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 first:rounded-t-2xl">
                  <div className="relative flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded  text-[#4567a4]">
                      {selectedFile.type.startsWith("image/") ? (
                        <ImageIcon size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 max-w-[200px] truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      onClick={removeFile}
                      className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-red-500 transition-colors"
                      aria-label="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-2 p-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                  title="Attach file"
                >
                  <Paperclip size={20} />
                </button>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  className="max-h-32 min-h-[44px] w-full resize-none bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  rows={1}
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height =
                      e.currentTarget.scrollHeight + "px";
                  }}
                />

                <Button
                  onClick={handleSend}
                  size="icon"
                  disabled={!inputText.trim() && !selectedFile}
                  className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% "
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">
              Typically replies within a few minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
