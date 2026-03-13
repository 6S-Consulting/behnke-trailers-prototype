import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, Maximize2, Bot, User, FileText, Image as ImageIcon, ShoppingCart, MessageSquarePlus } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  attachment?: {
    name: string;
    type: string;
    url?: string;
  };
  suggestedActions?: string[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hi there! How can I help you today? Upload a product file or ask me anything about our hydraulic pumps.", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { navigate } = useRouter();
  const { addToCart, openCart } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectProductFile = (fileName: string): boolean => {
    const productKeywords = ['product', 'pump', 'hydraulic', 'order', 'quote', 'item', 'part'];
    const lowerName = fileName.toLowerCase();
    return productKeywords.some(keyword => lowerName.includes(keyword));
  };

  const addRandomProductsToCart = (count: number = 5) => {
    const availableProducts = products.filter(p => p.stockStatus === 'In Stock');
    const selectedProducts: typeof products = [];
    
    // Randomly select products
    for (let i = 0; i < Math.min(count, availableProducts.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableProducts.length);
      selectedProducts.push(availableProducts[randomIndex]);
      availableProducts.splice(randomIndex, 1); // Remove to avoid duplicates
    }

    // Add to cart with random quantities
    selectedProducts.forEach(product => {
      const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 units
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
      sender: 'user',
      timestamp: new Date(),
      attachment: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile)
      } : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    
    const userInput = inputText.toLowerCase();
    const hadFile = selectedFile !== null;
    const wasProductFile = hadFile && detectProductFile(selectedFile.name);
    
    setInputText("");
    setSelectedFile(null);

    // Bot Response Logic
    setTimeout(() => {
      let botResponse = "";
      let suggestedActions: string[] = [];

      // Check if user wants to add to cart
      if (userInput.includes('add') && (userInput.includes('cart') || userInput.includes('products'))) {
        const addedCount = addRandomProductsToCart(5);
        botResponse = `Great! I've added ${addedCount} products to your cart with varying quantities. You can review them in your cart.`;
        suggestedActions = ['View my cart', 'Request a quote'];
      }
      // Check if file was uploaded
      else if (hadFile) {
        if (wasProductFile) {
          botResponse = `I've received your product file "${selectedFile?.name}". I can see product details in this file. Would you like me to add these products to your cart?`;
          suggestedActions = ['Add these products to cart', 'Tell me more about these products', 'Request a quote'];
        } else {
          botResponse = `Thank you for uploading "${selectedFile?.name}". I've received your file. How can I assist you with this?`;
          suggestedActions = ['I have a question', 'Request a quote'];
        }
      }
      // General inquiry responses
      else if (userInput.includes('price') || userInput.includes('cost')) {
        botResponse = "Our hydraulic pumps range from $84.99 to $225.00 depending on flow rate and pressure. Would you like to see our catalog?";
        suggestedActions = ['Show me the catalog', 'Tell me about discounts', 'Request a quote'];
      }
      else if (userInput.includes('shipping') || userInput.includes('delivery')) {
        botResponse = "Free shipping and returns available on all orders! We ship all US domestic orders within 5-10 business days. Expedited shipping is available upon request.";
        suggestedActions = ['What are shipping costs?', 'Track my order'];
      }
      else if (userInput.includes('warranty')) {
        botResponse = "All HYDRAULIC pumps products come with a 2-year manufacturer's warranty. That's 24 months of peace of mind!";
        suggestedActions = ['Learn more about warranty', 'Request a quote'];
      }
      else if (userInput.includes('stock') || userInput.includes('available')) {
        botResponse = "Most of our products are in stock and ready to ship. You can check specific product availability on our catalog page.";
        suggestedActions = ['View catalog', 'Check specific product'];
      }
      else {
        botResponse = "Thanks for your message. Our team is here to help with product selection, quotes, and technical specifications. What would you like to know?";
        suggestedActions = ['View catalog', 'Request a quote'];
      }

      setMessages(prev => [...prev, {
        id: Date.now(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined
      }]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleMaximize = () => {
    setIsOpen(false);
    navigate('/support-chat');
  };

  const handleSuggestedAction = (action: string) => {
    const lowerAction = action.toLowerCase();
    
    // Handle cart-related actions
    if (lowerAction.includes('view') && lowerAction.includes('cart')) {
      openCart();
      return;
    }
    
    // Handle navigation actions
    if (lowerAction.includes('catalog') || lowerAction.includes('products')) {
      setIsOpen(false);
      navigate('/catalog');
      return;
    }
    
    if (lowerAction.includes('quote')) {
      setIsOpen(false);
      navigate('/request-quote');
      return;
    }
    
    if (lowerAction.includes('technical support') || lowerAction.includes('contact support')) {
      setIsOpen(false);
      navigate('/support-chat');
      return;
    }
    
    // Default: populate input box
    setInputText(action);
  };

  const handleNewChat = () => {
    setMessages([
      { 
        id: Date.now(), 
        text: "Hi there! How can I help you today? Upload a product file or ask me anything about our hydraulic pumps.", 
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setInputText("");
    setSelectedFile(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
      {isOpen && (
        <div className="mb-4 w-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 ease-out animate-in slide-in-from-bottom-5 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Support Chat</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-[11px] text-white/80">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleNewChat}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="New chat"
                title="Start new conversation"
              >
                <MessageSquarePlus size={16} />
              </button>
              <button 
                onClick={handleMaximize}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Maximize chat"
                title="Open in full screen"
              >
                <Maximize2 size={16} />
              </button>
              <button 
                onClick={handleClose} 
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Close chat"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={`overflow-y-auto bg-slate-50/50 p-4 space-y-4 transition-all ${selectedFile ? 'h-[360px]' : 'h-[420px]'}`}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <div 
                  className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-[#4567a4] mt-1">
                      <Bot size={14} />
                    </div>
                  )}
                  
                  <div className={`flex max-w-[80%] flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                        msg.sender === 'user' 
                          ? 'bg-[#4567a4]/10 border border-[#4567a4]/30 text-[#4567a4] rounded-br-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                      
                      {msg.attachment && (
                        <div className={`mt-2 flex items-center gap-2 rounded-lg p-2 ${
                          msg.sender === 'user' ? 'bg-[#4567a4]/20' : 'bg-slate-50'
                        }`}>
                          <div className={`flex h-8 w-8 items-center justify-center rounded ${
                            msg.sender === 'user' ? 'bg-white/20' : 'bg-[#4567a4]/20 text-[#4567a4]'
                          }`}>
                            {msg.attachment.type.startsWith('image') ? (
                              <ImageIcon size={16} />
                            ) : (
                              <FileText size={16} />
                            )}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-xs font-medium max-w-[120px]">{msg.attachment.name}</span>
                            <span className={`text-[10px] uppercase ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                              {msg.attachment.type.split('/')[1] || 'FILE'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="mt-1 text-[10px] text-slate-400">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 mt-1">
                      <User size={14} />
                    </div>
                  )}
                </div>

                {/* Suggested Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-2 ml-9 flex flex-wrap gap-2">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedAction(action)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#4567a4]/30 bg-[#4567a4]/10 px-3 py-1.5 text-xs font-medium text-[#4567a4] hover:bg-[#4567a4]/20 hover:border-[#4567a4]/50 transition-colors"
                      >
                        {action.toLowerCase().includes('cart') && <ShoppingCart size={12} />}
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-100 bg-white p-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#4567a4] focus-within:ring-1 focus-within:ring-[#4567a4] transition-all">
              
              {/* File Preview */}
              {selectedFile && (
                <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 flex-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-[#4567a4]/20 text-[#4567a4] shrink-0">
                      {selectedFile.type.startsWith('image/') ? (
                        <ImageIcon size={14} />
                      ) : (
                        <FileText size={14} />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs font-medium text-slate-700 truncate">{selectedFile.name}</span>
                      <span className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button 
                      onClick={removeFile} 
                      className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X size={12} />
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                </button>
                
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="max-h-24 min-h-[36px] w-full resize-none bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  rows={1}
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    e.currentTarget.style.height = 'auto';
                    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                  }}
                />

                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim() && !selectedFile}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white hover:opacity-90"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}
