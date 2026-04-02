import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Trailer } from '@/types';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const DealerStock = () => {
  const { user } = useAuth();
  const { state, actions } = useAppData();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('Restock requested from inventory page.');

  const openRestockWizard = (trailerId?: string) => {
    setWizardOpen(true);
    setWizardStep(1);
    setSelectedTrailer(trailerId ?? null);
    setQuantity(1);
    setOrderNotes('Restock requested from inventory page.');
  };

  const dealerQtyRows = state.trailers.slice(0, 12).map(t => ({
    ...t,
    dealerQty: t.inStock,
    dealerStatus: t.inStock < 3 ? ('Low Stock' as const) : ('In Stock' as const),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">My Inventory</h1>
          <div className="flex gap-2">
            <button
              onClick={() => openRestockWizard()}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide"
            >
              Request Restock
            </button>
            <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-border rounded-sm hover:bg-muted">
              {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          </div>
        </div>
        {view === 'table' ? (
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <DataTable<Trailer & { dealerQty: number; dealerStatus: string }>
              columns={[
                { key: 'modelNumber', label: 'Model #', sortable: true, render: (t) => <span className="font-mono text-xs font-medium">{t.modelNumber}</span> },
                { key: 'name', label: 'Name', sortable: true },
                { key: 'category', label: 'Category', render: (t) => <StatusBadge status={t.category} /> },
                { key: 'price', label: 'Price', sortable: true, render: (t) => <span className="font-mono text-xs">${t.price.toLocaleString()}</span> },
                { key: 'dealerQty', label: 'Qty', sortable: true, render: (t) => <span className="font-mono text-xs">{t.dealerQty}</span> },
                { key: 'dealerStatus', label: 'Status', render: (t) => <StatusBadge status={t.dealerStatus === 'Low Stock' ? 'Low Stock' : 'Available'} /> },
                {
                  key: 'actions', label: '', render: (row) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRestockWizard(row.id);
                      }}
                      className="text-xs text-primary hover:underline font-display uppercase tracking-wide"
                    >
                      Restock
                    </button>
                  )
                },
              ]}
              data={dealerQtyRows}
              searchable
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {dealerQtyRows.map(t => (
              <div
                key={t.id}
                className="bg-card/60 border border-white/5 rounded-lg p-4 hover:border-primary/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">{t.modelNumber}</span>
                    <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{t.name}</h3>
                  </div>
                  <StatusBadge status={t.dealerStatus === 'Low Stock' ? 'Low Stock' : 'Available'} />
                </div>
                <p className="text-xs text-muted-foreground mb-3"><StatusBadge status={t.category} /></p>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <span className="font-display font-bold text-sm block text-white">{t.dealerQty}</span>
                    <span className="text-[9px] font-mono uppercase text-muted-foreground">In Stock</span>
                  </div>
                  <div className="text-center">
                    <span className="font-display font-bold text-sm block text-white">${t.price.toLocaleString()}</span>
                    <span className="text-[9px] font-mono uppercase text-muted-foreground">Price</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    openRestockWizard(t.id);
                  }}
                  className="mt-3 w-full px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-sm text-xs font-display uppercase tracking-wide hover:bg-primary/20 transition-colors"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title="New Order to Behnke" wide>
          <div className="space-y-4">
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
                <p className="text-sm text-muted-foreground">Select a trailer from your inventory:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {dealerQtyRows.map(t => (
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
                <button
                  onClick={() => setWizardStep(2)}
                  disabled={!selectedTrailer}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide disabled:opacity-50"
                >
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
                      if (!selectedTrailer || !user) {
                        toast.error('Unable to submit order. Please log in again.');
                        return;
                      }

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
                      setOrderNotes('Restock requested from inventory page.');
                      toast.success(`Order submitted: ${newOrder.orderNumber}`);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:opacity-90 transition-opacity"
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

export default DealerStock;
