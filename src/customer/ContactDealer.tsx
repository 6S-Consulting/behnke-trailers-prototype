import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { dealers } from '@/data/dealers';
import { cn } from '@/lib/utils';
import { Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const dealer = dealers[0]; // Midwest Trailer Sales
const tabs = ['Request a Quote', 'Order a Trailer', 'Custom Inquiry', 'General Question'] as const;

const ContactDealer = () => {
  const [tab, setTab] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    toast.success('Request sent to ' + dealer.name);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Contact {dealer.name}</h1>

        {/* Dealer Card */}
        <div className="bg-card rounded-lg shadow-industrial p-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">{dealer.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">Contact: {dealer.contactName}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1.5"><Phone size={14} className="text-primary" />{dealer.phone}</span>
            <span className="flex items-center gap-1.5"><Mail size={14} className="text-primary" />{dealer.email}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" />{dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Hours: Mon-Fri 8AM-5PM CT</p>
        </div>

        {submitted ? (
          <div className="bg-success/10 border border-success/30 rounded-lg p-6 text-center">
            <p className="text-lg font-display font-bold uppercase">✅ Request Sent!</p>
            <p className="text-sm text-muted-foreground mt-2">
              {dealer.contactName} will contact you within 1 business day.
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-1">Reference #: {Math.floor(1000 + Math.random() * 9000)}</p>
            <button onClick={() => setSubmitted(false)} className="mt-4 px-4 py-2 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted">
              Send Another Request
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              {tabs.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} className={cn('px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide', tab === i ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}>
                  {t}
                </button>
              ))}
            </div>

            <div className="bg-card rounded-lg shadow-industrial p-5 space-y-3">
              {tab === 0 && (
                <>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Trailer Category</label>
                    <select className="w-full border border-border rounded-md p-2 text-sm bg-card">
                      <option>Agricultural</option><option>Construction</option><option>Heavy Haul</option><option>Commercial</option><option>Utility/Telecom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Configuration Notes</label>
                    <textarea rows={3} className="w-full border border-border rounded-md p-2 text-sm bg-card" placeholder="Describe what you need..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Budget Range (optional)</label>
                    <input type="text" className="w-full border border-border rounded-md p-2 text-sm bg-card" placeholder="e.g. $30,000-$50,000" />
                  </div>
                </>
              )}
              {tab === 1 && (
                <>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Trailer Model</label>
                    <input type="text" className="w-full border border-border rounded-md p-2 text-sm bg-card" placeholder="e.g. GN2900WG" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Quantity</label>
                    <input type="number" defaultValue={1} className="w-20 border border-border rounded-md p-2 text-sm bg-card" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Delivery Date Needed</label>
                    <input type="date" className="w-full border border-border rounded-md p-2 text-sm bg-card" />
                  </div>
                </>
              )}
              {tab === 2 && (
                <>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Description of Requirements</label>
                    <textarea rows={4} className="w-full border border-border rounded-md p-2 text-sm bg-card" placeholder="Describe your custom trailer needs..." />
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
                    <input type="text" className="w-full border border-border rounded-md p-2 text-sm bg-card" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Message</label>
                    <textarea rows={4} className="w-full border border-border rounded-md p-2 text-sm bg-card" />
                  </div>
                </>
              )}
              <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
                Send Request
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactDealer;
