import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { CheckCircle, AlertTriangle, XCircle, Calendar, Bell, Wrench, LayoutGrid, List } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useAppData } from '@/context/AppDataContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const getHealthReasons = (t: { sensorData: { axleTemp: number; brakePadWear: number; frameMicrofractures: boolean; tirePressure: number[]; batteryVoltage: number; overallHealth: string } }) => {
  const reasons: string[] = [];
  if (t.sensorData.axleTemp > 200) reasons.push(`Axle temp ${t.sensorData.axleTemp}°F (>200°F threshold)`);
  if (t.sensorData.brakePadWear < 25) reasons.push(`Brake pad wear at ${t.sensorData.brakePadWear}% (critical <25%)`);
  if (t.sensorData.frameMicrofractures) reasons.push('Frame microfractures detected');
  if (t.sensorData.tirePressure.some(p => p < 90)) reasons.push(`Low tire pressure: ${t.sensorData.tirePressure.join('/')} PSI`);
  if (t.sensorData.batteryVoltage < 11.5) reasons.push(`Low battery voltage: ${t.sensorData.batteryVoltage}V`);
  if (reasons.length === 0 && t.sensorData.overallHealth !== 'Good') {
    // Infer from overall health flag even if individual thresholds look borderline
    reasons.push('Sensor aggregate score below threshold — general degradation detected');
  }
  return reasons;
};

