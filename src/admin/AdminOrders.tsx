import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { orders } from '@/data/orders';
import { dealers } from '@/data/dealers';
import { customers } from '@/data/customers';

const AdminOrders = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">All Orders</h1>

        <div className="bg-card rounded-lg shadow-industrial p-4">
          <DataTable
            columns={[
              { key: 'orderNumber', label: 'Order #', sortable: true, render: (o) => <span className="font-mono text-xs">{o.orderNumber}</span> },
              { key: 'type', label: 'Type', render: (o) => <StatusBadge status={o.type} /> },
              { key: 'from', label: 'From', render: (o) => {
                const name = o.fromType === 'Dealer' ? dealers.find(d => d.id === o.fromId)?.name : customers.find(c => c.id === o.fromId)?.name;
                return <span className="text-xs">{name} <span className="text-muted-foreground">({o.fromType})</span></span>;
              }},
              { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs">{o.trailerName || '—'}</span> },
              { key: 'quantity', label: 'Qty', render: (o) => <span className="font-mono text-xs">{o.quantity}</span> },
              { key: 'totalPrice', label: 'Total', sortable: true, render: (o) => <span className="font-mono text-xs font-medium">${o.totalPrice.toLocaleString()}</span> },
              { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              { key: 'createdDate', label: 'Date', sortable: true, render: (o) => <span className="text-xs">{o.createdDate}</span> },
            ]}
            data={orders}
            searchable
            searchPlaceholder="Search orders..."
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;
