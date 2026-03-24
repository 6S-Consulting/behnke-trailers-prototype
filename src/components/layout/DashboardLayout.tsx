import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { useAppData } from '@/context/AppDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Package, Store, Heart, Wrench, ClipboardList, Bell, Settings2,
  ShoppingCart, MessageSquare, Boxes, Home, Phone, LogOut, ChevronDown, Menu, X, Truck, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: 'Overview', path: '/admin', icon: BarChart3 },
  { label: 'Trailer Inventory', path: '/admin/inventory', icon: Package },
  { label: 'Dealer Management', path: '/admin/dealers', icon: Store },
  { label: 'Customer Management', path: '/admin/customers', icon: Users },
  { label: 'Trailer Health', path: '/admin/health', icon: Heart },
  { label: 'Maintenance Slots', path: '/admin/maintenance', icon: Wrench },
  { label: 'Orders (All)', path: '/admin/orders', icon: ClipboardList },
];

const dealerNav: NavItem[] = [
  { label: 'Overview', path: '/dealer', icon: BarChart3 },
  { label: 'Order Management', path: '/dealer/orders', icon: ShoppingCart },
  { label: 'Quote Management', path: '/dealer/quotes', icon: MessageSquare },
  { label: 'My Inventory', path: '/dealer/stock', icon: Boxes },
];

const customerNav: NavItem[] = [
  { label: 'My Dashboard', path: '/customer', icon: Home },
  { label: 'My Orders', path: '/customer/orders', icon: Truck },
  { label: 'Trailer Health', path: '/customer/health', icon: Heart },
  { label: 'My Quotes', path: '/customer/quotes', icon: MessageSquare },
  { label: 'Contact Dealer', path: '/customer/contact', icon: Phone },
];

const getNav = (role: UserRole) => {
  switch (role) {
    case 'admin': return adminNav;
    case 'dealer': return dealerNav;
    case 'customer': return customerNav;
  }
};

