import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Trailer } from '@/types';

const DealerStock = () => {
  const { user } = useAuth();
  const { state, actions } = useAppData();

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
          <button onClick={() => toast.info('Use Restock per row to request inventory')} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
            Request Restock
          </button>
        </div>
// Inside DealerStock:
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
                      const dealerId = user?.id;
                      if (!dealerId) return;
                      const newOrder = actions.submitDealerOrderToBehnke({
                        dealerId,
                        trailerId: row.id,
                        quantity: 1,
                        notes: 'Restock requested from inventory page.',
                      });
                      toast.success(`Restock requested: ${newOrder.orderNumber}`);
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
      </div>
    </DashboardLayout>
  );
};

export default DealerStock;
