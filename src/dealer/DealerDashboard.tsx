import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Boxes, ShoppingCart, MessageSquare, DollarSign, Users, TrendingUp, ArrowRight, CheckCircle2, BarChart2, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Quote, Order } from '@/types';
import { motion } from 'framer-motion';

const PIE_COLORS = ['hsl(0,72%,51%)', 'hsl(32,95%,52%)', 'hsl(152,69%,53%)', 'hsl(200,80%,55%)', 'hsl(215,16%,52%)'];

const chartTooltipStyle = {
  backgroundColor: 'hsl(220 16% 8%)',
  borderColor: 'hsl(220 13% 18%)',
  borderRadius: 12,
  fontSize: 12,
  fontFamily: 'Inter',
  color: '#e2e8f0',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const DealerDashboard = () => {
  const { user } = useAuth();
  const { state } = useAppData();
  const navigate = useNavigate();

  const dealerId = user?.id ?? '';
  const myOrders = state.orders.filter(o => o.fromId === dealerId && o.fromType === 'Dealer');
  const myQuotes = state.quotes.filter(q => q.toId === dealerId);
  const myCustomers = state.customers.filter(c => c.assignedDealerId === dealerId);

  const openQuotes = myQuotes.filter(q => q.status === 'Sent' || q.status === 'Viewed');
  const acceptedQuotes = myQuotes.filter(q => q.status === 'Accepted');
  const pendingOrders = myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const deliveredOrders = myOrders.filter(o => o.status === 'Delivered');
  const totalRevenue = deliveredOrders.reduce((s, o) => s + o.totalPrice, 0);
  const stockCount = state.trailers.slice(0, 12).reduce((s, t) => s + t.inStock, 0);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth: Record<string, number> = {};
  myOrders.forEach(o => {
    const d = new Date(o.createdDate);
    const m = monthNames[d.getMonth()];
    revenueByMonth[m] = (revenueByMonth[m] || 0) + Math.round(o.totalPrice / 1000);
  });
  const revenueData = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => ({
    month: m,
    revenue: revenueByMonth[m] || 0,
  }));

  const orderStatusData = [
    { name: 'Submitted', value: myOrders.filter(o => o.status === 'Submitted').length },
    { name: 'Under Review', value: myOrders.filter(o => o.status === 'Under Review').length },
    { name: 'Approved', value: myOrders.filter(o => o.status === 'Approved').length },
    { name: 'In Production', value: myOrders.filter(o => o.status === 'In Production').length },
    { name: 'Delivered', value: myOrders.filter(o => o.status === 'Delivered').length },
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-steel">Dealer Portal</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Sales Pipeline</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/dealer/quotes')} className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 hover:shadow-[0_0_20px_hsl(0_72%_51%/0.3)]" style={{ background: 'linear-gradient(135deg, hsl(0 72% 51%), hsl(0 72% 41%))' }}>Manage Quotes</button>
            <button onClick={() => navigate('/dealer/orders')} className="px-4 py-2 rounded-lg text-xs font-semibold border border-white/[0.08] text-steel hover:text-foreground hover:border-primary/30 transition-all active:scale-95" style={{ background: 'hsl(220 16% 10%)' }}>View Orders</button>
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
            <MetricCard key="stock" title="My Stock" value={stockCount} icon={Boxes} href="/dealer/stock" />,
            <MetricCard key="quotes" title="Open Quotes" value={openQuotes.length} icon={MessageSquare} href="/dealer/quotes" />,
            <MetricCard key="orders" title="Pending Orders" value={pendingOrders.length} icon={ShoppingCart} href="/dealer/orders" />,
            <MetricCard key="rev" title="Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} />,
            <MetricCard key="cust" title="Customers" value={myCustomers.length} icon={Users} />,
            <MetricCard key="del" title="Delivered" value={deliveredOrders.length} icon={TrendingUp} trend={deliveredOrders.length > 0 ? `$${(totalRevenue / 1000).toFixed(0)}K` : undefined} />,
          ].map((card, i) => (
            <motion.div key={i} className="h-full" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
              {card}
            </motion.div>
          ))}
        </motion.div>

        {/* Accepted Quotes CTA */}
        {acceptedQuotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl p-4 flex items-center justify-between border border-emerald-500/20"
            style={{ background: 'linear-gradient(135deg, hsl(152 69% 53% / 0.06), hsl(152 69% 53% / 0.02))' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{acceptedQuotes.length} {acceptedQuotes.length === 1 ? 'quote has' : 'quotes have'} been accepted</p>
                <p className="text-xs text-steel">Convert to orders to start the production pipeline</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dealer/quotes')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, hsl(152 69% 53%), hsl(152 69% 43%))' }}
            >
              Convert Now <ArrowRight size={12} />
            </button>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(0 72% 51%), hsl(32 95% 52%), transparent)' }} />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel mb-4">Monthly Revenue ($K)</h3>
            {revenueData.every(d => d.revenue === 0) ? (
              <div className="flex items-center justify-center h-[220px]">
                <EmptyState icon={BarChart2} title="No Revenue Data" description="Revenue will appear as orders are delivered" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 14%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(215 16% 52%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(215 16% 52%)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: '#e2e8f0' }} cursor={{ fill: 'hsl(220 16% 12%)' }} />
                  <Bar dataKey="revenue" fill="hsl(0 72% 51%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(32 95% 52%), hsl(0 72% 51%), transparent)' }} />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel mb-4">Orders by Status</h3>
            {orderStatusData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px]">
                <EmptyState icon={ShoppingCart} title="No Orders Yet" description="Orders will appear as quotes are converted" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                    {orderStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(200 80% 55%), transparent)' }} />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">Pending Customer Quotes</h3>
              <button onClick={() => navigate('/dealer/quotes')} className="text-[10px] font-semibold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>
            <DataTable<Quote>
              columns={[
                { key: 'quoteNumber', label: 'Quote #', render: (q) => <span className="font-mono text-xs text-foreground">{q.quoteNumber}</span> },
                { key: 'customer', label: 'Customer', render: (q) => <span className="text-xs text-steel">{state.customers.find(c => c.id === q.fromId)?.name}</span> },
                { key: 'total', label: 'Value', render: (q) => <span className="font-mono text-xs text-foreground">${q.total.toLocaleString()}</span> },
                { key: 'status', label: 'Status', render: (q) => <StatusBadge status={q.status} /> },
              ]}
              data={myQuotes.filter(q => q.status !== 'Accepted' && q.status !== 'Rejected' && q.status !== 'Expired')}
              pageSize={5}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(0 72% 51%), hsl(32 95% 52%), transparent)' }} />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">My Orders to Behnke</h3>
              <button onClick={() => navigate('/dealer/orders')} className="text-[10px] font-semibold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>
            <DataTable<Order>
              columns={[
                { key: 'orderNumber', label: 'Order #', render: (o) => <span className="font-mono text-xs text-foreground">{o.orderNumber}</span> },
                { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs text-steel">{o.trailerName}</span> },
                { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
              ]}
              data={myOrders}
              pageSize={5}
            />
          </motion.div>
        </div>

        {/* Low stock banner */}
        {state.trailers.filter(t => t.inStock < 3).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl p-4 flex items-center justify-between border border-amber-500/20"
            style={{ background: 'linear-gradient(135deg, hsl(32 95% 52% / 0.06), hsl(32 95% 52% / 0.02))' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
                <Boxes size={14} className="text-amber-400" />
              </div>
              <span className="text-sm font-medium text-foreground">{state.trailers.filter(t => t.inStock < 3).length} trailers in your inventory are running low</span>
            </div>
            <button onClick={() => navigate('/dealer/stock')} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide">Reorder from Behnke</button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DealerDashboard;
