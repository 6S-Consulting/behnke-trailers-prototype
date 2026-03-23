import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { useAppData } from '@/context/AppDataContext';
import {
  BarChart3, Package, Store, Heart, Wrench, ClipboardList, Bell, Settings2,
  ShoppingCart, MessageSquare, Boxes, Home, Phone, LogOut, ChevronDown, Menu, X, Truck
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
        className="fixed top-3 left-3 z-50 lg:hidden p-2 bg-card rounded-md shadow-industrial"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static z-40 h-full flex flex-col bg-sidebar transition-all duration-200',
        sidebarOpen ? 'w-64' : 'w-0 lg:w-16 overflow-hidden'
      )}>
        <div className="p-5 pt-6">
          <h1 className="font-display text-xl font-bold tracking-tight">
            <span className="text-white">B-B </span>
            <span className="text-primary">TRAILERS</span>
          </h1>
          <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em] mt-0.5 opacity-60">
            {getBrandTitle(role)}
          </p>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 mt-2">
          {nav.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== '/admin' && item.path !== '/dealer' && item.path !== '/customer' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 text-sm',
                  active
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border-l-2 border-transparent'
                )}
              >
                <item.icon size={17} className={active ? 'text-primary' : ''} />
                <span className={cn('font-display uppercase tracking-wide', sidebarOpen ? '' : 'lg:hidden')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Link to={`/${role}/settings`} className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground text-sm rounded-sm hover:bg-white/5 transition-colors">
            <Settings2 size={17} />
            <span className={cn('font-display uppercase tracking-wide', sidebarOpen ? '' : 'lg:hidden')}>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 bg-card/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] pl-10 lg:pl-0">
            {location.pathname.split('/').filter(Boolean).map(seg => {
              const labels: Record<string, string> = {
                admin: 'Admin', dealer: 'Dealer', customer: 'Customer',
                inventory: 'Inventory', dealers: 'Dealers', health: 'Health',
                maintenance: 'Maintenance', orders: 'Orders', quotes: 'Quotes',
                stock: 'Stock', contact: 'Contact', notifications: 'Notifications',
                settings: 'Settings',
              };
              return labels[seg] ?? seg;
            }).join(' / ')}
          </div>
          <div className="flex items-center gap-3">
            {/* Role switcher */}
            <div className="relative">
              <button
                onClick={() => { setRoleDrop(!roleDrop); setNotifDrop(false); }}
                className="flex items-center gap-1.5 text-xs font-display uppercase tracking-wide px-2 py-1 rounded-sm hover:bg-muted"
              >
                {role} <ChevronDown size={12} />
              </button>
              {roleDrop && (
                <div className="absolute right-0 mt-1 bg-card border border-border rounded-md shadow-industrial-md py-1 z-50 w-40">
                  {(['admin', 'dealer', 'customer'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-xs font-display uppercase tracking-wide hover:bg-muted',
                        r === role && 'text-primary font-bold'
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
                className="relative p-1.5 hover:bg-muted rounded-sm"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
              {notifDrop && (
                <div className="absolute right-0 mt-1 bg-card border border-border rounded-md shadow-industrial-md py-1 z-50 w-80 max-h-80 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-border">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Notifications</span>
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
                        'w-full text-left px-3 py-2 border-b border-border last:border-0 transition-colors',
                        !n.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'
                      )}
                    >
                      <p className="text-xs font-medium">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t border-border">
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
            <button onClick={() => { logout(); navigate('/'); }} className="p-1.5 hover:bg-muted rounded-sm" aria-label="Logout">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="h-8 border-t border-white/5 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">
            © 2026 Behnke Enterprises, Inc. | Farley, IA | (563) 744-3246
          </span>
        </footer>
      </div>
    </div>
  );
};
