import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { TrailerCategory } from '@/types';

const tabs = ['Request a Quote', 'Order a Trailer', 'Custom Inquiry', 'General Question'] as const;

const ContactDealer = () => {
  const { user } = useAuth();
  const { state, actions } = useAppData();
  const [tab, setTab] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  // Quote request state
  const [selectedTrailerId, setSelectedTrailerId] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteCategory, setQuoteCategory] = useState<TrailerCategory>('Agricultural');

  // Order state
  const [orderTrailerId, setOrderTrailerId] = useState('');
  const [orderQty, setOrderQty] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');

  // Custom/General state
  const [customMessage, setCustomMessage] = useState('');
  const [generalSubject, setGeneralSubject] = useState('');
  const [generalMessage, setGeneralMessage] = useState('');

  const customer = state.customers.find(c => c.id === (user?.id ?? ''));
  const dealer = customer ? state.dealers.find(d => d.id === customer.assignedDealerId) : state.dealers[0];
  const filteredTrailers = state.trailers.filter(t => t.category === quoteCategory);

  const resetForm = () => {
    setSelectedTrailerId('');
    setQuoteNotes('');
    setOrderTrailerId('');
    setOrderQty(1);
    setOrderNotes('');
    setCustomMessage('');
    setGeneralSubject('');
    setGeneralMessage('');
  };

  const handleSubmit = () => {
    if (!user || !dealer) return;

    if (tab === 0) {
      // Request a Quote — actually creates a quote in the system
      if (!selectedTrailerId) {
        toast.error('Please select a trailer');
        return;
      }
      const quote = actions.createQuoteFromDealer({
        dealerId: dealer.id,
        customerId: user.id,
        trailerId: selectedTrailerId,
        quantity: 1,
        notes: quoteNotes || `Quote requested by customer via Contact Dealer form.`,
      });
      setRefNumber(quote.quoteNumber);
    } else if (tab === 1) {
      // Order a Trailer — submits a customer→dealer order
      if (!orderTrailerId) {
        toast.error('Please select a trailer');
        return;
      }
      const trailer = state.trailers.find(t => t.id === orderTrailerId);
      if (!trailer) return;

      // Create quote that the customer auto-accepts, then convert
      const quote = actions.createQuoteFromDealer({
        dealerId: dealer.id,
        customerId: user.id,
        trailerId: orderTrailerId,
        quantity: orderQty,
        notes: orderNotes || 'Direct order from customer.',
      });
      // Auto-accept and convert
      actions.updateQuoteStatus(quote.id, 'Accepted');
      const order = actions.convertQuoteToOrder({ quoteId: quote.id });
      setRefNumber(order?.orderNumber ?? quote.quoteNumber);
    } else if (tab === 2) {
      // Custom Inquiry — notify dealer
      if (!customMessage.trim()) {
        toast.error('Please describe your requirements');
        return;
      }
      setRefNumber(`CQ-${Date.now().toString(36).toUpperCase()}`);
    } else {
      // General Question — notify dealer
      if (!generalMessage.trim()) {
        toast.error('Please enter a message');
        return;
      }
      setRefNumber(`GQ-${Date.now().toString(36).toUpperCase()}`);
    }

    setSubmitted(true);
    toast.success(`Request sent to ${dealer.name}`);
    resetForm();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Contact {dealer?.name ?? 'Dealer'}</h1>

        {/* Dealer Card */}
        {dealer && (
          <div className="bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">{dealer.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Contact: {dealer.contactName}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-primary" />{dealer.phone}</span>
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-primary" />{dealer.email}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" />{dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Hours: Mon-Fri 8AM-5PM CT</p>
          </div>
        )}

        {submitted ? (
          <div className="bg-card border border-success/20 rounded-lg shadow-industrial p-8 text-center">
            <CheckCircle2 size={48} className="mx-auto text-success mb-4" />
            <p className="text-lg font-display font-bold uppercase tracking-wide">Request Sent!</p>
            <p className="text-sm text-muted-foreground mt-2">
              {dealer?.contactName ?? 'Your dealer'} will contact you within 1 business day.
            </p>
            <p className="font-mono text-xs text-primary mt-2">Reference: {refNumber}</p>
            {tab <= 1 && (
              <p className="text-xs text-muted-foreground mt-3">
                {tab === 0 ? 'You can view your quote in "My Quotes".' : 'Track your order in "My Orders".'}
              </p>
            )}
            <button onClick={() => setSubmitted(false)} className="mt-5 px-4 py-2 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted transition-colors">
              Send Another Request
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              {tabs.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} className={cn(
                  'px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide transition-all',
                  tab === i ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                )}>
                  {t}
                </button>
              ))}
            </div>

            <div className="bg-card rounded-lg shadow-industrial p-5 space-y-4">
              {tab === 0 && (
                <>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Trailer Category</label>
                    <select
                      className="w-full border border-border rounded-md p-2 text-sm bg-card"
                      value={quoteCategory}
                      onChange={e => { setQuoteCategory(e.target.value as TrailerCategory); setSelectedTrailerId(''); }}
                    >
                      <option value="Agricultural">Agricultural</option>
                      <option value="Construction">Construction</option>
                      <option value="Heavy Haul">Heavy Haul</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Utility/Telecom">Utility/Telecom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Select Trailer</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {filteredTrailers.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTrailerId(t.id)}
                          className={cn(
                            'text-left p-3 rounded-md border transition-all',
                            selectedTrailerId === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          )}
                        >
                          <span className="font-mono text-xs text-muted-foreground">{t.modelNumber}</span>
                          <p className="text-sm font-medium">{t.name}</p>
                          <p className="font-mono text-xs text-primary mt-1">${t.price.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">{t.inStock > 0 ? `${t.inStock} in stock` : 'Custom order'}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Additional Notes</label>
                    <textarea rows={3} value={quoteNotes} onChange={e => setQuoteNotes(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm bg-card" placeholder="Describe what you need..." />
                  </div>
                </>
              )}
              {tab === 1 && (
                <>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Select Trailer</label>
                    <select
                      className="w-full border border-border rounded-md p-2 text-sm bg-card"
                      value={orderTrailerId}
                      onChange={e => setOrderTrailerId(e.target.value)}
                    >
                      <option value="">-- Choose a trailer --</option>
                      {state.trailers.map(t => (
                        <option key={t.id} value={t.id}>{t.modelNumber} — {t.name} — ${t.price.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Quantity</label>
                    <input type="number" min={1} value={orderQty} onChange={e => setOrderQty(Number(e.target.value) || 1)} className="w-24 border border-border rounded-md p-2 text-sm bg-card" />
                  </div>
                  {orderTrailerId && (
                    <div className="bg-muted/30 rounded-md p-3 border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">Estimated Total</span>
                      <p className="font-mono text-lg font-bold text-primary">
                        ${((state.trailers.find(t => t.id === orderTrailerId)?.price ?? 0) * orderQty).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Order Notes</label>
                    <textarea rows={2} value={orderNotes} onChange={e => setOrderNotes(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm bg-card" placeholder="Special requirements, delivery preferences..." />
                  </div>
                </>
              )}
              {tab === 2 && (
                <>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Description of Requirements</label>
                    <textarea rows={4} value={customMessage} onChange={e => setCustomMessage(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm bg-card" placeholder="Describe your custom trailer needs..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Weight Requirements (GVW)</label>
                      <input type="text" className="w-full border border-border rounded-md p-2 text-sm bg-card" placeholder="e.g. 50,000 lb" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Hitch Type</label>
                      <select className="w-full border border-border rounded-md p-2 text-sm bg-card">
                        <option>Gooseneck</option><option>Bumper Pull</option><option>Pintle</option><option>Fifth Wheel</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              {tab === 3 && (
                <>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Subject</label>
                    <input type="text" value={generalSubject} onChange={e => setGeneralSubject(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm bg-card" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Message</label>
                    <textarea rows={4} value={generalMessage} onChange={e => setGeneralMessage(e.target.value)} className="w-full border border-border rounded-md p-2 text-sm bg-card" />
                  </div>
                </>
              )}
              <button onClick={handleSubmit} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:brightness-110 transition-all">
                {tab === 0 ? 'Request Quote' : tab === 1 ? 'Place Order' : 'Send Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactDealer;
