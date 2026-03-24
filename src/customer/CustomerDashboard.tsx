import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Truck, ClipboardList, MessageSquare, Bell, Wrench, Heart, ArrowRight, Package, Activity, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ORDER_STAGES = ['Submitted', 'Under Review', 'Approved', 'In Production', 'Quality Check', 'Delivered'] as const;

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useAppData();

  const customerId = user?.id ?? '';
  const customer = state.customers.find(c => c.id === customerId);
  const myTrailers = state.soldTrailers.filter(t => t.customerId === customerId);
  const myQuotes = state.quotes.filter(q => q.fromId === customerId);
  const myOrders = state.orders.filter(o => (o.toId === customerId || o.fromId === customerId));
  const dealer = customer ? state.dealers.find(d => d.id === customer.assignedDealerId) : undefined;

  const activeOrders = myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const pendingQuotes = myQuotes.filter(q => q.status === 'Sent' || q.status === 'Viewed');
  const upcomingMaintenance = state.maintenanceSlots.filter(s => s.customerId === customerId && s.status !== 'Completed' && s.status !== 'Cancelled');
  const unreadNotifications = state.notifications.filter(n => n.recipientId === customerId && !n.read);
  const criticalTrailers = myTrailers.filter(t => t.sensorData.overallHealth === 'Critical');

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-sm text-steel">Customer profile not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl p-6 border border-white/[0.06]"
          style={{ background: 'linear-gradient(135deg, hsl(220 16% 9%), hsl(220 16% 6%))' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(0 72% 51%), hsl(32 95% 52%), hsl(152 69% 53%), transparent)' }} />
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(0 72% 51% / 0.06), transparent 70%)' }} />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-primary" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-steel">Customer Portal</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Welcome back, {customer.name}</h1>
              <p className="text-xs text-steel mt-1">{customer.company} — {customer.address}</p>
            </div>
            <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: 'hsl(220 16% 7%)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Phone size={12} className="text-steel" />
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">Your Dealer</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{dealer?.name ?? '—'}</p>
              <p className="text-xs text-steel mt-0.5">
                {dealer?.phone ?? ''}
                {dealer?.email ? ` · ${dealer.email}` : ''}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Status Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {[
            { icon: Heart, value: myTrailers.length, label: 'My Trailers', nav: '/customer/health', color: 'hsl(0 72% 51%)' },
            { icon: Truck, value: activeOrders.length, label: 'Active Orders', nav: '/customer/orders', color: 'hsl(200 80% 55%)' },
            { icon: ClipboardList, value: pendingQuotes.length, label: 'Pending Quotes', nav: '/customer/quotes', color: 'hsl(32 95% 52%)' },
            { icon: MessageSquare, value: myQuotes.length, label: 'Total Quotes', nav: '/customer/contact', color: 'hsl(152 69% 53%)' },
            { icon: Wrench, value: upcomingMaintenance.length, label: 'Maintenance', nav: '/customer/health', color: 'hsl(280 65% 55%)' },
            { icon: Bell, value: unreadNotifications.length, label: 'Notifications', nav: '/notifications', color: 'hsl(38 92% 50%)' },
          ].map((item, i) => (
            <motion.div key={i} className="h-full" variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
              <button
                onClick={() => navigate(item.nav)}
                className="w-full h-full relative overflow-hidden rounded-xl p-4 text-left border border-white/[0.06] transition-all duration-300 group hover:-translate-y-1 hover:border-primary/20"
                style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
              >
                <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle, ${item.color.replace(')', ' / 0.15)')}, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 border border-white/[0.06] group-hover:border-primary/20 transition-colors" style={{ background: 'hsl(220 14% 12%)' }}>
                    <item.icon size={14} className="text-steel group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <p className="font-mono text-xl font-bold text-foreground">{item.value}</p>
                  <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-steel mt-0.5">{item.label}</p>
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Critical Health Alert */}
        {criticalTrailers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl p-4 flex items-center justify-between border border-red-500/20"
            style={{ background: 'linear-gradient(135deg, hsl(0 72% 51% / 0.06), hsl(0 72% 51% / 0.02))' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <Heart size={14} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{criticalTrailers.length} trailer{criticalTrailers.length > 1 ? 's need' : ' needs'} immediate attention</p>
                <p className="text-xs text-steel">{criticalTrailers.map(t => t.name).join(', ')}</p>
              </div>
            </div>
            <button onClick={() => navigate('/customer/health')} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-95" style={{ background: 'linear-gradient(135deg, hsl(0 72% 51%), hsl(0 72% 41%))' }}>
              View Health <ArrowRight size={12} />
            </button>
          </motion.div>
        )}

        {/* Active Order Tracking */}
        {activeOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(200 80% 55%), hsl(0 72% 51%), transparent)' }} />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">Active Order Tracking</h2>
              <button onClick={() => navigate('/customer/orders')} className="text-[10px] font-semibold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors">View All Orders</button>
            </div>
            {activeOrders.slice(0, 2).map(order => {
              const currentIdx = ORDER_STAGES.indexOf(order.status as typeof ORDER_STAGES[number]);
              return (
                <div key={order.id} className="mb-4 last:mb-0 rounded-xl p-4 border border-white/[0.04]" style={{ background: 'hsl(220 16% 6%)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="font-mono text-xs text-foreground">{order.orderNumber}</span>
                      <span className="text-xs text-steel ml-2">— {order.trailerName}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-1">
                    {ORDER_STAGES.map((stage, i) => (
                      <div key={stage} className="flex items-center flex-1">
                        <div className={cn(
                          'h-2 flex-1 rounded-full transition-all duration-500',
                          i <= currentIdx ? 'shadow-[0_0_8px_hsl(0_72%_51%/0.3)]' : ''
                        )}
                          style={{ background: i <= currentIdx ? 'linear-gradient(90deg, hsl(0 72% 51%), hsl(32 95% 52%))' : 'hsl(220 14% 14%)' }}
                        />
                        {i < ORDER_STAGES.length - 1 && <div className="w-0.5" />}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-steel/50">Submitted</span>
                    <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-steel/50">Delivered</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* My Trailers */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">My Trailers</span>
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
          </div>
          {myTrailers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-xl p-10 text-center border border-white/[0.06]"
              style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/[0.06]" style={{ background: 'hsl(220 14% 12%)' }}>
                <Package size={24} className="text-steel" />
              </div>
              <p className="text-sm text-steel mb-4">No trailers yet. Place an order to get started!</p>
              <button onClick={() => navigate('/customer/contact')} className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 hover:shadow-[0_0_20px_hsl(0_72%_51%/0.3)]" style={{ background: 'linear-gradient(135deg, hsl(0 72% 51%), hsl(0 72% 41%))' }}>
                Browse Trailers
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {myTrailers.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06] transition-all duration-300 group hover:-translate-y-1 hover:border-primary/20"
                  style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                    background: t.sensorData.overallHealth === 'Critical'
                      ? 'linear-gradient(90deg, hsl(0 72% 51%), hsl(0 60% 40%), transparent)'
                      : t.sensorData.overallHealth === 'Warning'
                        ? 'linear-gradient(90deg, hsl(32 95% 52%), hsl(38 80% 40%), transparent)'
                        : 'linear-gradient(90deg, hsl(152 69% 53%), hsl(152 50% 40%), transparent)'
                  }} />
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-display font-bold tracking-tight text-sm text-foreground group-hover:text-primary transition-colors">{t.name}</h3>
                      <span className="font-mono text-[10px] text-steel uppercase tracking-[0.1em]">VIN: {t.vin}</span>
                    </div>
                    <StatusBadge status={t.sensorData.overallHealth} breathing={t.sensorData.overallHealth === 'Critical'} />
                  </div>
                  <StatusBadge status={t.category} className="mb-3" />
                  <p className="text-[11px] text-steel">Purchased: {t.soldDate}</p>
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.04]">
                    {[
                      { val: `${t.sensorData.brakePadWear}%`, label: 'Brakes' },
                      { val: `${t.sensorData.axleTemp}°F`, label: 'Axle' },
                      { val: t.sensorData.mileage.toLocaleString(), label: 'Miles' },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <span className="font-mono text-xs font-bold block text-foreground">{m.val}</span>
                        <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-steel">{m.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => navigate('/customer/health')} className="flex-1 px-2 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide text-steel hover:text-foreground border border-white/[0.06] hover:border-primary/30 transition-all text-center" style={{ background: 'hsl(220 16% 10%)' }}>Health Details</button>
                    <button onClick={() => navigate('/customer/contact')} className="flex-1 px-2 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide text-white transition-all active:scale-95 text-center" style={{ background: 'linear-gradient(135deg, hsl(0 72% 51%), hsl(0 72% 41%))' }}>Schedule</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Grid: Quick Actions + Quotes + Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(0 72% 51%), hsl(32 95% 52%), transparent)' }} />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/customer/contact')} className="w-full px-4 py-3 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 hover:shadow-[0_0_20px_hsl(0_72%_51%/0.3)]" style={{ background: 'linear-gradient(135deg, hsl(0 72% 51%), hsl(0 72% 41%))' }}>
                Request a Quote
              </button>
              {[
                { label: 'Track My Orders', nav: '/customer/orders' },
                { label: 'Fleet Health', nav: '/customer/health' },
                { label: `Notifications${unreadNotifications.length > 0 ? ` (${unreadNotifications.length})` : ''}`, nav: '/notifications' },
              ].map(a => (
                <button key={a.nav} onClick={() => navigate(a.nav)} className="w-full px-4 py-3 rounded-lg text-xs font-semibold border border-white/[0.06] text-steel hover:text-foreground hover:border-primary/30 transition-all active:scale-95" style={{ background: 'hsl(220 16% 10%)' }}>
                  {a.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(32 95% 52%), transparent)' }} />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">Active Quotes</h3>
              <button onClick={() => navigate('/customer/quotes')} className="text-[10px] font-semibold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors">View All</button>
            </div>
            {myQuotes.length === 0 ? (
              <p className="text-xs text-steel py-6 text-center">No quotes yet</p>
            ) : (
              myQuotes.slice(0, 4).map(q => (
                <div key={q.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                  <div>
                    <span className="font-mono text-xs text-foreground">{q.quoteNumber}</span>
                    <span className="text-xs text-steel ml-2">{q.items[0]?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-foreground">${q.total.toLocaleString()}</span>
                    <StatusBadge status={q.status} />
                  </div>
                </div>
              ))
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-xl p-5 border border-white/[0.06]"
            style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(280 65% 55%), transparent)' }} />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">Upcoming Maintenance</h3>
              <button onClick={() => navigate('/customer/health')} className="text-[10px] font-semibold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors">Manage</button>
            </div>
            {upcomingMaintenance.length === 0 ? (
              <p className="text-xs text-steel py-6 text-center">No upcoming slots</p>
            ) : (
              upcomingMaintenance.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                  <div>
                    <span className="text-xs text-foreground">{s.confirmedDate || s.requestedDate}</span>
                    <span className="text-xs text-steel ml-2">{s.type}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
