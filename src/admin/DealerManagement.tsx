import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAppData } from '@/context/AppDataContext';
import { Dealer } from '@/types';
import { Store, DollarSign, Clock, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const DealerManagement = () => {
  const navigate = useNavigate();
  const { state } = useAppData();
  const [view, setView] = useState<'table' | 'grid'>('table');

  const dealers = state.dealers;
  const active = dealers.filter(d => d.status === 'Active').length;
  const avgSales = active > 0
    ? Math.round(dealers.filter(d => d.status === 'Active').reduce((s, d) => s + d.totalSales, 0) / active)
    : 0;

  const perfData = dealers.filter(d => d.status === 'Active').map(d => ({
    name: d.name.split(' ')[0],
    sales: Math.round(d.totalSales / 1000),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Dealer Network</h1>
          <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-white/10 rounded-sm hover:bg-white/5 transition-all active:scale-95">
            {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
          </button>
        </div>

        {/* KPIs */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {[
            <MetricCard key="a" title="Active Dealers" value={active} icon={Store} />,
            <MetricCard key="t" title="Total Dealers" value={dealers.length} icon={Store} />,
            <MetricCard key="p" title="Pending" value={dealers.filter(d => d.status === 'Pending').length} icon={Clock} />,
            <MetricCard key="s" title="Avg Sales/Dealer" value={`$${(avgSales / 1000).toFixed(0)}K`} subtitle="Quarterly average" icon={DollarSign} />,
          ].map((card, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              {card}
            </motion.div>
          ))}
        </motion.div>

        {/* Performance Chart */}
        <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Dealer Sales Performance ($K)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'Inter', fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fontFamily: 'Inter', fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                formatter={(v: number) => `$${v}K`}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: 12, color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dealer Cards / Table — toggle between grid and table views */}
        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {dealers.map(d => {
              const dealerCustomers = state.customers.filter(c => c.assignedDealerId === d.id);
              const dealerOrders = state.orders.filter(o => o.fromId === d.id);
              return (
                <div
                  key={d.id}
                  onClick={() => navigate(`/admin/dealers/${d.id}`)}
                  className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{d.name}</h3>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{d.contactName} · {d.phone}</p>
                  <p className="text-xs text-muted-foreground mb-3">{d.city}, {d.state}</p>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                    <div className="text-center">
                      <span className="font-display font-bold text-sm block text-white">{d.inventoryCount}</span>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground">Stock</span>
                    </div>
                    <div className="text-center">
                      <span className="font-display font-bold text-sm block text-white">${(d.totalSales / 1000).toFixed(0)}K</span>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground">Sales</span>
                    </div>
                    <div className="text-center">
                      <span className="font-display font-bold text-sm block text-white">{dealerCustomers.length}</span>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground">Customers</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-display uppercase tracking-wide mr-1">View Details</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <DataTable<Dealer>
            columns={[
              { key: 'name', label: 'Dealer Name', sortable: true, render: (d) => <span className="font-display font-bold uppercase tracking-wide text-white">{d.name}</span> },
              { key: 'contactName', label: 'Contact', sortable: true },
              { key: 'city', label: 'Location', sortable: true, render: (d) => `${d.city}, ${d.state}` },
              { key: 'phone', label: 'Phone' },
              { key: 'status', label: 'Status', sortable: true, render: (d) => <StatusBadge status={d.status} /> },
              { key: 'inventoryCount', label: 'Stock', sortable: true },
              { key: 'totalSales', label: 'Sales', sortable: true, render: (d) => `$${(d.totalSales / 1000).toFixed(0)}K` },
            ]}
            data={dealers}
            onRowClick={(d) => navigate(`/admin/dealers/${d.id}`)}
            searchable
            searchPlaceholder="Search dealers..."
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DealerManagement;
