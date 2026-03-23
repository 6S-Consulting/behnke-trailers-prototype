import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { useAppData } from '@/context/AppDataContext';
import { Order } from '@/types';
import { toast } from 'sonner';
import { Package, Users, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STEPS: Order['status'][] = ['Draft', 'Submitted', 'Under Review', 'Approved', 'In Production', 'Shipped', 'Delivered'];

const AdminOrders = () => {
  const { state, actions } = useAppData();
  const [tab, setTab] = useState<'dealer' | 'customer' | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const dealerOrders = state.orders.filter(o => o.fromType === 'Dealer');
  const customerOrders = state.orders.filter(o => o.fromType === 'Customer');
  const allOrders = state.orders;

  const displayOrders = tab === 'dealer' ? dealerOrders : tab === 'customer' ? customerOrders : allOrders;

  const advance = (o: Order) => {
    if (!window.confirm(`Advance ${o.orderNumber} to next stage?`)) return;
    const updated = actions.advanceOrderStatus({ orderId: o.id });
    if (!updated) { toast.error('Could not advance order'); return; }
    toast.success(`Order advanced to: ${updated.status}`);
    setSelectedOrder(updated);
  };

  const kpis = [
    { label: 'Total Orders', value: allOrders.length, icon: Package },
    { label: 'Dealer Orders', value: dealerOrders.length, icon: TrendingUp },
    { label: 'Customer Orders', value: customerOrders.length, icon: Users },
    { label: 'Pending Review', value: allOrders.filter(o => o.status === 'Under Review').length, icon: Clock },
  ];

  const columns = [
    { key: 'orderNumber', label: 'Order #', sortable: true, render: (o: Order) => <span className="font-mono text-xs text-white">{o.orderNumber}</span> },
    { key: 'type', label: 'Type', render: (o: Order) => <StatusBadge status={o.type} /> },
    {
      key: 'from', label: 'From', render: (o: Order) => {
        const name = o.fromType === 'Dealer'
          ? state.dealers.find(d => d.id === o.fromId)?.name
          : state.customers.find(c => c.id === o.fromId)?.name;
        return (
          <span className="text-xs">
            {name} <span className="px-1 py-0.5 rounded-sm bg-white/5 text-[10px] ml-1 text-muted-foreground">{o.fromType}</span>
          </span>
        );
      }
    },
    { key: 'trailerName', label: 'Trailer', render: (o: Order) => <span className="text-xs">{o.trailerName || '—'}</span> },
    { key: 'quantity', label: 'Qty', render: (o: Order) => <span className="font-mono text-xs">{o.quantity}</span> },
    { key: 'totalPrice', label: 'Total', sortable: true, render: (o: Order) => <span className="font-mono text-xs font-medium">£{o.totalPrice.toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (o: Order) => <StatusBadge status={o.status} /> },
    { key: 'createdDate', label: 'Date', sortable: true, render: (o: Order) => <span className="text-xs text-muted-foreground">{o.createdDate}</span> },
    {
      key: 'actions', label: '', render: (o: Order) => {
        const canAdvance = o.toType === 'Admin' && !['Delivered', 'Cancelled'].includes(o.status);
        return (
          <div className="flex gap-2 justify-end">
            {canAdvance && (
              <button
                onClick={(e) => { e.stopPropagation(); advance(o); }}
                className="text-xs text-primary hover:underline font-display uppercase tracking-wide"
              >
                Advance
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Orders</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card/60 border border-white/5 rounded-lg p-4 flex items-center gap-3">
              <Icon size={18} className="text-muted-foreground shrink-0" />
              <div>
                <p className="font-display text-xl font-bold text-white">{value}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/5 pb-1">
          {[
            { key: 'all', label: `All Orders (${allOrders.length})` },
            { key: 'dealer', label: `Dealer Orders (${dealerOrders.length})` },
            { key: 'customer', label: `Customer Orders (${customerOrders.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'all' | 'dealer' | 'customer')}
              className={cn('px-4 py-1.5 text-xs font-display uppercase tracking-wide rounded-sm transition-colors', tab === key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-card/60 border border-white/5 rounded-lg p-4">
          <DataTable<Order>
            columns={columns}
            data={displayOrders}
            searchable
            searchPlaceholder="Search orders..."
            onRowClick={(o) => setSelectedOrder(o)}
          />
        </div>

        {/* Order Detail Modal */}
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder?.orderNumber ?? ''} wide>
          {selectedOrder && (() => {
            const fromName = selectedOrder.fromType === 'Dealer'
              ? state.dealers.find(d => d.id === selectedOrder.fromId)?.name
              : state.customers.find(c => c.id === selectedOrder.fromId)?.name;
            const dealer = selectedOrder.fromType === 'Dealer'
              ? state.dealers.find(d => d.id === selectedOrder.fromId)
              : state.dealers.find(d => d.id === state.customers.find(c => c.id === selectedOrder.fromId)?.assignedDealerId);
            const currentIdx = STATUS_STEPS.indexOf(selectedOrder.status);
            const canAdvance = selectedOrder.toType === 'Admin' && !['Delivered', 'Cancelled'].includes(selectedOrder.status);
            return (
              <div className="space-y-5">
                {/* Status progress */}
                <div>
                  <div className="flex items-center gap-1">
                    {STATUS_STEPS.map((stage, i) => (
                      <div key={stage} className="flex items-center flex-1">
                        <div className={cn('flex-1 h-1.5 rounded-full transition-colors', i <= currentIdx ? 'bg-primary' : 'bg-white/10')} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[8px] font-mono uppercase text-muted-foreground">
                    <span>Draft</span><span>Delivered</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={selectedOrder.status} />
                    {canAdvance && (
                      <button onClick={() => advance(selectedOrder)} className="px-3 py-1 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:opacity-90">
                        Advance to {STATUS_STEPS[Math.min(currentIdx + 1, STATUS_STEPS.length - 1)]}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Order #</p><p className="font-mono font-bold text-white">{selectedOrder.orderNumber}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Type</p><StatusBadge status={selectedOrder.type} /></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">From ({selectedOrder.fromType})</p><p className="font-medium">{fromName}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Trailer</p><p>{selectedOrder.trailerName || '—'}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Quantity</p><p className="font-mono font-bold">{selectedOrder.quantity}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Unit Price</p><p className="font-mono">£{selectedOrder.unitPrice.toLocaleString()}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Price</p><p className="font-display text-xl font-bold text-primary">£{selectedOrder.totalPrice.toLocaleString()}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Created</p><p>{selectedOrder.createdDate}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Est. Delivery</p><p>{selectedOrder.estimatedDelivery || '—'}</p></div>
                </div>

                {selectedOrder.fromType === 'Customer' && dealer && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Fulfilling Dealer</p>
                    <p className="text-sm font-medium text-white">{dealer.name}</p>
                    <p className="text-xs text-muted-foreground">{dealer.contactName} · {dealer.phone}</p>
                    <p className="text-xs text-muted-foreground">{dealer.city}, {dealer.state}</p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Notes</p><p className="text-sm text-muted-foreground">{selectedOrder.notes}</p></div>
                )}
                {selectedOrder.customSpecs && (
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Custom Specs</p><p className="text-sm text-muted-foreground italic">{selectedOrder.customSpecs}</p></div>
                )}
              </div>
            );
          })()}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;
