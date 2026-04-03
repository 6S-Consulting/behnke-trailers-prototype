import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Package, Store, TrendingUp, DollarSign, AlertTriangle, Wrench, ArrowRight, BarChart2, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAppData } from '@/context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const COLORS = ['hsl(0,72%,51%)', 'hsl(32,95%,52%)', 'hsl(152,69%,53%)', 'hsl(200,80%,55%)', 'hsl(280,65%,55%)', 'hsl(215,16%,52%)'];

const chartTooltipStyle = {
  backgroundColor: 'hsl(220 16% 8%)',
  borderColor: 'hsl(220 13% 18%)',
  borderRadius: 12,
  fontSize: 12,
  fontFamily: 'Inter',
  color: '#e2e8f0',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const AdminDashboard = () => {
  const { state } = useAppData();
  const navigate = useNavigate();

  const totalInventory = state.trailers.reduce((s, t) => s + t.inStock, 0);
  const activeDealers = state.dealers.filter(d => d.status === 'Active').length;
  const pendingDealers = state.dealers.filter(d => d.status === 'Pending').length;
  const criticalTrailers = state.soldTrailers.filter(t => t.sensorData.overallHealth === 'Critical' || t.sensorData.overallHealth === 'Warning');
  const pendingMaintCount = state.maintenanceSlots.filter(ms => ms.status === 'Requested').length;
  const deliveredOrders = state.orders.filter(o => o.status === 'Delivered');
  const totalRevenue = deliveredOrders.reduce((s, o) => s + o.totalPrice, 0);
  const activeOrders = state.orders.filter(o => !['Delivered', 'Cancelled', 'Draft'].includes(o.status));
  const recentOrders = state.orders.slice(0, 5);

  const categoryData = state.trailers.reduce<{ name: string; value: number }[]>((acc, t) => {
    const existing = acc.find(c => c.name === t.category);
    if (existing) existing.value += t.inStock;
    else acc.push({ name: t.category, value: t.inStock });
    return acc;
  }, []);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlySalesMap: Record<string, Record<string, number>> = {};
  state.orders.forEach(o => {
    const d = new Date(o.createdDate);
    const month = monthNames[d.getMonth()];
    if (!monthlySalesMap[month]) monthlySalesMap[month] = {};
    const cat = state.trailers.find(t => t.id === o.trailerId)?.category ?? 'Other';
    monthlySalesMap[month][cat] = (monthlySalesMap[month][cat] || 0) + o.quantity;
  });
  const monthlySales = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => ({
    month: m,
    Agricultural: monthlySalesMap[m]?.['Agricultural'] || 0,
    Construction: monthlySalesMap[m]?.['Construction'] || 0,
    'Heavy Haul': monthlySalesMap[m]?.['Heavy Haul'] || 0,
    Commercial: monthlySalesMap[m]?.['Commercial'] || 0,
    'Utility/Telecom': monthlySalesMap[m]?.['Utility/Telecom'] || 0,
  }));

  const pipelineStages = ['Submitted', 'Under Review', 'Approved', 'In Production', 'Shipped', 'Delivered'] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-steel">Command Center</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Fleet Operations</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/orders')} className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 hover:shadow-[0_0_20px_hsl(0_72%_51%/0.3)]" style={{ background: 'linear-gradient(135deg, hsl(0 72% 51%), hsl(0 72% 41%))' }}>
              Manage Orders
            </button>
            <button onClick={() => navigate('/admin/health')} className="px-4 py-2 rounded-lg text-xs font-semibold border border-white/[0.08] text-steel hover:text-foreground hover:border-primary/30 transition-all active:scale-95" style={{ background: 'hsl(220 16% 10%)' }}>
              Fleet Health
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {[
            <MetricCard key="inv" title="Total Inventory" value={totalInventory} icon={Package} subtitle={`${state.trailers.length} models`} href="/admin/inventory" />,
            <MetricCard key="deal" title="Active Dealers" value={activeDealers} icon={Store} href="/admin/dealers" />,
            <MetricCard key="sold" title="Sold Trailers" value={state.soldTrailers.length} icon={TrendingUp} subtitle="Quarterly total" href="/admin/health" />,
            <MetricCard key="rev" title="Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} subtitle="Quarterly total" href="/admin/orders" />,
            <MetricCard key="alert" title="Health Alerts" value={criticalTrailers.length} icon={AlertTriangle} subtitle={`${state.soldTrailers.filter(t => t.sensorData.overallHealth === 'Critical').length} Critical`} href="/admin/health" trendDown={criticalTrailers.length > 3} />,
            <MetricCard key="maint" title="Pending Maint." value={pendingMaintCount} icon={Wrench} href="/admin/maintenance" />,
          ].map((card, i) => (
            <motion.div key={i} className="h-full" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
              {card}
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 relative overflow-hidden rounded-xl p-5 border border-white/[0.06] transition-all hover:border-white/[0.1]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(0 72% 51%), hsl(32 95% 52%), transparent)' }} />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel mb-4">Monthly Sales by Category</h3>
            {monthlySales.every(m => !m.Agricultural && !m.Construction && !m['Heavy Haul'] && !m.Commercial && !m['Utility/Telecom']) ? (
              <div className="flex items-center justify-center h-[260px]">
                <EmptyState icon={BarChart2} title="No Sales Data Yet" description="Sales will appear here as orders are placed" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlySales} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 14%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(215 16% 52%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(215 16% 52%)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: '#e2e8f0' }} cursor={{ fill: 'hsl(220 16% 12%)' }} />
                  <Bar dataKey="Agricultural" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Construction" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Heavy Haul" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Commercial" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Utility/Telecom" fill={COLORS[4]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 relative overflow-hidden rounded-xl p-5 border border-white/[0.06] transition-all hover:border-white/[0.1]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(32 95% 52%), hsl(0 72% 51%), transparent)' }} />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel mb-4">Inventory by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: 'hsl(215 16% 52%)' }} />
                <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Production Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
          style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(0 72% 51%), hsl(32 95% 52%), hsl(152 69% 53%), transparent)' }} />
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">Production Pipeline</h3>
            <span className="text-[10px] font-mono text-steel/60">{activeOrders.length} active orders</span>
          </div>
          <div className="flex items-center gap-2">
            {pipelineStages.map((stage, i) => {
              const count = state.orders.filter(o => o.status === stage).length;
              const isActive = count > 0;
              return (
                <div key={stage} className="flex items-center flex-1">
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className={cn(
                      'flex-1 text-center py-4 px-2 rounded-xl transition-all duration-200 border',
                      isActive
                        ? 'border-primary/20 hover:border-primary/40 hover:shadow-[0_0_16px_hsl(0_72%_51%/0.1)]'
                        : 'border-white/[0.04] hover:border-white/[0.08]'
                    )}
                    style={{ background: isActive ? 'linear-gradient(145deg, hsl(0 72% 51% / 0.08), hsl(0 72% 51% / 0.02))' : 'hsl(220 16% 8%)' }}
                  >
                    <span className={cn('text-xl font-display font-bold tabular-nums', isActive ? 'text-primary' : 'text-steel/50')}>{count}</span>
                    <span className="text-[7px] font-mono uppercase tracking-[0.15em] text-steel mt-1.5 block">{stage}</span>
                  </button>
                  {i < pipelineStages.length - 1 && (
                    <div className="flex items-center mx-1">
                      <div className={cn('w-4 h-[1px]', isActive ? 'bg-primary/30' : 'bg-white/[0.06]')} />
                      <ArrowRight size={10} className={cn(isActive ? 'text-primary/40' : 'text-white/[0.08]')} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(200 80% 55%), hsl(0 72% 51%), transparent)' }} />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">Recent Orders</h3>
              <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-semibold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>
            <DataTable
              columns={[
                { key: 'orderNumber', label: 'Order #', sortable: true, render: (o) => <span className="font-mono text-xs text-foreground">{o.orderNumber}</span> },
                {
                  key: 'fromId', label: 'From', render: (o) => {
                    const d = state.dealers.find(d => d.id === o.fromId);
                    return <span className="text-xs text-steel">{d?.name || o.fromId}</span>;
                  }
                },
                { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs">{o.trailerName || '—'}</span> },
                { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              ]}
              data={recentOrders}
              pageSize={5}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(0 72% 51%), hsl(38 92% 50%), transparent)' }} />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">Health Alerts</h3>
              <button onClick={() => navigate('/admin/health')} className="text-[10px] font-semibold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>
            <DataTable
              columns={[
                {
                  key: 'vin', label: 'VIN', render: (t) => (
                    <button onClick={() => navigate(`/admin/health/${t.vin}`)} className="font-mono text-xs text-primary hover:text-primary/80 transition-colors">{t.vin}</button>
                  )
                },
                { key: 'modelNumber', label: 'Model', render: (t) => <span className="text-xs text-steel">{t.modelNumber}</span> },
                { key: 'health', label: 'Health', render: (t) => <StatusBadge status={t.sensorData.overallHealth} breathing /> },
                {
                  key: 'issue', label: 'Issue', render: (t) => (
                    <span className="text-xs text-steel italic">
                      {t.sensorData.brakePadWear < 20 ? 'Brake wear low' : t.sensorData.axleTemp > 200 ? 'High axle temp' : t.sensorData.frameMicrofractures ? 'Frame alert' : 'Multiple alerts'}
                    </span>
                  )
                },
              ]}
              data={criticalTrailers}
              pageSize={5}
            />
          </motion.div>
        </div>

        {/* Maintenance Banner */}
        {pendingMaintCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl p-4 flex items-center justify-between border border-amber-500/20"
            style={{ background: 'linear-gradient(135deg, hsl(32 95% 52% / 0.06), hsl(32 95% 52% / 0.02))' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
                <Wrench size={14} className="text-amber-400" />
              </div>
              <span className="text-sm font-medium text-foreground">{pendingMaintCount} maintenance {pendingMaintCount === 1 ? 'request' : 'requests'} awaiting confirmation</span>
            </div>
            <button onClick={() => navigate('/admin/maintenance')} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide">Review Requests</button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
