import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { useAppData } from '@/context/AppDataContext';
import { Order } from '@/types';

const AdminOrders = () => {
  const { state, actions } = useAppData();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">All Orders</h1>

        <div className="bg-card rounded-lg shadow-industrial p-4">
          <DataTable
            columns={[
              { key: 'orderNumber', label: 'Order #', sortable: true, render: (o) => <span className="font-mono text-xs">{o.orderNumber}</span> },
              { key: 'type', label: 'Type', render: (o) => <StatusBadge status={o.type} /> },
              {
                key: 'from', label: 'From', render: (o) => {
                  const name = o.fromType === 'Dealer' ? state.dealers.find(d => d.id === o.fromId)?.name : state.customers.find(c => c.id === o.fromId)?.name;
                  return <span className="text-xs">{name} <span className="text-muted-foreground">({o.fromType})</span></span>;
                }
              },
              { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs">{o.trailerName || '—'}</span> },
              { key: 'quantity', label: 'Qty', render: (o) => <span className="font-mono text-xs">{o.quantity}</span> },
              { key: 'totalPrice', label: 'Total', sortable: true, render: (o) => <span className="font-mono text-xs font-medium">${o.totalPrice.toLocaleString()}</span> },
              { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              { key: 'createdDate', label: 'Date', sortable: true, render: (o) => <span className="text-xs">{o.createdDate}</span> },
              {
                key: 'actions',
                label: '',
                render: (o: Order) => {
                  const canAdvance = o.toType === 'Admin' && !['Delivered', 'Cancelled'].includes(o.status);
                  return (
                    <div className="flex gap-2 justify-end">
                      {canAdvance && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!window.confirm(`Advance ${o.orderNumber} to next stage?`)) return;
                            const updated = actions.advanceOrderStatus({ orderId: o.id });
                            if (!updated) {
                              toast.error('Could not advance order');
                              return;
                            }
                            toast.success(`Order advanced: ${updated.status}`);
                          }}
                          className="text-xs text-primary hover:underline font-display uppercase tracking-wide"
                        >
                          Advance
                        </button>
                      )}
                    </div>
                  );
                },
              },
            ]}
            data={state.orders}
            searchable
            searchPlaceholder="Search orders..."
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;
