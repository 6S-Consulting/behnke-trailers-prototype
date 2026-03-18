import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { trailers } from '@/data/trailers';
import { dealers } from '@/data/dealers';
import { orders } from '@/data/orders';
import { soldTrailers } from '@/data/soldTrailers';
import { Package, Store, TrendingUp, DollarSign, AlertTriangle, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const monthlySales = [
  { month: 'Oct', Agricultural: 12, Construction: 8, 'Heavy Haul': 4, Commercial: 6, 'Utility/Telecom': 3 },
  { month: 'Nov', Agricultural: 9, Construction: 10, 'Heavy Haul': 5, Commercial: 7, 'Utility/Telecom': 4 },
  { month: 'Dec', Agricultural: 6, Construction: 7, 'Heavy Haul': 3, Commercial: 5, 'Utility/Telecom': 2 },
  { month: 'Jan', Agricultural: 14, Construction: 9, 'Heavy Haul': 6, Commercial: 8, 'Utility/Telecom': 5 },
  { month: 'Feb', Agricultural: 18, Construction: 11, 'Heavy Haul': 4, Commercial: 7, 'Utility/Telecom': 3 },
  { month: 'Mar', Agricultural: 22, Construction: 13, 'Heavy Haul': 7, Commercial: 9, 'Utility/Telecom': 6 },
];

const categoryData = [
  { name: 'Agricultural', value: 87 },
  { name: 'Construction', value: 62 },
  { name: 'Heavy Haul', value: 34 },
  { name: 'Commercial', value: 28 },
  { name: 'Utility/Telecom', value: 21 },
  { name: 'OEM', value: 15 },
];
const COLORS = ['hsl(var(--primary))', 'hsl(240,6%,20%)', 'hsl(38,92%,50%)', 'hsl(220,9%,46%)', 'hsl(160,84%,39%)', 'hsl(220,60%,50%)'];

const criticalTrailers = soldTrailers.filter(t => t.sensorData.overallHealth === 'Critical' || t.sensorData.overallHealth === 'Warning');

const AdminDashboard = () => {
  const recentOrders = orders.slice(0, 5);
  const activeDealers = dealers.filter(d => d.status === 'Active').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Fleet Operations Overview</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard title="Total Inventory" value={trailers.reduce((s, t) => s + t.inStock, 0)} icon={Package} trend="↑12 this month" />
          <MetricCard title="Active Dealers" value={activeDealers} icon={Store} subtitle={`+${dealers.filter(d => d.status === 'Pending').length} pending`} />
          <MetricCard title="Sold YTD" value={184} icon={TrendingUp} trend="↑23%" />
          <MetricCard title="Revenue YTD" value="$8.4M" icon={DollarSign} trend="↑18%" />
          <MetricCard title="Health Alerts" value={criticalTrailers.length} icon={AlertTriangle} subtitle="3 Critical" />
          <MetricCard title="Pending Maint." value={14} icon={Wrench} />
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
                <Bar dataKey="Agricultural" fill="hsl(var(--primary))" radius={[2,2,0,0]} />
                <Bar dataKey="Construction" fill="hsl(240,6%,20%)" radius={[2,2,0,0]} />
                <Bar dataKey="Heavy Haul" fill="hsl(38,92%,50%)" radius={[2,2,0,0]} />
                <Bar dataKey="Commercial" fill="hsl(220,9%,46%)" radius={[2,2,0,0]} />
                <Bar dataKey="Utility/Telecom" fill="hsl(160,84%,39%)" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Inventory by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: 'Inter' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Recent Orders</h3>
            <DataTable
              columns={[
                { key: 'orderNumber', label: 'Order #', sortable: true, render: (o) => <span className="font-mono text-xs text-white">{o.orderNumber}</span> },
                { key: 'fromId', label: 'From', render: (o) => {
                  const d = dealers.find(d => d.id === o.fromId);
                  return <span className="text-xs text-muted-foreground">{d?.name || o.fromId}</span>;
                }},
                { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs">{o.trailerName || '—'}</span> },
                { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              ]}
              data={recentOrders}
              pageSize={5}
            />
          </div>
          <div className="bg-card border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Health Alerts</h3>
            <DataTable
              columns={[
                { key: 'vin', label: 'VIN', render: (t) => <span className="font-mono text-xs text-white">{t.vin}</span> },
                { key: 'modelNumber', label: 'Model', render: (t) => <span className="text-xs text-muted-foreground">{t.modelNumber}</span> },
                { key: 'health', label: 'Health', render: (t) => <StatusBadge status={t.sensorData.overallHealth} breathing /> },
                { key: 'issue', label: 'Issue', render: (t) => (
                  <span className="text-xs text-muted-foreground italic">
                    {t.sensorData.brakePadWear < 20 ? 'Brake wear low' : t.sensorData.axleTemp > 200 ? 'High axle temp' : t.sensorData.frameMicrofractures ? 'Frame alert' : 'Multiple alerts'}
                  </span>
                )},
              ]}
              data={criticalTrailers}
              pageSize={5}
            />
          </div>
        </div>

        {/* Production Pipeline */}
        <div className="bg-card rounded-lg shadow-industrial p-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Production Pipeline</h3>
          <div className="flex items-center gap-2">
            {['Submitted', 'Under Review', 'Approved', 'In Production', 'Shipped', 'Delivered'].map((stage) => {
              const count = orders.filter(o => o.status === stage).length;
              return (
                <div key={stage} className="flex-1 text-center">
                  <div className="bg-muted rounded-sm py-3 px-2">
                    <span className="text-xl font-display font-bold tabular-nums">{count}</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mt-1 block">{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
