import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Order } from '@/types';
import { LayoutGrid, List } from 'lucide-react';

const DealerOrders = () => {
  const { user } = useAuth();
  const { state, actions } = useAppData();
  const [tab, setTab] = useState<'behnke' | 'customer'>('behnke');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');

  const dealerId = user?.id ?? '';
  const myOrders = state.orders.filter(o => o.fromId === dealerId && o.fromType === 'Dealer');
  const custOrders = state.orders.filter(o => o.toId === dealerId && o.toType === 'Dealer');

  const statusSteps = ['Draft', 'Submitted', 'Under Review', 'Approved', 'In Production', 'Shipped', 'Delivered'];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Order Management</h1>
          <div className="flex gap-2">
            <button onClick={() => { setWizardOpen(true); setWizardStep(1); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
              New Order to Behnke
            </button>
            <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-border rounded-sm hover:bg-muted">
              {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTab('behnke')} className={cn('px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide', tab === 'behnke' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
            My Orders to Behnke
          </button>
          <button onClick={() => setTab('customer')} className={cn('px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide', tab === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
            Customer Orders to Me
          </button>
        </div>

        {view === 'table' ? (
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <DataTable<Order>
              columns={[
                { key: 'orderNumber', label: 'Order #', sortable: true, render: (o) => <span className="font-mono text-xs">{o.orderNumber}</span> },
                { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs">{o.trailerName}</span> },
                { key: 'type', label: 'Type', render: (o) => <StatusBadge status={o.type} /> },
                { key: 'quantity', label: 'Qty', render: (o) => <span className="font-mono text-xs">{o.quantity}</span> },
                { key: 'totalPrice', label: 'Total', sortable: true, render: (o) => <span className="font-mono text-xs">${o.totalPrice.toLocaleString()}</span> },
                { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
                { key: 'createdDate', label: 'Date', render: (o) => <span className="text-xs">{o.createdDate}</span> },
              ]}
              data={tab === 'behnke' ? myOrders : custOrders}
              searchable
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {(tab === 'behnke' ? myOrders : custOrders).map(o => (
              <div
                key={o.id}
                className="bg-card/60 border border-white/5 rounded-lg p-4 hover:border-primary/30 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs text-white">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{o.trailerName || '—'}</h3>
                <p className="text-xs text-muted-foreground mb-3"><StatusBadge status={o.type} /></p>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <span className="font-display font-bold text-sm block text-white">{o.quantity}</span>
                    <span className="text-[9px] font-mono uppercase text-muted-foreground">Qty</span>
                  </div>
                  <div className="text-center">
                    <span className="font-display font-bold text-sm block text-white">${o.totalPrice.toLocaleString()}</span>
                    <span className="text-[9px] font-mono uppercase text-muted-foreground">Total</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">{o.createdDate}</p>
              </div>
            ))}
          </div>
        )}

        {/* Order Wizard */}
        <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title="New Order to Behnke" wide>
          <div className="space-y-4">
            {/* Steps indicator */}
            <div className="flex gap-6 mb-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={cn('flex items-center gap-2', wizardStep >= s ? 'text-primary' : 'text-muted-foreground')}>
                  <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold', wizardStep >= s ? 'border-primary' : 'border-border')}>
                    {s}
                  </div>
                  <span className="font-display uppercase text-xs tracking-widest">
                    {s === 1 ? 'Select Trailer' : s === 2 ? 'Customize' : 'Review'}
                  </span>
                </div>
              ))}
            </div>

            {wizardStep === 1 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Select a trailer from the catalog:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {state.trailers.slice(0, 8).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTrailer(t.id)}
                      className={cn('text-left p-3 rounded-md border transition-colors', selectedTrailer === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                    >
                      <span className="font-mono text-xs text-muted-foreground">{t.modelNumber}</span>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="font-mono text-xs text-primary mt-1">${t.price.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => setWizardStep(2)} disabled={!selectedTrailer} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide disabled:opacity-50">
                  Next →
                </button>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Customize your order:</p>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-20 border border-border rounded-md p-2 text-sm bg-card"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    className="w-full border border-border rounded-md p-2 text-sm bg-card"
                    placeholder="Special requirements..."
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setWizardStep(1)} className="px-4 py-2 border border-border rounded-sm text-xs font-display uppercase tracking-wide">← Back</button>
                  <button onClick={() => setWizardStep(3)} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">Next →</button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Order Summary</p>
                {selectedTrailer && (() => {
                  const t = state.trailers.find(tr => tr.id === selectedTrailer);
                  return t ? (
                    <div className="bg-muted/30 rounded-md p-3">
                      <p className="font-mono text-xs">{t.modelNumber}</p>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="font-display text-lg font-bold mt-2">${t.price.toLocaleString()}</p>
                    </div>
                  ) : null;
                })()}
                <div className="flex gap-2">
                  <button onClick={() => setWizardStep(2)} className="px-4 py-2 border border-border rounded-sm text-xs font-display uppercase tracking-wide">← Back</button>
                  <button
                    onClick={() => {
                      if (!selectedTrailer) return;
                      if (!user) return;
                      const newOrder = actions.submitDealerOrderToBehnke({
                        dealerId: user.id,
                        trailerId: selectedTrailer,
                        quantity,
                        notes: orderNotes,
                      });
                      setWizardOpen(false);
                      setWizardStep(1);
                      setSelectedTrailer(null);
                      setQuantity(1);
                      setOrderNotes('');
                      toast.success(`Order submitted: ${newOrder.orderNumber}`);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide"
                  >
                    Submit Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default DealerOrders;
