import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/lib/router';
import { useQuotes } from '@/context/QuoteContext';
import { X, Trash2, Plus, Minus, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chatbot } from '@/components/chat/Chatbot';
import hoseImg from '@/assets/images/tools/hose_Fiffings-01.webp';
import toolsImg from '@/assets/images/tools/hydraulic_tools-01.webp';
import powerUnitImg from '@/assets/images/tools/power_unit_1.webp';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isCartOpen, closeCart, items, removeFromCart, updateQuantity, cartTotal, clearCart, addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { navigate, route } = useRouter();
  const { addQuote } = useQuotes();

  React.useEffect(() => {
    // Ensure consistent UX across pages.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route]);

  const handleCheckout = () => {
    closeCart();
    if (!isLoggedIn) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleRequestQuote = () => {
    if (!isLoggedIn) {
      closeCart();
      navigate('/login?redirect=/account');
      return;
    }
    
    addQuote({
        items: [...items],
        total: cartTotal,
    });
    
    clearCart();
    closeCart();
    navigate('/account?tab=quotes'); 
  };

  const suggestions = [
    { id: 'acc-power-unit', name: 'Power Unit', image: powerUnitImg, price: 849.00 },
    { id: 'acc-hose', name: 'Hoses & Fittings', image: hoseImg, price: 45.00 },
    { id: 'acc-tool', name: 'Hydraulic Tools', image: toolsImg, price: 19.99 },
  ];

  const handleAddSuggestion = (item: typeof suggestions[0]) => {
     const product = {
        id: item.id,
        name: item.name,
        category: 'Accessories',
        price: item.price,
        primaryImage: item.image,
        secondaryImage: item.image,
        image: item.image,
        description: `High quality ${item.name}`,
        specs: {
            displacement: 'N/A',
            maxPressure: 'N/A',
            maxSpeed: 'N/A',
            mounting: 'Universal'
        },
        stockStatus: 'In Stock' as const,
        stock: 100,
        inStock: true,
        sku: `SKU-${item.id}`,
        baseCost: item.price * 0.5,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        collections: [],
        features: []
     };
     addToCart(product, false);
  };

  const showRequestQuote = cartTotal > 5000 || items.reduce((acc, item) => acc + item.quantity, 0) > 50;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 selection:bg-[#4567a4]/20 selection:text-[#4567a4]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />

      {/* Cart Sidebar Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={closeCart}
          />
          
          {/* Sidebar */}
          <div className="relative h-full w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900">Shopping Cart ({items.length})</h2>
                <button onClick={closeCart} className="text-slate-400 hover:text-slate-900">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center text-slate-500">
                    <p className="mb-4">Your cart is empty.</p>
                    <Button onClick={closeCart} variant="outline">Continue Browsing</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-slate-100 border border-slate-200">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
                            <p className="text-xs text-slate-500">{item.category}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded border border-slate-200">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-slate-100"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-slate-100"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                               <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {items.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">You might also need</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {suggestions.map(item => (
                        <button 
                          key={item.id} 
                          className="min-w-[100px] w-[100px] flex flex-col gap-2 group text-left" 
                          onClick={() => handleAddSuggestion(item)}
                        >
                          <div className="aspect-square rounded-lg bg-white border border-slate-200 overflow-hidden group-hover:border-[#4567a4]/50 transition-colors relative">
                            <img src={item.image} className="w-full h-full object-contain p-2" alt={item.name} />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                              <Plus size={12} className="text-[#4567a4]" />
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-[10px] font-bold text-slate-900 leading-tight group-hover:text-[#4567a4] transition-colors">{item.name}</div>
                            <div className="text-[10px] text-slate-500">${item.price.toFixed(2)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t bg-slate-50 p-6">
                  <div className="mb-4 flex justify-between text-base font-medium text-slate-900">
                    <p>Subtotal</p>
                    <p>${cartTotal.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 mb-6">Shipping and taxes calculated at checkout.</p>
                  
                  <div className="space-y-3">
                    {showRequestQuote && (
                        <Button 
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white" 
                            size="lg"
                            onClick={handleRequestQuote}
                        >
                            Request a Quote <FileText className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    
                    <Button 
                        className="w-full bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-40% to-[#00a1d0] to-100% text-white font-bold h-12 shadow-xl hover:opacity-90 transition-all uppercase tracking-wide" 
                        size="lg"
                        onClick={handleCheckout}
                    >
                        Checkout <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                  <div className="mt-4 flex justify-center text-center text-sm text-slate-500">
                    <p>
                      or <button onClick={closeCart} className="font-medium text-[#4567a4] hover:text-[#4567a4]/80">Continue Shopping</button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
