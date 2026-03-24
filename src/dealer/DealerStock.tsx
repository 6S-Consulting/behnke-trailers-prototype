import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Trailer } from '@/types';
import { LayoutGrid, List } from 'lucide-react';

const DealerStock = () => {
  const { user } = useAuth();
  const { state, actions } = useAppData();
  const [view, setView] = useState<'table' | 'grid'>('table');

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
            <button onClick={() => toast.info('Use Restock per row to request inventory')} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
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
                    const dealerId = user?.id;
                    if (!dealerId) return;
                    const newOrder = actions.submitDealerOrderToBehnke({
                      dealerId,
                      trailerId: t.id,
                      quantity: 1,
                      notes: 'Restock requested from inventory page.',
                    });
                    toast.success(`Restock requested: ${newOrder.orderNumber}`);
                  }}
                  className="mt-3 w-full px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-sm text-xs font-display uppercase tracking-wide hover:bg-primary/20 transition-colors"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DealerStock;
