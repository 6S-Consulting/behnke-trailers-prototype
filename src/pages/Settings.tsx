import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user, role } = useAuth();
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [theme, setTheme] = useState<'Light' | 'Dark'>('Dark');

  const subtitle = useMemo(() => {
    if (!user || !role) return '';
    if (role === 'admin') return user.company;
    if (role === 'dealer') return user.company;
    return user.company;
  }, [user, role]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <Button
            onClick={() => toast.success('Settings saved (prototype)')}
            className="text-xs font-display uppercase tracking-wide"
          >
            Save
          </Button>
        </div>

        <div className="bg-card rounded-lg shadow-industrial p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Profile</p>
              <p className="font-display uppercase tracking-wide text-sm mt-1">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{user?.company}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Role</p>
              <p className="font-display uppercase tracking-wide text-sm mt-1">{role?.toUpperCase()}</p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Notifications</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <label className="flex items-center gap-3 p-3 rounded-sm bg-muted/20 border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceAlerts}
                  onChange={() => setMaintenanceAlerts(v => !v)}
                />
                <span className="text-xs font-display uppercase tracking-wide">Maintenance Alerts</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-sm bg-muted/20 border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={() => setEmailUpdates(v => !v)}
                />
                <span className="text-xs font-display uppercase tracking-wide">Email Updates</span>
              </label>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Theme</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button
                variant={theme === 'Dark' ? 'default' : 'outline'}
                className="text-xs font-display uppercase tracking-wide"
                onClick={() => setTheme('Dark')}
              >
                Dark
              </Button>
              <Button
                variant={theme === 'Light' ? 'default' : 'outline'}
                className="text-xs font-display uppercase tracking-wide"
                onClick={() => setTheme('Light')}
              >
                Light
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Theme toggle is cosmetic in this prototype.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

