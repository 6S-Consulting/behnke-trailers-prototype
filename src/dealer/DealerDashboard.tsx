import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { orders } from '@/data/orders';
import { quotes } from '@/data/quotes';
import { trailers } from '@/data/trailers';
import { customers } from '@/data/customers';
import { Boxes, ShoppingCart, MessageSquare, DollarSign, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const dealerId = 'd1';
const myOrders = orders.filter(o => o.fromId === dealerId && o.fromType === 'Dealer');
const custOrders = orders.filter(o => o.toId === dealerId && o.toType === 'Dealer');
const myQuotes = quotes.filter(q => q.fromId === dealerId);

const revenueData = [
  { month: 'Oct', revenue: 280 }, { month: 'Nov', revenue: 320 }, { month: 'Dec', revenue: 190 },
  { month: 'Jan', revenue: 410 }, { month: 'Feb', revenue: 360 }, { month: 'Mar', revenue: 342 },
];

const orderStatusData = [
  { name: 'Submitted', value: myOrders.filter(o => o.status === 'Submitted').length || 1 },
  { name: 'Under Review', value: myOrders.filter(o => o.status === 'Under Review').length || 1 },
  { name: 'Approved', value: myOrders.filter(o => o.status === 'Approved').length || 1 },
  { name: 'In Production', value: 1 },
  { name: 'Delivered', value: myOrders.filter(o => o.status === 'Delivered').length || 1 },
];
const PIE_COLORS = ['hsl(0,66%,45%)', 'hsl(38,92%,50%)', 'hsl(160,84%,39%)', 'hsl(220,60%,50%)', 'hsl(240,6%,20%)'];

const DealerDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Inventory & Sales Pipeline</h1>
          <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:brightness-110 transition-all">Contact Behnke</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard title="My Stock" value={18} icon={Boxes} />
          <MetricCard title="Open Quotes" value={myQuotes.filter(q => q.status === 'Sent' || q.status === 'Viewed').length} icon={MessageSquare} />
          <MetricCard title="Pending Orders" value={myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length} icon={ShoppingCart} />
          <MetricCard title="Sales This Month" value="$342K" icon={DollarSign} />
          <MetricCard title="Customers" value={23} icon={Users} />
          <MetricCard title="Revenue YTD" value="$1.84M" icon={TrendingUp} trend="↑15%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Monthly Revenue ($K)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Inter', fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[2,2,0,0]} />
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
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Pending Customer Quotes</h3>
            <DataTable
              columns={[
                { key: 'quoteNumber', label: 'Quote #', render: (q: any) => <span className="font-mono text-xs text-white">{q.quoteNumber}</span> },
                { key: 'customer', label: 'Customer', render: (q: any) => <span className="text-xs text-muted-foreground">{customers.find(c => c.id === q.toId)?.name}</span> },
                { key: 'total', label: 'Value', render: (q: any) => <span className="font-mono text-xs text-white">${q.total.toLocaleString()}</span> },
                { key: 'status', label: 'Status', render: (q: any) => <StatusBadge status={q.status} /> },
              ]}
              data={myQuotes.filter(q => q.status !== 'Accepted' && q.status !== 'Rejected' && q.status !== 'Expired')}
              pageSize={5}
            />
          </div>
          <div className="bg-card border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">My Orders to Behnke</h3>
            <DataTable
              columns={[
                { key: 'orderNumber', label: 'Order #', render: (o: any) => <span className="font-mono text-xs text-white">{o.orderNumber}</span> },
                { key: 'trailerName', label: 'Trailer', render: (o: any) => <span className="text-xs text-muted-foreground">{o.trailerName}</span> },
                { key: 'status', label: 'Status', render: (o: any) => <StatusBadge status={o.status} /> },
              ]}
              data={myOrders}
              pageSize={5}
            />
          </div>
        </div>

        {/* Low stock banner */}
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs font-medium">⚠️ 3 trailers in your inventory are running low</span>
          <button className="text-xs text-primary font-display uppercase tracking-wide hover:underline">Reorder from Behnke</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DealerDashboard;
