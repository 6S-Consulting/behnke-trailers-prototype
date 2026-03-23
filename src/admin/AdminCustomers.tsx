import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MetricCard } from '@/components/shared/MetricCard';
import { Modal } from '@/components/shared/Modal';
import { useAppData } from '@/context/AppDataContext';
import { Customer, SoldTrailer } from '@/types';
import { Users, Truck, Store, Phone, Mail, MapPin, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminCustomers = () => {
  const { state } = useAppData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [tab, setTab] = useState<'overview' | 'trailers' | 'orders'>('overview');
  const [filterState, setFilterState] = useState('');

  const allStates = [...new Set(state.customers.map(c => c.state))].sort();

  const filtered = state.customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchState = !filterState || c.state === filterState;
    return matchSearch && matchState;
  });

  const openCustomer = (c: Customer) => { setSelected(c); setTab('overview'); };

  const getDealer = (c: Customer) => state.dealers.find(d => d.id === c.assignedDealerId);
  const getTrailers = (c: Customer): SoldTrailer[] => state.soldTrailers.filter(st => st.customerId === c.id);
  const getOrders = (c: Customer) => state.orders.filter(o => o.fromId === c.id || o.customerId === c.id);

  const totalCustomers = state.customers.length;
  const totalRevenue = state.orders
    .filter(o => o.fromType === 'Customer' && o.status === 'Delivered')
    .reduce((s, o) => s + o.totalPrice, 0);
  const criticalCount = state.soldTrailers.filter(st => {
    const c = state.customers.find(c2 => c2.id === st.customerId);
    return c && st.sensorData.overallHealth === 'Critical';
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Customer Management</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard title="Total Customers" value={totalCustomers} icon={Users} />
          <MetricCard title="Sold Trailers" value={state.soldTrailers.length} icon={Truck} />
          <MetricCard title="Active Dealers" value={state.dealers.filter(d => d.status === 'Active').length} icon={Store} />
          <MetricCard title="Cust. Revenue" value={`£${(totalRevenue / 1000).toFixed(0)}K`} icon={Package} trendDown={false} />
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, company, email..."
              className="w-full pl-4 pr-3 py-2 text-sm bg-card border border-white/5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="px-3 py-2 text-sm bg-card border border-white/5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All States</option>
            {allStates.map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="text-xs text-muted-foreground">{filtered.length} customers</span>
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => {
            const dealer = getDealer(c);
            const trailers = getTrailers(c);
            const criticalT = trailers.filter(t => t.sensorData.overallHealth === 'Critical');
            const orders = getOrders(c);
            return (
              <div
                key={c.id}
                onClick={() => openCustomer(c)}
                className="bg-card/60 border border-white/5 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.company}</p>
                  </div>
                  {criticalT.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-danger/20 text-danger text-[10px] font-mono rounded-sm border border-danger/20">
                      {criticalT.length} Critical
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin size={10} />
                  <span>{c.state}</span>
                  <span className="mx-1">·</span>
                  <Store size={10} />
                  <span>{dealer?.name ?? '—'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <p className="font-mono text-sm font-bold text-white">{trailers.length}</p>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Trailers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-sm font-bold text-white">{orders.length}</p>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-sm font-bold text-white">{c.ownedTrailers.length}</p>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Owned</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Customer Detail Modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} wide>
          {selected && (() => {
            const dealer = getDealer(selected);
            const trailers = getTrailers(selected);
            const orders = getOrders(selected);
            const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
            return (
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/5 pb-2">
                  {(['overview', 'trailers', 'orders'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1 text-xs font-display uppercase tracking-wide rounded-sm', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
                      {t}
                    </button>
                  ))}
                </div>

                {/* Overview */}
                {tab === 'overview' && (
                  <div className="space-y-4">
                    {/* KPI strip */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Owned Trailers', value: trailers.length },
                        { label: 'Total Orders', value: orders.length },
                        { label: 'Active Orders', value: activeOrders.length },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/5 rounded-lg p-3 text-center">
                          <p className="font-display text-2xl font-bold text-white">{value}</p>
                          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2"><Phone size={13} className="text-muted-foreground" /><span>{selected.phone}</span></div>
                      <div className="flex items-center gap-2"><Mail size={13} className="text-muted-foreground" /><span className="truncate">{selected.email}</span></div>
                      <div className="flex items-center gap-2 col-span-2"><MapPin size={13} className="text-muted-foreground shrink-0" /><span>{selected.address}</span></div>
                    </div>
                    <div><p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Joined</p><p className="text-sm">{selected.joinDate}</p></div>
                    {/* Assigned Dealer */}
                    {dealer && (
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Assigned Dealer</p>
                        <p className="text-sm font-bold text-white">{dealer.name}</p>
                        <p className="text-xs text-muted-foreground">{dealer.contactName} · {dealer.phone}</p>
                        <p className="text-xs text-muted-foreground">{dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</p>
                        <p className="text-xs text-muted-foreground mt-1">{dealer.email}</p>
                        <StatusBadge status={dealer.status} className="mt-2" />
                      </div>
                    )}
                  </div>
                )}

                {/* Trailers */}
                {tab === 'trailers' && (
                  <div className="space-y-2">
                    {trailers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No trailers owned.</p>
                    ) : trailers.map(t => (
                      <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-white">{t.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">VIN: {t.vin} · {t.modelNumber}</p>
                          <p className="text-xs text-muted-foreground">Purchased: {t.soldDate} · Warranty: {t.warrantyExpiry}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden md:block">
                            <p className="text-xs font-mono">{t.sensorData.mileage.toLocaleString()} mi</p>
                            <p className="text-[10px] text-muted-foreground">Brakes: {t.sensorData.brakePadWear}%</p>
                          </div>
                          <StatusBadge status={t.sensorData.overallHealth} breathing={t.sensorData.overallHealth === 'Critical'} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Orders */}
                {tab === 'orders' && (
                  <div className="space-y-2">
                    {orders.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No orders found.</p>
                    ) : orders.map(o => {
                      const d = o.fromType === 'Dealer' ? state.dealers.find(dl => dl.id === o.fromId || dl.id === o.toId) : dealer;
                      return (
                        <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                          <div>
                            <p className="font-mono text-xs text-white">{o.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{o.trailerName} · Qty {o.quantity}</p>
                            {d && <p className="text-[10px] text-muted-foreground">via {d.name}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-bold text-white">£{o.totalPrice.toLocaleString()}</p>
                            <StatusBadge status={o.status} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminCustomers;
