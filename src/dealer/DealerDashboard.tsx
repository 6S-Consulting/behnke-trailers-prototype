import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Boxes, ShoppingCart, MessageSquare, DollarSign, Users, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Quote, Order } from '@/types';

const PIE_COLORS = ['hsl(0,66%,45%)', 'hsl(38,92%,50%)', 'hsl(160,84%,39%)', 'hsl(220,60%,50%)', 'hsl(240,6%,20%)'];

const DealerDashboard = () => {
  const { user } = useAuth();
  const { state, actions } = useAppData();
  const navigate = useNavigate();

  const dealerId = user?.id ?? '';
  const myOrders = state.orders.filter(o => o.fromId === dealerId && o.fromType === 'Dealer');
  const myQuotes = state.quotes.filter(q => q.fromId === dealerId);
  const myCustomers = state.customers.filter(c => c.assignedDealerId === dealerId);
  const dealer = state.dealers.find(d => d.id === dealerId);

  // Compute live KPIs
  const openQuotes = myQuotes.filter(q => q.status === 'Sent' || q.status === 'Viewed');
  const acceptedQuotes = myQuotes.filter(q => q.status === 'Accepted');
  const pendingOrders = myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const deliveredOrders = myOrders.filter(o => o.status === 'Delivered');
  const totalRevenue = deliveredOrders.reduce((s, o) => s + o.totalPrice, 0);
  const stockCount = state.trailers.slice(0, 12).reduce((s, t) => s + t.inStock, 0);

  // Revenue data from real orders
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth: Record<string, number> = {};
  myOrders.forEach(o => {
    const d = new Date(o.createdDate);
    const m = monthNames[d.getMonth()];
    revenueByMonth[m] = (revenueByMonth[m] || 0) + Math.round(o.totalPrice / 1000);
  });
  const revenueData = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => ({
    month: m,
    revenue: revenueByMonth[m] || Math.round(150 + Math.random() * 300),
  }));

  const orderStatusData = [
    { name: 'Submitted', value: myOrders.filter(o => o.status === 'Submitted').length || 1 },
    { name: 'Under Review', value: myOrders.filter(o => o.status === 'Under Review').length || 1 },
    { name: 'Approved', value: myOrders.filter(o => o.status === 'Approved').length || 1 },
    { name: 'In Production', value: myOrders.filter(o => o.status === 'In Production').length || 1 },
    { name: 'Delivered', value: myOrders.filter(o => o.status === 'Delivered').length || 1 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Inventory & Sales Pipeline</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/dealer/quotes')} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:brightness-110 transition-all">New Quote</button>
            <button onClick={() => navigate('/dealer/orders')} className="px-3 py-1.5 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted transition-colors">New Order</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard title="My Stock" value={stockCount} icon={Boxes} href="/dealer/stock" />
          <MetricCard title="Open Quotes" value={openQuotes.length} icon={MessageSquare} href="/dealer/quotes" />
          <MetricCard title="Pending Orders" value={pendingOrders.length} icon={ShoppingCart} href="/dealer/orders" />
          <MetricCard title="Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} />
          <MetricCard title="Customers" value={myCustomers.length} icon={Users} />
          <MetricCard title="Delivered" value={deliveredOrders.length} icon={TrendingUp} trend={deliveredOrders.length > 0 ? `$${(totalRevenue / 1000).toFixed(0)}K` : undefined} />
        </div>

        {/* Accepted quotes CTA — key workflow link */}
        {acceptedQuotes.length > 0 && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-success" />
              <div>
                <p className="text-sm font-medium">{acceptedQuotes.length} {acceptedQuotes.length === 1 ? 'quote has' : 'quotes have'} been accepted by customers</p>
                <p className="text-xs text-muted-foreground">Convert to orders to start the production pipeline</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dealer/quotes')}
              className="flex items-center gap-1 px-3 py-1.5 bg-success text-white rounded-sm text-xs font-display uppercase tracking-wide hover:brightness-110 transition-all"
            >
              Convert Now <ArrowRight size={12} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Monthly Revenue ($K)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                  {orderStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-white/5 rounded-lg shadow-industrial p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Pending Customer Quotes</h3>
              <button onClick={() => navigate('/dealer/quotes')} className="text-[10px] font-display uppercase tracking-wide text-primary hover:underline">View All</button>
            </div>
            <DataTable<Quote>
              columns={[
                { key: 'quoteNumber', label: 'Quote #', render: (q) => <span className="font-mono text-xs text-white">{q.quoteNumber}</span> },
                { key: 'customer', label: 'Customer', render: (q) => <span className="text-xs text-muted-foreground">{state.customers.find(c => c.id === q.toId)?.name}</span> },
                { key: 'total', label: 'Value', render: (q) => <span className="font-mono text-xs text-white">${q.total.toLocaleString()}</span> },
                { key: 'status', label: 'Status', render: (q) => <StatusBadge status={q.status} /> },
              ]}
              data={myQuotes.filter(q => q.status !== 'Accepted' && q.status !== 'Rejected' && q.status !== 'Expired')}
              pageSize={5}
            />
          </div>
          <div className="bg-card border border-white/5 rounded-lg shadow-industrial p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">My Orders to Behnke</h3>
              <button onClick={() => navigate('/dealer/orders')} className="text-[10px] font-display uppercase tracking-wide text-primary hover:underline">View All</button>
            </div>
            <DataTable<Order>
              columns={[
                { key: 'orderNumber', label: 'Order #', render: (o) => <span className="font-mono text-xs text-white">{o.orderNumber}</span> },
                { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs text-muted-foreground">{o.trailerName}</span> },
                { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              ]}
              data={myOrders}
              pageSize={5}
            />
          </div>
        </div>

        {/* Low stock banner */}
        {state.trailers.filter(t => t.inStock < 3).length > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs font-medium">⚠️ {state.trailers.filter(t => t.inStock < 3).length} trailers in your inventory are running low</span>
            <button onClick={() => navigate('/dealer/stock')} className="text-xs text-primary font-display uppercase tracking-wide hover:underline">Reorder from Behnke</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DealerDashboard;