const getBrandTitle = (role: UserRole) => {
  switch (role) {
    case 'admin': return 'BEHNKE ENTERPRISES';
    case 'dealer': return 'MIDWEST TRAILER SALES';
    case 'customer': return 'MY B-B TRAILERS';
  }
};

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { state, actions } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [roleDrop, setRoleDrop] = useState(false);
  const [notifDrop, setNotifDrop] = useState(false);

  if (!user || !role) return null;

  const nav = getNav(role);
  const userNotifs = state.notifications.filter(n =>
    (n.recipientId === user.id) || (role === 'admin' && n.recipientType === 'Admin')
  );
  const unread = userNotifs.filter(n => !n.read).length;

  const handleRoleSwitch = (r: UserRole) => {
    switchRole(r);
    setRoleDrop(false);
    if (r === 'admin') navigate('/admin');
    else if (r === 'dealer') navigate('/dealer');
    else navigate('/customer');
  };

  return (
    <div className="flex h-screen bg-background font-body antialiased text-foreground">
      {/* Mobile toggle */}
      <button
        className="fixed top-3 left-3 z-50 lg:hidden p-2 bg-card rounded-lg border border-border"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static z-40 h-full flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-0 lg:w-16 overflow-hidden'
      )} style={{ background: 'linear-gradient(180deg, hsl(220 20% 5%) 0%, hsl(220 20% 3%) 100%)' }}>
        {/* Brand */}
        <div className="p-5 pt-6 border-b border-white/[0.06]">
          <h1 className="font-display text-xl font-bold tracking-tight">
            <span className="text-white">B-B </span>
            <span className="text-gradient">TRAILERS</span>
          </h1>
          <p className="text-[9px] text-steel font-mono uppercase tracking-[0.2em] mt-1 opacity-60">
            {getBrandTitle(role)}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto scrollbar-hide">
          {nav.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== '/admin' && item.path !== '/dealer' && item.path !== '/customer' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group relative',
                  active
                    ? 'text-white'
                    : 'text-steel hover:text-foreground hover:bg-white/[0.04]'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, hsl(0 72% 51% / 0.15), hsl(0 72% 51% / 0.05))' }}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}
                <item.icon size={17} className={cn('relative z-10', active ? 'text-primary' : 'group-hover:text-primary/60')} />
                <span className={cn('font-display uppercase tracking-wide relative z-10', sidebarOpen ? '' : 'lg:hidden')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/[0.06]">
          <Link to={`/${role}/settings`} className="flex items-center gap-3 px-3 py-2.5 text-steel hover:text-foreground text-sm rounded-lg hover:bg-white/[0.04] transition-all group">
            <Settings2 size={17} className="group-hover:text-primary/60" />
            <span className={cn('font-display uppercase tracking-wide', sidebarOpen ? '' : 'lg:hidden')}>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-50" style={{ background: 'linear-gradient(90deg, hsl(220 16% 8% / 0.8), hsl(220 16% 8% / 0.6))', backdropFilter: 'blur(16px)' }}>
          <div className="text-[10px] font-mono text-steel uppercase tracking-[0.2em] pl-10 lg:pl-0">
            {location.pathname.split('/').filter(Boolean).map(seg => {
              const labels: Record<string, string> = {
                admin: 'Admin', dealer: 'Dealer', customer: 'Customer',
                inventory: 'Inventory', dealers: 'Dealers', health: 'Health',
                maintenance: 'Maintenance', orders: 'Orders', quotes: 'Quotes',
                customers: 'Customers', stock: 'Stock', contact: 'Contact',
                notifications: 'Notifications', settings: 'Settings',
              };
              return labels[seg] ?? seg;
            }).join(' / ')}
          </div>
          <div className="flex items-center gap-2">
            {/* Role switcher */}
            <div className="relative">
              <button
                onClick={() => { setRoleDrop(!roleDrop); setNotifDrop(false); }}
                className="flex items-center gap-1.5 text-xs font-display uppercase tracking-wide px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-primary/20 hover:bg-primary/[0.03] transition-all"
              >
                {role} <ChevronDown size={12} />
              </button>
              {roleDrop && (
                <div className="absolute right-0 mt-2 bg-card border border-white/10 rounded-xl shadow-2xl py-1 z-[100] w-44 overflow-hidden">
                  {(['admin', 'dealer', 'customer'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-xs font-display uppercase tracking-wide hover:bg-white/[0.04] transition-colors',
                        r === role && 'text-primary bg-primary/[0.06]'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifDrop(!notifDrop); setRoleDrop(false); }}
                className="relative p-2 hover:bg-white/[0.04] rounded-lg transition-all"
                aria-label="Notifications"
              >
                <Bell size={17} className="text-steel" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-background">
                    {unread}
                  </span>
                )}
              </button>
              {notifDrop && (
                <div className="absolute right-0 mt-2 bg-card border border-white/10 rounded-xl shadow-2xl py-1 z-[100] w-80 max-h-80 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-steel">Notifications</span>
                  </div>
                  {userNotifs.slice(0, 8).map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        actions.markNotificationRead(n.id);
                        if (n.actionUrl) navigate(n.actionUrl);
                        setNotifDrop(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 border-b border-white/[0.04] last:border-0 transition-colors',
                        !n.read ? 'bg-primary/[0.04] hover:bg-primary/[0.08]' : 'hover:bg-white/[0.03]'
                      )}
                    >
                      <p className="text-xs font-medium">{n.title}</p>
                      <p className="text-[11px] text-steel mt-0.5 line-clamp-2">{n.message}</p>
                    </button>
                  ))}
                  <div className="px-4 py-3 border-t border-white/[0.06]">
                    <button
                      onClick={() => {
                        setNotifDrop(false);
                        navigate(`/${role}/notifications`);
                      }}
                      className="w-full text-xs font-display uppercase tracking-wide text-primary hover:underline"
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <button onClick={() => { logout(); navigate('/'); }} className="p-2 hover:bg-white/[0.04] rounded-lg transition-all" aria-label="Logout">
              <LogOut size={17} className="text-steel" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="h-8 border-t border-white/[0.04] flex items-center justify-center shrink-0">
          <span className="text-[9px] font-mono text-steel/40 uppercase tracking-widest">
            © 2026 Behnke Enterprises, Inc. | Farley, IA
          </span>
        </footer>
      </div>
    </div>
  );
};
