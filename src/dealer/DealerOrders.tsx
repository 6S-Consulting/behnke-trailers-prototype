import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Order } from '@/types';
import { LayoutGrid, List, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const STATUS_STEPS: Order['status'][] = [
  'Draft', 'Submitted', 'Under Review', 'Approved', 'In Production', 'Shipped', 'Delivered',
];

const DealerOrders = () => {
  const { user } = useAuth();
  const { state, actions } = useAppData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'behnke' | 'customer'>('behnke');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Wizard state (new order to Behnke)
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');

  const dealerId = user?.id ?? '';
  const myOrders = state.orders.filter(o => o.fromId === dealerId && o.fromType === 'Dealer');
  const custOrders = state.orders.filter(o => o.toId === dealerId && o.toType === 'Dealer');
  const displayOrders = tab === 'behnke' ? myOrders : custOrders;

  useEffect(() => {
    const shouldOpenRestockWizard = searchParams.get('restock') === '1';
    const trailerIdFromQuery = searchParams.get('trailerId');

    if (shouldOpenRestockWizard) {
      setTab('behnke');
      setWizardOpen(true);
      setWizardStep(1);
      setSelectedTrailer(trailerIdFromQuery ?? null);
      setQuantity(1);
      setOrderNotes('Restock requested from inventory page.');

      navigate('/dealer/orders', { replace: true });
    }
  }, [navigate, searchParams]);

  const columns = [
    {
      key: 'orderNumber', label: 'Order #', sortable: true,
      render: (o: Order) => <span className="font-mono text-xs text-white">{o.orderNumber}</span>,
    },
    {
      key: 'trailerName', label: 'Trailer',
      render: (o: Order) => <span className="text-xs">{o.trailerName || '—'}</span>,
    },
    { key: 'type', label: 'Type', render: (o: Order) => <StatusBadge status={o.type} /> },
    { key: 'quantity', label: 'Qty', render: (o: Order) => <span className="font-mono text-xs">{o.quantity}</span> },
    {
      key: 'totalPrice', label: 'Total', sortable: true,
      render: (o: Order) => <span className="font-mono text-xs">${o.totalPrice.toLocaleString()}</span>,
    },
    { key: 'status', label: 'Status', render: (o: Order) => <StatusBadge status={o.status} /> },
    { key: 'createdDate', label: 'Date', render: (o: Order) => <span className="text-xs text-muted-foreground">{o.createdDate}</span> },
    {
      key: 'actions', label: '',
      render: (o: Order) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
          className="text-xs text-primary hover:underline font-display uppercase tracking-wide flex items-center gap-0.5"
        >
          Details <ChevronRight size={11} />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Order Management</h1>
          <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-border rounded-sm hover:bg-muted">
            {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
          </button>
        </div>

        {/* Tabs with counts */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('behnke')}
            className={cn('px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide', tab === 'behnke' ? 'bg-primary text-primary-foreground' : 'bg-muted')}
          >
            Outbound Orders ({myOrders.length})
          </button>
          <button
            onClick={() => setTab('customer')}
            className={cn('px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide', tab === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-muted')}
          >
            Inbound Orders ({custOrders.length})
          </button>
        </div>
        {/* Table view */}
        {view === 'table' ? (
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <DataTable<Order>
              columns={columns}
              data={displayOrders}
              searchable
              searchPlaceholder="Search orders..."
              onRowClick={(o) => setSelectedOrder(o)}
            />
          </div>
        ) : (
          /* Grid view */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {displayOrders.map(o => (
              <div
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className="bg-card/60 border border-white/5 rounded-lg p-4 hover:border-primary/30 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs text-white">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">
                  {o.trailerName || '—'}
                </h3>
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

        {/* ── Order Detail Modal ─────────────────────────────────────────── */}
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder?.orderNumber ?? ''} wide>
          {selectedOrder && (() => {
            const customer = state.customers.find(c => c.id === selectedOrder.fromId);

            return (
              <div className="space-y-5">
                {/* Status Selection */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Update Order Status</p>
                  {tab === 'customer' ? (
                    <div className="flex flex-wrap gap-2">
                      {STATUS_STEPS.map((stage) => {
                        const isCurrent = selectedOrder.status === stage;
                        return (
                          <button
                            key={stage}
                            onClick={() => {
                              const updated = actions.setOrderStatus(selectedOrder.id, stage);
                              if (updated) {
                                toast.success(`Order moved to ${stage}`);
                                setSelectedOrder(updated);
                              }
                            }}
                            className={cn(
                              'px-3 py-1.2 bg-card border text-[10px] font-display uppercase tracking-wider transition-all',
                              isCurrent
                                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]'
                                : 'border-white/10 text-muted-foreground hover:border-white/30 hover:text-white'
                            )}
                          >
                            {stage}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <StatusBadge status={selectedOrder.status} />
                      <span className="text-[10px] font-mono text-muted-foreground italic tracking-tight">Stage is maintained by factory admin</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-white/5" />

                {/* Order details grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Order #</p>
                    <p className="font-mono font-bold text-white">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Type</p>
                    <StatusBadge status={selectedOrder.type} />
                  </div>
                  {tab === 'customer' && customer && (
                    <div>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Customer</p>
                      <p className="font-medium text-white">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Trailer</p>
                    <p className="text-white">{selectedOrder.trailerName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Quantity</p>
                    <p className="font-mono font-bold text-white">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Unit Price</p>
                    <p className="font-mono text-white">${selectedOrder.unitPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Price</p>
                    <p className="font-display text-xl font-bold text-primary">${selectedOrder.totalPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Date Created</p>
                    <p className="text-white">{selectedOrder.createdDate}</p>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-white/5 mt-4">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Order Notes</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>

        {/* ── New Order Wizard ─────────────────────────────────────────────── */}
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
                      if (!selectedTrailer || !user) return;
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

export default DealerOrders;
