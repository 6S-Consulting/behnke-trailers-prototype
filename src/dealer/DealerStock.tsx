import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { trailers } from '@/data/trailers';
import { toast } from 'sonner';

// Simulated dealer stock (subset of trailers with quantities)
const dealerStock = trailers.slice(0, 10).map(t => ({
  ...t,
  dealerQty: Math.floor(Math.random() * 5) + 1,
  dealerStatus: Math.random() > 0.7 ? 'Low Stock' as const : 'In Stock' as const,
}));

const DealerStock = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">My Inventory</h1>
          <button onClick={() => toast.info('Restock request form — coming soon')} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
            Request Restock
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-industrial p-4">
          <DataTable
            columns={[
              { key: 'modelNumber', label: 'Model #', sortable: true, render: (t: any) => <span className="font-mono text-xs font-medium">{t.modelNumber}</span> },
              { key: 'name', label: 'Name', sortable: true },
              { key: 'category', label: 'Category', render: (t: any) => <StatusBadge status={t.category} /> },
              { key: 'price', label: 'Price', sortable: true, render: (t: any) => <span className="font-mono text-xs">${t.price.toLocaleString()}</span> },
              { key: 'dealerQty', label: 'Qty', sortable: true, render: (t: any) => <span className="font-mono text-xs">{t.dealerQty}</span> },
              { key: 'dealerStatus', label: 'Status', render: (t: any) => <StatusBadge status={t.dealerStatus === 'Low Stock' ? 'Low Stock' : 'Available'} /> },
              { key: 'actions', label: '', render: () => (
                <button onClick={() => toast.success('Restock request submitted')} className="text-xs text-primary hover:underline font-display uppercase tracking-wide">Restock</button>
              )},
            ]}
            data={dealerStock}
            searchable
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DealerStock;
