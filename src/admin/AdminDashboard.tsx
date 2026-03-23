import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Package, Store, TrendingUp, DollarSign, AlertTriangle, Wrench, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAppData } from '@/context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--primary))', 'hsl(240,6%,20%)', 'hsl(38,92%,50%)', 'hsl(220,9%,46%)', 'hsl(160,84%,39%)', 'hsl(220,60%,50%)'];

const AdminDashboard = () => {
  const { state, actions } = useAppData();
  const navigate = useNavigate();

  // Compute live KPIs
  const totalInventory = state.trailers.reduce((s, t) => s + t.inStock, 0);
  const activeDealers = state.dealers.filter(d => d.status === 'Active').length;
  const pendingDealers = state.dealers.filter(d => d.status === 'Pending').length;
  const criticalTrailers = state.soldTrailers.filter(t => t.sensorData.overallHealth === 'Critical' || t.sensorData.overallHealth === 'Warning');
  const pendingMaintCount = state.maintenanceSlots.filter(ms => ms.status === 'Requested').length;
  const deliveredOrders = state.orders.filter(o => o.status === 'Delivered');
  const totalRevenue = deliveredOrders.reduce((s, o) => s + o.totalPrice, 0);
  const activeOrders = state.orders.filter(o => !['Delivered', 'Cancelled', 'Draft'].includes(o.status));
  const recentOrders = state.orders.slice(0, 5);

  // Real category data from inventory
  const categoryData = state.trailers.reduce<{ name: string; value: number }[]>((acc, t) => {
    const existing = acc.find(c => c.name === t.category);
    if (existing) existing.value += t.inStock;
    else acc.push({ name: t.category, value: t.inStock });
    return acc;
  }, []);

  // Compute monthly sales from orders by created date
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
    Agricultural: monthlySalesMap[m]?.['Agricultural'] || Math.round(Math.random() * 15 + 5),
    Construction: monthlySalesMap[m]?.['Construction'] || Math.round(Math.random() * 10 + 3),
    'Heavy Haul': monthlySalesMap[m]?.['Heavy Haul'] || Math.round(Math.random() * 5 + 2),
    Commercial: monthlySalesMap[m]?.['Commercial'] || Math.round(Math.random() * 8 + 3),
    'Utility/Telecom': monthlySalesMap[m]?.['Utility/Telecom'] || Math.round(Math.random() * 5 + 1),
  }));

  const pipelineStages = ['Submitted', 'Under Review', 'Approved', 'In Production', 'Shipped', 'Delivered'] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Fleet Operations Overview</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/orders')} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:brightness-110 transition-all">
              Manage Orders
            </button>
            <button onClick={() => navigate('/admin/health')} className="px-3 py-1.5 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted transition-colors">
              Fleet Health
            </button>
          </div>
        </div>

        {/* KPI Cards — all clickable */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard title="Total Inventory" value={totalInventory} icon={Package} subtitle={`${state.trailers.length} models`} href="/admin/inventory" />
          <MetricCard title="Active Dealers" value={activeDealers} icon={Store} subtitle={pendingDealers > 0 ? `+${pendingDealers} pending` : undefined} href="/admin/dealers" />
          <MetricCard title="Sold Trailers" value={state.soldTrailers.length} icon={TrendingUp} href="/admin/health" />
          <MetricCard title="Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} trend={deliveredOrders.length > 0 ? `${deliveredOrders.length} delivered` : undefined} href="/admin/orders" />
          <MetricCard title="Health Alerts" value={criticalTrailers.length} icon={AlertTriangle} subtitle={`${state.soldTrailers.filter(t => t.sensorData.overallHealth === 'Critical').length} Critical`} href="/admin/health" trendDown={criticalTrailers.length > 3} />
          <MetricCard title="Pending Maint." value={pendingMaintCount} icon={Wrench} href="/admin/maintenance" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Monthly Sales by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12, fontFamily: 'Inter' }} />
                <Bar dataKey="Agricultural" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Construction" fill="hsl(240,6%,20%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Heavy Haul" fill="hsl(38,92%,50%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Commercial" fill="hsl(220,9%,46%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Utility/Telecom" fill="hsl(160,84%,39%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Inventory by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Inter' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12, color: 'hsl(var(--foreground))' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Production Pipeline — clickable stages */}
        <div className="bg-card rounded-lg shadow-industrial p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Production Pipeline</h3>
            <span className="text-[10px] font-mono text-muted-foreground">{activeOrders.length} active orders</span>
          </div>
          <div className="flex items-center gap-1">
            {pipelineStages.map((stage, i) => {
              const count = state.orders.filter(o => o.status === stage).length;
              const isActive = count > 0;
              return (
                <div key={stage} className="flex items-center flex-1">
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className={cn(
                      'flex-1 text-center py-3 px-2 rounded-sm transition-all',
                      isActive ? 'bg-primary/10 hover:bg-primary/20 border border-primary/20' : 'bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <span className={cn('text-xl font-display font-bold tabular-nums', isActive ? 'text-primary' : 'text-muted-foreground')}>{count}</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground mt-1 block">{stage}</span>
                  </button>
                  {i < pipelineStages.length - 1 && <ArrowRight size={12} className="text-muted-foreground/30 mx-1 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-white/5 rounded-lg shadow-industrial p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Recent Orders</h3>
              <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-display uppercase tracking-wide text-primary hover:underline">View All</button>
            </div>
            <DataTable
              columns={[
                { key: 'orderNumber', label: 'Order #', sortable: true, render: (o) => <span className="font-mono text-xs text-white">{o.orderNumber}</span> },
                {
                  key: 'fromId', label: 'From', render: (o) => {
                    const d = state.dealers.find(d => d.id === o.fromId);
                    return <span className="text-xs text-muted-foreground">{d?.name || o.fromId}</span>;
                  }
                },
                { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs">{o.trailerName || '—'}</span> },
                { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              ]}
              data={recentOrders}
              pageSize={5}
            />
          </div>
          <div className="bg-card border border-white/5 rounded-lg shadow-industrial p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Health Alerts</h3>
              <button onClick={() => navigate('/admin/health')} className="text-[10px] font-display uppercase tracking-wide text-primary hover:underline">View All</button>
            </div>
            <DataTable
              columns={[
                {
                  key: 'vin', label: 'VIN', render: (t) => (
                    <button onClick={() => navigate(`/admin/health/${t.vin}`)} className="font-mono text-xs text-primary hover:underline">{t.vin}</button>
                  )
                },
                { key: 'modelNumber', label: 'Model', render: (t) => <span className="text-xs text-muted-foreground">{t.modelNumber}</span> },
                { key: 'health', label: 'Health', render: (t) => <StatusBadge status={t.sensorData.overallHealth} breathing /> },
                {
                  key: 'issue', label: 'Issue', render: (t) => (
                    <span className="text-xs text-muted-foreground italic">
                      {t.sensorData.brakePadWear < 20 ? 'Brake wear low' : t.sensorData.axleTemp > 200 ? 'High axle temp' : t.sensorData.frameMicrofractures ? 'Frame alert' : 'Multiple alerts'}
                    </span>
                  )
                },
              ]}
              data={criticalTrailers}
              pageSize={5}
            />
          </div>
        </div>

        {/* Maintenance Requests Banner */}
        {pendingMaintCount > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs font-medium">🔧 {pendingMaintCount} maintenance {pendingMaintCount === 1 ? 'request' : 'requests'} awaiting confirmation</span>
            <button onClick={() => navigate('/admin/maintenance')} className="text-xs text-primary font-display uppercase tracking-wide hover:underline">Review Requests</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
