import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bell, Filter, Check, ArrowRight } from 'lucide-react';

const typeOptions = ['MaintenanceAlert', 'OrderUpdate', 'QuoteReceived', 'HealthWarning', 'StockAlert'] as const;
type NotificationType = (typeof typeOptions)[number];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { state, actions } = useAppData();

  const [typeFilter, setTypeFilter] = useState<NotificationType | 'All'>('All');
  const [readFilter, setReadFilter] = useState<'All' | 'Unread' | 'Read'>('All');

  const myNotifs = useMemo(() => {
    if (!user || !role) return [];
    return state.notifications.filter(n =>
      (n.recipientId === user.id) || (role === 'admin' && n.recipientType === 'Admin')
    );
  }, [state.notifications, user, role]);

  const filtered = myNotifs.filter(n => {
    const typeOk = typeFilter === 'All' ? true : n.type === typeFilter;
    const readOk =
      readFilter === 'All' ? true : readFilter === 'Unread' ? !n.read : n.read;
    return typeOk && readOk;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Notifications</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="text-xs font-display uppercase tracking-wide"
              onClick={() => {
                actions.markAllNotificationsRead();
                toast.success('All notifications marked as read');
              }}
            >
              Mark all as read
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-industrial p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-muted-foreground">
            <Filter size={14} />
            Filter
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">Type</label>
            <select
              className="border border-border rounded-md p-2 text-sm bg-card"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as Notification['type'] | 'All')}
            >
              <option value="All">All</option>
              {typeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">Status</label>
            <select
              className="border border-border rounded-md p-2 text-sm bg-card"
              value={readFilter}
              onChange={e => setReadFilter(e.target.value as 'All' | 'Read' | 'Unread')}
            >
              <option value="All">All</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-muted-foreground font-mono">
            {filtered.length} results
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card rounded-lg shadow-industrial p-8 text-center text-muted-foreground">
            <p className="font-display uppercase tracking-wide text-xs">No notifications found</p>
            <p className="text-sm mt-2">Try changing filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => (
              <div key={n.id} className="bg-card rounded-lg shadow-industrial p-4 border border-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={n.type === 'HealthWarning' ? 'Warning' : n.type === 'MaintenanceAlert' ? 'Requested' : 'Approved'} />
                      <p className="font-display uppercase tracking-wide text-sm">{n.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{n.message}</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">
                      {new Date(n.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!n.read && (
                      <Button
                        variant="secondary"
                        className="text-xs font-display uppercase tracking-wide"
                        onClick={() => actions.markNotificationRead(n.id)}
                      >
                        <Check size={14} className="mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      className="text-xs font-display uppercase tracking-wide"
                      onClick={() => {
                        actions.markNotificationRead(n.id);
                        if (n.actionUrl) navigate(n.actionUrl);
                        else toast.info('No action URL for this notification');
                      }}
                    >
                      Take Action <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;

