import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { Trailer, TrailerCategory } from '@/types';
import { Plus, Download, LayoutGrid, List, Pencil, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppData } from '@/context/AppDataContext';
import { toast } from 'sonner';

const categories: TrailerCategory[] = ['Agricultural', 'Construction', 'Heavy Haul', 'Commercial', 'Utility/Telecom', 'OEM'];

const EMPTY_FORM = {
  name: '',
  modelNumber: '',
  category: 'Agricultural' as TrailerCategory,
  subType: '',
  gvw: 0,
  price: 0,
  inStock: 0,
  leadTimeDays: 21,
  status: 'Available' as Trailer['status'],
  description: '',
};

const InventoryManagement = () => {
  const { state, actions } = useAppData();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [filterCat, setFilterCat] = useState<string>('');
  const [detailTrailer, setDetailTrailer] = useState<Trailer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState<Partial<Trailer>>({});

  const trailers = state.trailers;
  const filtered = filterCat ? trailers.filter(t => t.category === filterCat) : trailers;

  const catCounts: Record<string, number> = {};
  trailers.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + t.inStock; });

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const cols = ['modelNumber', 'name', 'category', 'subType', 'gvw', 'price', 'inStock', 'leadTimeDays', 'status'];
    const header = cols.join(',');
    const rows = filtered.map(t => cols.map(c => `"${(t as Record<string, unknown>)[c] ?? ''}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bb_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} trailers to CSV`);
  };

  // ── Add Trailer ──────────────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!form.name || !form.modelNumber) { toast.error('Name and Model # are required'); return; }
    actions.addTrailer({
      ...form,
      specs: [],
      options: [],
    });
    toast.success(`Trailer "${form.name}" added to inventory`);
    setShowAddModal(false);
    setForm(EMPTY_FORM);
  };

  // ── Update Trailer ───────────────────────────────────────────────────────────
  const handleUpdate = () => {
    if (!detailTrailer) return;
    actions.updateTrailer({ ...editForm, id: detailTrailer.id });
    toast.success('Trailer updated');
    setEditMode(false);
    setDetailTrailer(state.trailers.find(t => t.id === detailTrailer.id) ?? null);
  };

  const openDetail = (t: Trailer) => {
    setDetailTrailer(t);
    setEditForm({ name: t.name, modelNumber: t.modelNumber, subType: t.subType, gvw: t.gvw, price: t.price, inStock: t.inStock, leadTimeDays: t.leadTimeDays, status: t.status, description: t.description });
    setEditMode(false);
  };

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Trailer Inventory</h1>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAddModal(true); setForm(EMPTY_FORM); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:opacity-90 transition-opacity"
            >
              <Plus size={14} /> Add Trailer
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-border rounded-sm hover:bg-muted">
              {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[{ label: 'Total Models', v: trailers.length }, { label: 'Total Units', v: trailers.reduce((s, t) => s + t.inStock, 0) }, { label: 'Available', v: trailers.filter(t => t.status === 'Available').length }, { label: 'Low Stock', v: trailers.filter(t => t.status === 'Low Stock').length }, { label: 'Out of Stock', v: trailers.filter(t => t.status === 'Out of Stock').length }, { label: 'Custom Order', v: trailers.filter(t => t.status === 'Custom Order').length }].map(({ label, v }) => (
            <div key={label} className="bg-card/60 border border-white/5 rounded-lg p-3 text-center">
              <p className="font-mono text-lg font-bold text-white">{v}</p>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
            </div>
          ))}
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
              { key: 'price', label: 'Price', sortable: true, render: (t) => <span className="font-mono text-xs">£{t.price.toLocaleString()}</span> },
              { key: 'inStock', label: 'Stock', sortable: true, render: (t) => <span className={cn('font-mono text-xs font-bold', t.inStock === 0 ? 'text-danger' : t.inStock <= 3 ? 'text-warning' : 'text-success')}>{t.inStock}</span> },
              { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
              {
                key: 'actions', label: '', render: (t) => (
                  <button onClick={(e) => { e.stopPropagation(); openDetail(t); }} className="text-xs text-primary hover:underline font-display uppercase tracking-wide">
                    View/Edit
                  </button>
                )
              },
            ]}
            data={filtered}
            searchable
            searchPlaceholder="Search by model or name..."
            onRowClick={openDetail}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(t => (
              <div key={t.id} onClick={() => openDetail(t)} className="bg-card rounded-lg shadow-industrial p-4 cursor-pointer hover:border-primary/30 transition-all border border-white/5 group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs text-muted-foreground">{t.modelNumber}</span>
                  <StatusBadge status={t.status} />
                </div>
                <h3 className="font-display font-bold uppercase tracking-wide text-sm group-hover:text-primary transition-colors">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.category} — {t.subType}</p>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="font-display text-lg font-bold">£{t.price.toLocaleString()}</span>
                  <span className={cn('font-mono text-xs', t.inStock === 0 ? 'text-danger' : t.inStock <= 3 ? 'text-warning' : 'text-success')}>{t.inStock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Detail / Edit Modal ─────────────────────────────────────────────────── */}
        <Modal isOpen={!!detailTrailer} onClose={() => { setDetailTrailer(null); setEditMode(false); }} title={detailTrailer?.name || ''} wide>
          {detailTrailer && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status={detailTrailer.status} />
                  <span className="font-mono text-xs text-muted-foreground">{detailTrailer.modelNumber}</span>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide transition-all', editMode ? 'bg-muted' : 'bg-primary text-primary-foreground hover:opacity-90')}
                >
                  <Pencil size={12} /> {editMode ? 'Cancel Edit' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'name', label: 'Name', type: 'text' },
                      { key: 'modelNumber', label: 'Model #', type: 'text' },
                      { key: 'subType', label: 'Sub-Type', type: 'text' },
                      { key: 'gvw', label: 'GVW (lb)', type: 'number' },
                      { key: 'price', label: 'Price (£)', type: 'number' },
                      { key: 'inStock', label: 'In Stock', type: 'number' },
                      { key: 'leadTimeDays', label: 'Lead Time (days)', type: 'number' },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">{label}</label>
                        <input
                          type={type}
                          value={(editForm as Record<string, unknown>)[key] as string ?? ''}
                          onChange={e => setEditForm(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                          className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Status</label>
                      <select
                        value={editForm.status ?? detailTrailer.status}
                        onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as Trailer['status'] }))}
                        className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {['Available', 'Low Stock', 'Out of Stock', 'Custom Order'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Description</label>
                    <textarea
                      value={editForm.description ?? detailTrailer.description}
                      onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:opacity-90 transition-opacity"
                  >
                    <Save size={13} /> Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Category" value={`${detailTrailer.category} — ${detailTrailer.subType}`} />
                    <Field label="GVW" value={`${detailTrailer.gvw.toLocaleString()} lb`} />
                    <Field label="Base Price" value={<span className="font-display text-xl font-bold">£{detailTrailer.price.toLocaleString()}</span>} />
                    <Field label="Lead Time" value={`${detailTrailer.leadTimeDays} days`} />
                    <Field label="In Stock" value={<span className={cn('font-bold', detailTrailer.inStock > 5 ? 'text-success' : detailTrailer.inStock > 0 ? 'text-warning' : 'text-danger')}>{detailTrailer.inStock}</span>} />
                  </div>
                  <p className="text-sm text-muted-foreground">{detailTrailer.description}</p>
                  {detailTrailer.specs.length > 0 && (
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
                  )}
                  {detailTrailer.options.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Available Options</h4>
                      {detailTrailer.options.map(o => (
                        <div key={o.id} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                          <div>
                            <span className="text-sm font-medium">{o.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{o.description}</span>
                          </div>
                          <span className="font-mono text-sm text-primary">+£{o.priceAdd.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* ── Add Trailer Modal ───────────────────────────────────────────────────── */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Trailer" wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Name *', type: 'text', placeholder: 'e.g. Pull-Type Sprayer 80K' },
                { key: 'modelNumber', label: 'Model # *', type: 'text', placeholder: 'e.g. STX22A' },
                { key: 'subType', label: 'Sub-Type', type: 'text', placeholder: 'e.g. Sprayer Trailers' },
                { key: 'gvw', label: 'GVW (lb)', type: 'number', placeholder: '0' },
                { key: 'price', label: 'Price (£)', type: 'number', placeholder: '0' },
                { key: 'inStock', label: 'In Stock', type: 'number', placeholder: '0' },
                { key: 'leadTimeDays', label: 'Lead Time (days)', type: 'number', placeholder: '21' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as Record<string, unknown>)[key] as string ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value as TrailerCategory }))}
                  className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value as Trailer['status'] }))}
                  className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {['Available', 'Low Stock', 'Out of Stock', 'Custom Order'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                placeholder="Brief product description..."
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:opacity-90 transition-opacity">
                <Plus size={13} /> Add Trailer
              </button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default InventoryManagement;