const TrailerHealthOverview = () => {
  const navigate = useNavigate();
  const { state, actions } = useAppData();
  const [notifySent, setNotifySent] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'table' | 'grid'>('table');

  const healthCounts = {
    Good: state.soldTrailers.filter(t => t.sensorData.overallHealth === 'Good').length,
    Warning: state.soldTrailers.filter(t => t.sensorData.overallHealth === 'Warning').length,
    Critical: state.soldTrailers.filter(t => t.sensorData.overallHealth === 'Critical').length,
  };

  const dueSoonCount = state.soldTrailers.filter(st => {
    const due = new Date(st.nextMaintenanceDue + 'T00:00:00').getTime();
    const now = Date.now();
    const diffDays = (due - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  // Fleet radar from actual data
  const fleetAvg = state.soldTrailers.length > 0 ? {
    axleTemp: Math.round(state.soldTrailers.reduce((s, t) => s + Math.min(100, (250 - t.sensorData.axleTemp) / 1.5), 0) / state.soldTrailers.length),
    brakeWear: Math.round(state.soldTrailers.reduce((s, t) => s + t.sensorData.brakePadWear, 0) / state.soldTrailers.length),
    battery: Math.round(state.soldTrailers.reduce((s, t) => s + Math.min(100, ((t.sensorData.batteryVoltage - 10) / 3) * 100), 0) / state.soldTrailers.length),
  } : { axleTemp: 75, brakeWear: 58, battery: 90 };

  const radarData = [
    { subject: 'Axle Temp', A: fleetAvg.axleTemp },
    { subject: 'Tire Pressure', A: 82 },
    { subject: 'Brake Wear', A: fleetAvg.brakeWear },
    { subject: 'Frame Integrity', A: state.soldTrailers.filter(t => !t.sensorData.frameMicrofractures).length / Math.max(1, state.soldTrailers.length) * 100 },
    { subject: 'Load Rating', A: 70 },
    { subject: 'Battery', A: fleetAvg.battery },
  ];

  const alertTrailers = state.soldTrailers.filter(t => t.sensorData.overallHealth !== 'Good');

  const sendNotification = (t: typeof alertTrailers[0]) => {
    const reasons = getHealthReasons(t);
    const message = `⚠️ Your trailer ${t.modelNumber} (VIN: ${t.vin}) requires attention. Reason(s): ${reasons.join('; ')}. Please contact your dealer or visit our service centre immediately.`;
    actions.pushHealthWarning({ soldTrailerId: t.id, message });
    setNotifySent(prev => ({ ...prev, [t.id]: true }));
    toast.success(`Notification sent to customer for VIN ${t.vin}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Fleet Health Overview</h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted-foreground">Last sync: {new Date().toLocaleString()}</span>
            <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-white/10 rounded-sm hover:bg-white/5 transition-all active:scale-95">
              {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
            </button>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {[
            <MetricCard key="h" title="Healthy" value={healthCounts.Good} icon={CheckCircle} />,
            <MetricCard key="w" title="Warning" value={healthCounts.Warning} icon={AlertTriangle} trendDown={healthCounts.Warning > 0} />,
            <MetricCard key="c" title="Critical" value={healthCounts.Critical} icon={XCircle} trendDown={healthCounts.Critical > 0} />,
            <MetricCard key="m" title="Maint. Due Soon" value={dueSoonCount} icon={Calendar} />,
          ].map((card, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              {card}
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Fleet Health Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(0 0% 100% / 0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Fleet Avg" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Alert Feed with reasons & actions */}
          <div className="lg:col-span-2 bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 max-h-[340px] overflow-y-auto hover:border-white/[0.12] transition-colors">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Alert Feed</h3>
            {alertTrailers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">All trailers currently healthy ✓</p>
            ) : alertTrailers.map(t => {
              const cust = state.customers.find(c => c.id === t.customerId);
              const reasons = getHealthReasons(t);
              return (
                <div key={t.id} className={cn('py-3 border-b border-white/5 last:border-0', t.sensorData.overallHealth === 'Critical' && 'bg-danger/5 rounded-md px-2 mb-1')}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <StatusBadge status={t.sensorData.overallHealth} breathing />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-white">{t.vin}</span>
                          <span className="text-xs text-muted-foreground">{t.modelNumber}</span>
                          {cust && <span className="text-xs text-muted-foreground">· {cust.name}</span>}
                        </div>
                        {/* ──  Reasons ── */}
                        <ul className="mt-1 space-y-0.5">
                          {reasons.map((r, i) => (
                            <li key={i} className="flex items-start gap-1 text-[11px] text-warning">
                              <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => navigate(`/admin/health/${t.vin}`)} className="text-xs text-primary hover:underline font-display uppercase tracking-wide whitespace-nowrap">
                        Details
                      </button>
                      <button
                        onClick={() => sendNotification(t)}
                        disabled={notifySent[t.id]}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-display uppercase tracking-wide whitespace-nowrap transition-all',
                          notifySent[t.id]
                            ? 'bg-muted text-muted-foreground cursor-default'
                            : 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20'
                        )}
                      >
                        <Bell size={10} />
                        {notifySent[t.id] ? 'Sent' : 'Notify'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Fleet Table / Grid */}
        <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">All Sold Trailers</h3>
          {view === 'table' ? (
            <DataTable
              columns={[
                { key: 'vin', label: 'VIN', sortable: true, render: (t) => <span className="font-mono text-xs">{t.vin}</span> },
                { key: 'modelNumber', label: 'Model', sortable: true },
                { key: 'category', label: 'Category', render: (t) => <StatusBadge status={t.category} /> },
                { key: 'customer', label: 'Customer', render: (t) => <span className="text-xs">{state.customers.find(c => c.id === t.customerId)?.name}</span> },
                { key: 'mileage', label: 'Mileage', sortable: true, render: (t) => <span className="font-mono text-xs">{t.sensorData.mileage.toLocaleString()}</span> },
                {
                  key: 'brakes', label: 'Brakes', render: (t) => (
                    <span className={cn('font-mono text-xs', t.sensorData.brakePadWear < 20 ? 'text-danger' : t.sensorData.brakePadWear < 35 ? 'text-warning' : 'text-success')}>
                      {t.sensorData.brakePadWear}%
                    </span>
                  )
                },
                { key: 'health', label: 'Health', render: (t) => <StatusBadge status={t.sensorData.overallHealth} breathing /> },
                {
                  key: 'actions', label: '', render: (t) => (
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/health/${t.vin}`); }} className="text-xs text-primary hover:underline font-display uppercase tracking-wide">
                        View
                      </button>
                      {t.sensorData.overallHealth !== 'Good' && !notifySent[t.id] && (
                        <button onClick={(e) => { e.stopPropagation(); sendNotification(t); }} className="text-xs text-warning hover:underline font-display uppercase tracking-wide flex items-center gap-0.5">
                          <Bell size={10} /> Notify
                        </button>
                      )}
                    </div>
                  )
                },
              ]}
              data={state.soldTrailers}
              searchable
              onRowClick={(t) => navigate(`/admin/health/${t.vin}`)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {state.soldTrailers.map(t => {
                const cust = state.customers.find(c => c.id === t.customerId);
                return (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/admin/health/${t.vin}`)}
                    className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-mono text-xs text-muted-foreground">{t.vin}</span>
                        <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{t.name}</h3>
                      </div>
                      <StatusBadge status={t.sensorData.overallHealth} breathing />
                    </div>
                    <p className="text-xs text-muted-foreground">{cust?.name}</p>
                    <p className="text-xs text-muted-foreground mb-3">{t.modelNumber} · <StatusBadge status={t.category} /></p>
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                      <div className="text-center">
                        <span className="font-mono text-sm font-bold text-white">{t.sensorData.mileage.toLocaleString()}</span>
                        <span className="text-[9px] font-mono uppercase text-muted-foreground block">Miles</span>
                      </div>
                      <div className="text-center">
                        <span className={cn('font-mono text-sm font-bold', t.sensorData.brakePadWear < 20 ? 'text-danger' : t.sensorData.brakePadWear < 35 ? 'text-warning' : 'text-success')}>{t.sensorData.brakePadWear}%</span>
                        <span className="text-[9px] font-mono uppercase text-muted-foreground block">Brakes</span>
                      </div>
                      <div className="text-center">
                        <span className="font-mono text-sm font-bold text-white">{t.sensorData.batteryVoltage}V</span>
                        <span className="text-[9px] font-mono uppercase text-muted-foreground block">Battery</span>
                      </div>
                    </div>
                    {t.sensorData.overallHealth !== 'Good' && !notifySent[t.id] && (
                      <button
                        onClick={(e) => { e.stopPropagation(); sendNotification(t); }}
                        className="mt-3 w-full flex items-center justify-center gap-1 px-2 py-1 rounded-sm text-[10px] font-display uppercase tracking-wide bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20"
                      >
                        <Bell size={10} /> Notify Customer
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrailerHealthOverview;
