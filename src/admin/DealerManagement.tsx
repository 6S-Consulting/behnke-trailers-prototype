import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { dealers } from '@/data/dealers';
import { orders } from '@/data/orders';
import { customers } from '@/data/customers';
import { Dealer } from '@/types';
import { Store, Users, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DealerManagement = () => {
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [tab, setTab] = useState<'overview' | 'orders' | 'customers' | 'performance'>('overview');

  const active = dealers.filter(d => d.status === 'Active').length;
  const avgSales = Math.round(dealers.filter(d => d.status === 'Active').reduce((s, d) => s + d.totalSales, 0) / active);

  const dealerOrders = (dId: string) => orders.filter(o => o.fromId === dId || o.toId === dId);
  const dealerCustomers = (dId: string) => customers.filter(c => c.assignedDealerId === dId);

  const perfData = dealers.filter(d => d.status === 'Active').map(d => ({ name: d.name.split(' ')[0], sales: d.totalSales / 1000 }));

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Dealer Network</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard title="Active Dealers" value={active} icon={Store} />
          <MetricCard title="Total Dealers" value={dealers.length} icon={Store} />
          <MetricCard title="Pending" value={dealers.filter(d => d.status === 'Pending').length} icon={Clock} />
          <MetricCard title="Avg Sales/Dealer" value={`$${(avgSales / 1000).toFixed(0)}K`} icon={DollarSign} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {dealers.map(d => (
            <div key={d.id} onClick={() => { setSelectedDealer(d); setTab('overview'); }} className="bg-card rounded-lg shadow-industrial p-4 cursor-pointer hover:shadow-industrial-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display font-bold uppercase tracking-wide text-sm">{d.name}</h3>
                <StatusBadge status={d.status} />
              </div>
              <p className="text-xs text-muted-foreground">{d.contactName} • {d.phone}</p>
              <p className="text-xs text-muted-foreground">{d.city}, {d.state}</p>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                <div className="text-center">
                  <span className="font-display font-bold text-sm block">{d.inventoryCount}</span>
                  <span className="text-[9px] font-mono uppercase text-muted-foreground">Stock</span>
                </div>
                <div className="text-center">
                  <span className="font-display font-bold text-sm block">${(d.totalSales / 1000).toFixed(0)}K</span>
                  <span className="text-[9px] font-mono uppercase text-muted-foreground">Sales</span>
                </div>
                <div className="text-center">
                  <span className="font-display font-bold text-sm block">{d.customersServed.length}</span>
                  <span className="text-[9px] font-mono uppercase text-muted-foreground">Customers</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dealer Detail Modal */}
        <Modal isOpen={!!selectedDealer} onClose={() => setSelectedDealer(null)} title={selectedDealer?.name || ''} wide>
          {selectedDealer && (
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-border pb-2">
                {(['overview', 'orders', 'customers', 'performance'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1 text-xs font-display uppercase tracking-wide rounded-sm', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
                    {t}
                  </button>
                ))}
              </div>

              {tab === 'overview' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Contact</span>{selectedDealer.contactName}</div>
                    <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Email</span>{selectedDealer.email}</div>
                    <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Phone</span>{selectedDealer.phone}</div>
                    <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Address</span>{selectedDealer.address}, {selectedDealer.city}, {selectedDealer.state} {selectedDealer.zip}</div>
                    <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Territory</span>{selectedDealer.territory.join(', ')}</div>
                    <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Joined</span>{selectedDealer.joinDate}</div>
                  </div>
                </div>
              )}

              {tab === 'orders' && (
                <div className="space-y-2">
                  {dealerOrders(selectedDealer.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No orders found</p>
                  ) : dealerOrders(selectedDealer.id).map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <span className="font-mono text-xs">{o.orderNumber}</span>
                        <span className="text-xs text-muted-foreground ml-2">{o.trailerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">${o.totalPrice.toLocaleString()}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'customers' && (
                <div className="space-y-2">
                  {dealerCustomers(selectedDealer.id).map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <span className="text-sm font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{c.company}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{c.ownedTrailers.length} trailers</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'performance' && (
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={perfData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,5%,84%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                      <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                      <Tooltip formatter={(v: number) => `$${v}K`} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="sales" fill="hsl(0,66%,45%)" radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default DealerManagement;
