import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { useAppData } from '@/context/AppDataContext';
import { ArrowLeft, Phone, Mail, MapPin, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'framer-motion';

const DealerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAppData();
  const [tab, setTab] = useState<'overview' | 'orders' | 'customers'>('overview');

  const dealer = state.dealers.find(d => d.id === id);
  if (!dealer) {
    return (
      <DashboardLayout>
        <div className="text-sm text-muted-foreground">Dealer not found.</div>
      </DashboardLayout>
    );
  }

  const dealerOrders = state.orders.filter(o => o.fromId === dealer.id || o.toId === dealer.id);
  const dealerCustomers = state.customers.filter(c => c.assignedDealerId === dealer.id);
  const deliveredOrders = dealerOrders.filter(o => o.status === 'Delivered');
  const totalRevenue = deliveredOrders.reduce((s, o) => s + o.totalPrice, 0);
  const activeOrders = dealerOrders.filter(o => !['Delivered', 'Cancelled', 'Draft'].includes(o.status));

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/dealers')} className="p-1.5 border border-white/10 rounded-sm hover:bg-muted transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{dealer.name}</h1>
              <StatusBadge status={dealer.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{dealer.city}, {dealer.state} · {dealer.territory.join(', ')}</p>
          </div>
        </div>

        {/* KPI Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {[
            { label: 'Total Orders', value: dealerOrders.length, color: 'text-white' },
            { label: 'Active Orders', value: activeOrders.length, color: 'text-primary' },
            { label: 'Customers Served', value: dealerCustomers.length, color: 'text-white' },
            { label: 'Revenue (Delivered)', value: `�$${(totalRevenue / 1000).toFixed(0)}K`, color: 'text-success' },
          ].map(({ label, value, color }) => (
            <motion.div key={label} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
                <p className={cn('font-display text-2xl font-bold', color)}>{value}</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/5 pb-1">
          {(['overview', 'orders', 'customers'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-1.5 text-xs font-display uppercase tracking-wide rounded-sm transition-colors', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-5 space-y-4 hover:border-white/[0.12] transition-colors">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users size={14} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{dealer.contactName}</p>
                    <p className="text-[10px] text-muted-foreground">Primary Contact</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-muted-foreground shrink-0" />
                  <a href={`tel:${dealer.phone}`} className="text-sm hover:text-primary transition-colors">{dealer.phone}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-muted-foreground shrink-0" />
                  <a href={`mailto:${dealer.email}`} className="text-sm hover:text-primary transition-colors">{dealer.email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-muted-foreground shrink-0" />
                  <p className="text-sm">{dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</p>
                </div>
              </div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-5 space-y-3 hover:border-white/[0.12] transition-colors">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Business Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Status</p><StatusBadge status={dealer.status} /></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Joined</p><p className="font-medium">{dealer.joinDate}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Territory</p><p className="font-medium">{dealer.territory.join(', ')}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Inventory Count</p><p className="font-mono font-bold text-white">{dealer.inventoryCount}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Total Sales (Reported)</p><p className="font-display font-bold text-success text-lg">�${(dealer.totalSales / 1000).toFixed(0)}K</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Orders */}
        {tab === 'orders' && (
          <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
            <DataTable
              columns={[
                { key: 'orderNumber', label: 'Order #', sortable: true, render: (o) => <span className="font-mono text-xs text-white">{o.orderNumber}</span> },
                { key: 'type', label: 'Type', render: (o) => <StatusBadge status={o.type} /> },
                { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs">{o.trailerName || '—'}</span> },
                { key: 'quantity', label: 'Qty', render: (o) => <span className="font-mono text-xs">{o.quantity}</span> },
                { key: 'totalPrice', label: 'Total', sortable: true, render: (o) => <span className="font-mono text-xs font-medium">�${o.totalPrice.toLocaleString()}</span> },
                { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
                { key: 'createdDate', label: 'Date', sortable: true, render: (o) => <span className="text-xs text-muted-foreground">{o.createdDate}</span> },
              ]}
              data={dealerOrders}
              searchable
              searchPlaceholder="Search orders..."
            />
          </div>
        )}

        {/* Tab: Customers */}
        {tab === 'customers' && (
          <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
            {dealerCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No customers assigned to this dealer.</p>
            ) : (
              <div className="space-y-1">
                {dealerCustomers.map(c => {
                  const customerOrders = state.orders.filter(o => o.fromId === c.id);
                  const ownedTrailers = state.soldTrailers.filter(st => st.customerId === c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.company} · {c.state}</p>
                      </div>
                      <div className="flex items-center gap-6 text-center">
                        <div><p className="font-mono text-sm font-bold text-white">{ownedTrailers.length}</p><p className="text-[9px] font-mono uppercase text-muted-foreground">Trailers</p></div>
                        <div><p className="font-mono text-sm font-bold text-white">{customerOrders.length}</p><p className="text-[9px] font-mono uppercase text-muted-foreground">Orders</p></div>
                        <p className="text-xs text-muted-foreground hidden md:block">{c.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DealerDetail;
