import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { useAppData } from '@/context/AppDataContext';
import { Order } from '@/types';
import { toast } from 'sonner';
import { Package, Users, TrendingUp, Clock, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const STATUS_STEPS: Order['status'][] = ['Draft', 'Submitted', 'Under Review', 'Approved', 'In Production', 'Shipped', 'Delivered'];

const AdminOrders = () => {
  const { state, actions } = useAppData();
  const [tab, setTab] = useState<'dealer' | 'customer' | 'all'>('all');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const dealerOrders = state.orders.filter(o => o.fromType === 'Dealer');
  const customerOrders = state.orders.filter(o => o.fromType === 'Customer');
  const allOrders = state.orders;

  const displayOrders = tab === 'dealer' ? dealerOrders : tab === 'customer' ? customerOrders : allOrders;

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
    { key: 'totalPrice', label: 'Total', sortable: true, render: (o: Order) => <span className="font-mono text-xs font-medium">${o.totalPrice.toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (o: Order) => <StatusBadge status={o.status} /> },
    { key: 'createdDate', label: 'Date', sortable: true, render: (o: Order) => <span className="text-xs text-muted-foreground">{o.createdDate}</span> },
    {
      key: 'actions', label: '', render: (o: Order) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
            className="text-xs text-primary hover:underline font-display uppercase tracking-wide"
          >
            View
          </button>
        </div>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Orders</h1>
          <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-white/10 rounded-sm hover:bg-white/5 transition-all active:scale-95">
            {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
          </button>
        </div>

        {/* KPIs */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {kpis.map(({ label, value, icon: Icon }, i) => (
            <motion.div key={label} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 flex items-center gap-3 hover:border-white/[0.12] transition-colors">
                <Icon size={18} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="font-display text-xl font-bold text-white">{value}</p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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

        {view === 'table' ? (
          <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
            <DataTable<Order>
              columns={columns}
              data={displayOrders}
              searchable
              searchPlaceholder="Search orders..."
              onRowClick={(o) => setSelectedOrder(o)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {displayOrders.map(o => {
              const fromName = o.fromType === 'Dealer'
                ? state.dealers.find(d => d.id === o.fromId)?.name
                : state.customers.find(c => c.id === o.fromId)?.name;
              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-white">{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{o.trailerName || '—'}</p>
                  <p className="text-xs text-muted-foreground mb-3">{fromName} <span className="px-1 py-0.5 rounded-sm bg-white/5 text-[10px] ml-1">{o.fromType}</span></p>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                    <div className="text-center">
                      <span className="font-display font-bold text-sm block text-white">{o.quantity}</span>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground">Qty</span>
                    </div>
                    <div className="text-center">
                      <span className="font-display font-bold text-sm block text-white">${o.totalPrice.toLocaleString()}</span>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground">Total</span>
                    </div>
                    <div className="text-center">
                      <span className="font-display font-bold text-sm block text-white">
                        <StatusBadge status={o.type} />
                      </span>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground">Type</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">{o.createdDate}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Detail Modal */}
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder?.orderNumber ?? ''} wide>
          {selectedOrder && (() => {
            const fromName = selectedOrder.fromType === 'Dealer'
              ? state.dealers.find(d => d.id === selectedOrder.fromId)?.name
              : state.customers.find(c => c.id === selectedOrder.fromId)?.name;
            const dealer = selectedOrder.fromType === 'Dealer'
              ? state.dealers.find(d => d.id === selectedOrder.fromId)
              : state.dealers.find(d => d.id === state.customers.find(c => c.id === selectedOrder.fromId)?.assignedDealerId);
            return (
              <div className="space-y-5">
                {/* Status Selection */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Update Order Status</p>
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
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Order #</p><p className="font-mono font-bold text-white">{selectedOrder.orderNumber}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Type</p><StatusBadge status={selectedOrder.type} /></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">From ({selectedOrder.fromType})</p><p className="font-medium">{fromName}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Trailer</p><p>{selectedOrder.trailerName || '—'}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Quantity</p><p className="font-mono font-bold">{selectedOrder.quantity}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Unit Price</p><p className="font-mono">${selectedOrder.unitPrice.toLocaleString()}</p></div>
                  <div><p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Price</p><p className="font-display text-xl font-bold text-primary">${selectedOrder.totalPrice.toLocaleString()}</p></div>
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
