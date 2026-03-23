import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { trailers } from '@/data/trailers';
import { Trailer, TrailerCategory } from '@/types';
import { Plus, Download, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories: TrailerCategory[] = ['Agricultural', 'Construction', 'Heavy Haul', 'Commercial', 'Utility/Telecom', 'OEM'];

const InventoryManagement = () => {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [filterCat, setFilterCat] = useState<string>('');
  const [detailTrailer, setDetailTrailer] = useState<Trailer | null>(null);

  const filtered = filterCat ? trailers.filter(t => t.category === filterCat) : trailers;

  const catCounts: Record<string, number> = {};
  trailers.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + t.inStock; });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Trailer Inventory</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:opacity-90">
              <Plus size={14} /> Add Trailer
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-border rounded-sm hover:bg-muted">
              {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCat('')} className={cn('px-3 py-1 rounded-sm text-xs font-display uppercase tracking-wide', !filterCat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}>
            All ({trailers.length})
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} className={cn('px-3 py-1 rounded-sm text-xs font-display uppercase tracking-wide', filterCat === cat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}>
              {cat} ({catCounts[cat] || 0})
            </button>
          ))}
        </div>

        {view === 'table' ? (
          <DataTable<Trailer>
            columns={[
              { key: 'modelNumber', label: 'Model #', sortable: true, render: (t) => <span className="font-mono text-xs font-medium">{t.modelNumber}</span> },
              { key: 'name', label: 'Name', sortable: true },
              { key: 'category', label: 'Category', render: (t) => <StatusBadge status={t.category} /> },
              { key: 'subType', label: 'Sub-Type', render: (t) => <span className="text-xs">{t.subType}</span> },
              { key: 'gvw', label: 'GVW', sortable: true, render: (t) => <span className="font-mono text-xs">{t.gvw.toLocaleString()} lb</span> },
              { key: 'price', label: 'Price', sortable: true, render: (t) => <span className="font-mono text-xs">${t.price.toLocaleString()}</span> },
              { key: 'inStock', label: 'Stock', sortable: true, render: (t) => <span className="font-mono text-xs">{t.inStock}</span> },
              { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
              {
                key: 'actions', label: '', render: (t) => (
                  <button onClick={(e) => { e.stopPropagation(); setDetailTrailer(t); }} className="text-xs text-primary hover:underline font-display uppercase tracking-wide">
                    View
                  </button>
                )
              },
            ]}
            data={filtered}
            searchable
            searchPlaceholder="Search by model or name..."
            onRowClick={setDetailTrailer}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(t => (
              <div key={t.id} onClick={() => setDetailTrailer(t)} className="bg-card rounded-lg shadow-industrial p-4 cursor-pointer hover:shadow-industrial-md transition-shadow border-t-primary">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs text-muted-foreground">{t.modelNumber}</span>
                  <StatusBadge status={t.status} />
                </div>
                <h3 className="font-display font-bold uppercase tracking-wide text-sm">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.category} — {t.subType}</p>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="font-display text-lg font-bold">${t.price.toLocaleString()}</span>
                  <span className="font-mono text-xs text-muted-foreground">{t.inStock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal isOpen={!!detailTrailer} onClose={() => setDetailTrailer(null)} title={detailTrailer?.name || ''} wide>
          {detailTrailer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Model Number</span>
                  <p className="font-mono font-medium">{detailTrailer.modelNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Category</span>
                  <p>{detailTrailer.category} — {detailTrailer.subType}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">GVW</span>
                  <p className="font-mono">{detailTrailer.gvw.toLocaleString()} lb</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Base Price</span>
                  <p className="font-display text-xl font-bold">${detailTrailer.price.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{detailTrailer.description}</p>

              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Specifications</h4>
                <div className="border border-border rounded-md overflow-hidden">
                  {detailTrailer.specs.map((s, i) => (
                    <div key={i} className={cn('flex justify-between px-3 py-1.5 text-sm', i % 2 === 0 ? 'bg-muted/30' : '')}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-mono">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {detailTrailer.options.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Available Options</h4>
                  {detailTrailer.options.map(o => (
                    <div key={o.id} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                      <div>
                        <span className="text-sm font-medium">{o.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{o.description}</span>
                      </div>
                      <span className="font-mono text-sm text-primary">+${o.priceAdd.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <span className={cn('text-xs font-mono', detailTrailer.inStock > 5 ? 'text-success' : detailTrailer.inStock > 0 ? 'text-warning' : 'text-danger')}>
                  {detailTrailer.inStock} in stock
                </span>
                <span className="text-xs text-muted-foreground">• {detailTrailer.leadTimeDays} day lead time</span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default InventoryManagement;
