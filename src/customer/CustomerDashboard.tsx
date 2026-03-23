import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Truck, ClipboardList, MessageSquare, Bell, Wrench, Heart, ArrowRight, Package } from 'lucide-react';

const ORDER_STAGES = ['Submitted', 'Under Review', 'Approved', 'In Production', 'Quality Check', 'Delivered'] as const;

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useAppData();

  const customerId = user?.id ?? '';
  const customer = state.customers.find(c => c.id === customerId);
  const myTrailers = state.soldTrailers.filter(t => t.customerId === customerId);
  const myQuotes = state.quotes.filter(q => q.toId === customerId);
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
        <div className="text-sm text-muted-foreground">Customer profile not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">Welcome back, {customer.name}</h1>
            <p className="text-xs text-muted-foreground mt-1">{customer.company} — {customer.address}</p>
          </div>
          <div className="bg-white/5 rounded-md p-3 border border-white/5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Your Dealer</p>
            <p className="text-sm font-medium text-white">{dealer?.name ?? '—'}</p>
            <p className="text-xs text-muted-foreground">
              {dealer?.phone ?? ''}
              {dealer?.email ? ` • ${dealer.email}` : ''}
            </p>
          </div>
        </div>

        {/* Status Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button onClick={() => navigate('/customer/health')} className="bg-card border border-white/5 rounded-lg p-3 text-left hover:border-primary/30 transition-all group">
            <Heart size={14} className="text-muted-foreground group-hover:text-primary mb-1" />
            <p className="font-mono text-lg font-bold text-white">{myTrailers.length}</p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">My Trailers</p>
          </button>
          <button onClick={() => navigate('/customer/orders')} className="bg-card border border-white/5 rounded-lg p-3 text-left hover:border-primary/30 transition-all group">
            <Truck size={14} className="text-muted-foreground group-hover:text-primary mb-1" />
            <p className="font-mono text-lg font-bold text-white">{activeOrders.length}</p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Active Orders</p>
          </button>
          <button onClick={() => navigate('/customer/quotes')} className="bg-card border border-white/5 rounded-lg p-3 text-left hover:border-primary/30 transition-all group">
            <ClipboardList size={14} className="text-muted-foreground group-hover:text-primary mb-1" />
            <p className="font-mono text-lg font-bold text-white">{pendingQuotes.length}</p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Pending Quotes</p>
          </button>
          <button onClick={() => navigate('/customer/contact')} className="bg-card border border-white/5 rounded-lg p-3 text-left hover:border-primary/30 transition-all group">
            <MessageSquare size={14} className="text-muted-foreground group-hover:text-primary mb-1" />
            <p className="font-mono text-lg font-bold text-white">{myQuotes.length}</p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Total Quotes</p>
          </button>
          <button onClick={() => navigate('/customer/health')} className="bg-card border border-white/5 rounded-lg p-3 text-left hover:border-primary/30 transition-all group">
            <Wrench size={14} className="text-muted-foreground group-hover:text-primary mb-1" />
            <p className="font-mono text-lg font-bold text-white">{upcomingMaintenance.length}</p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Maintenance</p>
          </button>
          <button onClick={() => navigate('/notifications')} className="bg-card border border-white/5 rounded-lg p-3 text-left hover:border-primary/30 transition-all group">
            <Bell size={14} className="text-muted-foreground group-hover:text-primary mb-1" />
            <p className="font-mono text-lg font-bold text-white">{unreadNotifications.length}</p>
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Notifications</p>
          </button>
        </div>

        {/* Critical Health Alert */}
        {criticalTrailers.length > 0 && (
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-danger">{criticalTrailers.length} trailer{criticalTrailers.length > 1 ? 's need' : ' needs'} immediate attention</p>
              <p className="text-xs text-muted-foreground">{criticalTrailers.map(t => t.name).join(', ')}</p>
            </div>
            <button onClick={() => navigate('/customer/health')} className="flex items-center gap-1 px-3 py-1.5 bg-danger text-white rounded-sm text-xs font-display uppercase tracking-wide hover:brightness-110 transition-all">
              View Health <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Active Orders Pipeline */}
        {activeOrders.length > 0 && (
          <div className="bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Active Order Tracking</h2>
              <button onClick={() => navigate('/customer/orders')} className="text-[10px] font-display uppercase tracking-wide text-primary hover:underline">View All Orders</button>
            </div>
            {activeOrders.slice(0, 2).map(order => {
              const currentIdx = ORDER_STAGES.indexOf(order.status as typeof ORDER_STAGES[number]);
              return (
                <div key={order.id} className="mb-4 last:mb-0 bg-background/40 rounded-md p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-mono text-xs text-white">{order.orderNumber}</span>
                      <span className="text-xs text-muted-foreground ml-2">— {order.trailerName}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-1">
                    {ORDER_STAGES.map((stage, i) => (
                      <div key={stage} className="flex items-center flex-1">
                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentIdx ? 'bg-primary' : 'bg-white/10'
                          }`} />
                        {i < ORDER_STAGES.length - 1 && <div className="w-0.5" />}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] font-mono uppercase text-muted-foreground">Submitted</span>
                    <span className="text-[8px] font-mono uppercase text-muted-foreground">Delivered</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* My Trailers */}
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-3">My Trailers</h2>
          {myTrailers.length === 0 ? (
            <div className="bg-card border border-white/5 rounded-lg p-8 text-center">
              <Package size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No trailers yet. Place an order to get started!</p>
              <button onClick={() => navigate('/customer/contact')} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:brightness-110 transition-all">
                Browse Trailers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {myTrailers.map(t => (
                <div key={t.id} className="bg-card border border-white/5 rounded-lg shadow-industrial p-4 border-t-primary transition-all duration-300 hover:border-primary/30 group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{t.name}</h3>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">VIN: {t.vin}</span>
                    </div>
                    <StatusBadge status={t.sensorData.overallHealth} breathing={t.sensorData.overallHealth === 'Critical'} />
                  </div>
                  <StatusBadge status={t.category} className="mb-2" />
                  <p className="text-[11px] text-muted-foreground italic">Purchased: {t.soldDate}</p>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                    <div className="text-center">
                      <span className="font-mono text-xs font-bold block text-white">{t.sensorData.brakePadWear}%</span>
                      <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground">Brakes</span>
                    </div>
                    <div className="text-center">
                      <span className="font-mono text-xs font-bold block text-white">{t.sensorData.axleTemp}°F</span>
                      <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground">Axle</span>
                    </div>
                    <div className="text-center">
                      <span className="font-mono text-xs font-bold block text-white">{t.sensorData.mileage.toLocaleString()}</span>
                      <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground">Miles</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => navigate('/customer/health')} className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all rounded-sm text-[10px] font-display uppercase tracking-widest text-center">Health Details</button>
                    <button onClick={() => navigate('/customer/contact')} className="flex-1 px-2 py-1.5 bg-primary text-white hover:brightness-110 transition-all rounded-sm text-[10px] font-display uppercase tracking-widest text-center">Schedule</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Quotes + Upcoming Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/customer/contact')} className="w-full px-3 py-3 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:brightness-110 transition-all">
                Request a Quote
              </button>
              <button onClick={() => navigate('/customer/orders')} className="w-full px-3 py-3 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted transition-colors">
                Track My Orders
              </button>
              <button onClick={() => navigate('/customer/health')} className="w-full px-3 py-3 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted transition-colors">
                Fleet Health
              </button>
              <button onClick={() => navigate('/notifications')} className="w-full px-3 py-3 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted transition-colors">
                Notifications {unreadNotifications.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary rounded-full text-[10px]">{unreadNotifications.length}</span>}
              </button>
            </div>
          </div>

          <div className="bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Active Quotes</h3>
              <button onClick={() => navigate('/customer/quotes')} className="text-[10px] font-display uppercase tracking-wide text-primary hover:underline">View All</button>
            </div>
            {myQuotes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No quotes yet</p>
            ) : (
              myQuotes.slice(0, 4).map(q => (
                <div key={q.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <span className="font-mono text-xs text-white">{q.quoteNumber}</span>
                    <span className="text-xs text-muted-foreground ml-2">{q.items[0]?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-white">${q.total.toLocaleString()}</span>
                    <StatusBadge status={q.status} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Upcoming Maintenance</h3>
              <button onClick={() => navigate('/customer/health')} className="text-[10px] font-display uppercase tracking-wide text-primary hover:underline">Manage</button>
            </div>
            {upcomingMaintenance.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No upcoming slots</p>
            ) : (
              upcomingMaintenance.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-xs text-white">{s.confirmedDate || s.requestedDate}</span>
                    <span className="text-xs text-muted-foreground ml-2">{s.type}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
