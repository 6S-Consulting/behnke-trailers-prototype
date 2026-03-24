import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppData } from '@/context/AppDataContext';
import { CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MaintenanceSlotManager = () => {
  const { state, actions } = useAppData();
  // Track current calendar month/year
  const now = new Date();
  // Find the year with the most slots to initialise the calendar there
  const slotYears = state.maintenanceSlots.map(s => parseInt((s.requestedDate || s.confirmedDate || '').slice(0, 4))).filter(Boolean);
  const initYear = slotYears.length > 0 ? slotYears.sort((a, b) =>
    slotYears.filter(y => y === b).length - slotYears.filter(y => y === a).length
  )[0] : now.getFullYear();

  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(initYear);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const slots = state.maintenanceSlots; // live from context state

  const confirm = (id: string) => {
    toast.success('Slot confirmed — notification sent to customer');
    actions.confirmMaintenanceSlot({
      slotId: id,
      priority: 'Normal',
    });
  };

  const complete = (id: string) => {
    toast.success('Slot marked as completed — maintenance record created');
    actions.completeMaintenanceSlot({ slotId: id });
  };

  const cancel = (id: string) => {
    toast.info('Slot cancelled');
    actions.cancelMaintenanceSlot(id);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const slotsForDate = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return slots.filter(s => s.requestedDate === dateStr || s.confirmedDate === dateStr);
  };

  const daySlots = selectedDay
    ? slots.filter(s => s.requestedDate === selectedDay || s.confirmedDate === selectedDay)
    : [];

  // Summary counts
  const pending = slots.filter(s => s.status === 'Requested').length;
  const confirmed = slots.filter(s => s.status === 'Confirmed').length;
  const completed = slots.filter(s => s.status === 'Completed').length;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Maintenance Schedule</h1>

        {/* Summary Strip */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-3">
              <AlertTriangle size={18} className="text-warning shrink-0" />
              <div>
                <p className="font-display text-xl font-bold text-white">{pending}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
            <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-center gap-3">
              <CheckCircle size={18} className="text-success shrink-0" />
              <div>
                <p className="font-display text-xl font-bold text-white">{confirmed}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Confirmed Slots</p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
            <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-3 flex items-center gap-3">
              <XCircle size={18} className="text-muted-foreground shrink-0" />
              <div>
                <p className="font-display text-xl font-bold text-white">{completed}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Completed</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Year + Month Navigator */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Year nav */}
          <div className="flex items-center gap-1 bg-card/60 border border-white/5 rounded-md px-2 py-1">
            <button
              onClick={() => { setYear(y => y - 1); setSelectedDay(null); }}
              className="p-0.5 hover:text-primary transition-colors"
              aria-label="Previous year"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-display font-bold text-sm w-12 text-center">{year}</span>
            <button
              onClick={() => { setYear(y => y + 1); setSelectedDay(null); }}
              className="p-0.5 hover:text-primary transition-colors"
              aria-label="Next year"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          {/* Month pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {months.map((m, i) => {
              // Count how many slots are in this month+year
              const mm = String(i + 1).padStart(2, '0');
              const prefix = `${year}-${mm}-`;
              const count = slots.filter(s =>
                (s.requestedDate || '').startsWith(prefix) ||
                (s.confirmedDate || '').startsWith(prefix)
              ).length;
              return (
                <button
                  key={m}
                  onClick={() => { setMonth(i); setSelectedDay(null); }}
                  className={cn(
                    'relative px-2.5 py-1 text-xs font-display uppercase tracking-wide rounded-sm transition-colors',
                    month === i ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  {m}
                  {count > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      backgroundColor: '#f59e0b', color: '#000',
                      fontSize: 8, fontWeight: 700, fontFamily: 'monospace',
                      width: 14, height: 14, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
            <h3 className="font-display font-bold uppercase tracking-wide mb-3">{months[month]} {year}</h3>
            <div className="grid grid-cols-7 gap-1 mt-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[9px] font-mono uppercase text-muted-foreground text-center py-1.5">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="aspect-[4/3]" />)}
              {days.map(d => {
                const ds = slotsForDate(d);
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const hasRequested = ds.some(s => s.status === 'Requested');
                const hasConfirmed = ds.some(s => s.status === 'Confirmed');
                const hasCompleted = ds.some(s => s.status === 'Completed');
                const hasEmergency = ds.some(s => s.type === 'Emergency');
                const isSelected = selectedDay === dateStr;
                const isToday = dateStr === `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` &&
                  month === new Date().getMonth() && year === new Date().getFullYear();

                // Inline colors — guaranteed to render regardless of Tailwind purge
                const dominantColor = hasEmergency ? '#ef4444'
                  : hasRequested ? '#f59e0b'
                    : hasConfirmed ? '#10b981'
                      : '#6b7280';

                const cellInlineStyle: React.CSSProperties = ds.length > 0 && !isSelected
                  ? { borderLeft: `3px solid ${dominantColor}`, backgroundColor: `${dominantColor}18` }
                  : {};

                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    style={cellInlineStyle}
                    className={cn(
                      'aspect-[4/3] flex flex-col items-center justify-start pt-1.5 rounded-md transition-all duration-150 relative overflow-hidden',
                      isSelected && 'ring-2 ring-primary bg-primary/20',
                      !isSelected && 'hover:brightness-110 hover:bg-white/5',
                      isToday && !isSelected && 'ring-1 ring-primary/60',
                    )}
                  >
                    {/* Day number */}
                    <span className={cn(
                      'text-[11px] font-mono leading-none',
                      isToday ? 'text-primary font-bold' : ds.length > 0 ? 'text-white font-semibold' : 'text-white/40'
                    )}>
                      {d}
                    </span>

                    {/* Colored status dots */}
                    {ds.length > 0 && (
                      <div style={{ display: 'flex', gap: 2, marginTop: 3, justifyContent: 'center' }}>
                        {hasRequested && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block', flexShrink: 0 }} />}
                        {hasConfirmed && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', flexShrink: 0 }} />}
                        {hasCompleted && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6b7280', display: 'inline-block', flexShrink: 0 }} />}
                        {hasEmergency && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', flexShrink: 0 }} />}
                      </div>
                    )}

                    {/* Count badge */}
                    {ds.length > 0 && (
                      <span style={{
                        position: 'absolute', bottom: 2, right: 2,
                        backgroundColor: dominantColor,
                        color: hasRequested && !hasEmergency ? '#000' : '#fff',
                        fontSize: 8, fontFamily: 'monospace', fontWeight: 700,
                        padding: '1px 3px', borderRadius: 3, lineHeight: 1.3,
                      }}>
                        {ds.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-mono text-muted-foreground border-t border-white/5 pt-3">
              <span className="flex items-center gap-1.5">
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                Requested
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                Confirmed
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#6b7280', display: 'inline-block' }} />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                Emergency
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <span className="w-2.5 h-2.5 rounded-sm ring-1 ring-primary/60 inline-block" />
                Today
              </span>
            </div>
          </div>

          {/* Slot List / Day Detail */}
          <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 max-h-[520px] overflow-y-auto hover:border-white/[0.12] transition-colors">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              {selectedDay ? `Slots for ${selectedDay}` : 'Upcoming Slots'}
            </h3>
            {(selectedDay ? daySlots : slots.filter(s => s.status === 'Requested' || s.status === 'Confirmed')).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">{selectedDay ? 'No slots on this date' : 'No upcoming slots'}</p>
            ) : (selectedDay ? daySlots : slots.filter(s => s.status === 'Requested' || s.status === 'Confirmed')).map(s => {
              const trailer = state.soldTrailers.find(t => t.id === s.trailerId);
              const cust = state.customers.find(c => c.id === s.customerId);
              const dlr = state.dealers.find(d => d.id === s.dealerId);
              return (
                <div key={s.id} className="py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white">{trailer?.vin || s.trailerId}</span>
                      <StatusBadge status={s.status} />
                    </div>
                    <span className={cn('text-[10px] font-display uppercase tracking-wide px-1.5 py-0.5 rounded-sm', s.type === 'Emergency' ? 'bg-danger/20 text-danger' : 'bg-muted text-muted-foreground')}>
                      {s.type}
                    </span>
                  </div>
                  <p className="text-xs text-white">{cust?.name} — {trailer?.modelNumber || '—'}</p>
                  <p className="text-xs text-muted-foreground">{dlr?.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Requested: {s.requestedDate}
                    {s.confirmedDate && s.confirmedDate !== s.requestedDate && ` · Confirmed: ${s.confirmedDate}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>
                  <div className="flex gap-1.5 mt-2">
                    {s.status === 'Requested' && (
                      <button onClick={() => confirm(s.id)} className="px-2.5 py-1 bg-success/20 text-success border border-success/30 rounded-sm text-[10px] font-display uppercase tracking-wide hover:bg-success/30 transition-colors">
                        Confirm → Notify Customer
                      </button>
                    )}
                    {(s.status === 'Requested' || s.status === 'Confirmed') && (
                      <>
                        <button onClick={() => complete(s.id)} className="px-2.5 py-1 bg-muted rounded-sm text-[10px] font-display uppercase tracking-wide hover:bg-muted/80 transition-colors">Complete</button>
                        <button onClick={() => cancel(s.id)} className="px-2.5 py-1 bg-danger/10 text-danger border border-danger/20 rounded-sm text-[10px] font-display uppercase tracking-wide hover:bg-danger/20 transition-colors">Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Slots Table */}
        <div className="bg-card/60 backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 hover:border-white/[0.12] transition-colors">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">All Maintenance Slots</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  {['Trailer', 'Customer', 'Dealer', 'Date', 'Type', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((s, i) => {
                  const trailer = state.soldTrailers.find(t => t.id === s.trailerId);
                  const cust = state.customers.find(c => c.id === s.customerId);
                  const dlr = state.dealers.find(d => d.id === s.dealerId);
                  return (
                    <tr key={s.id} className={cn('border-t border-white/5', i % 2 !== 0 && 'bg-white/5')}>
                      <td className="px-3 py-2.5 font-mono text-xs text-white">{trailer?.vin || s.trailerId}</td>
                      <td className="px-3 py-2.5 text-xs">{cust?.name || s.customerId}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{dlr?.name}</td>
                      <td className="px-3 py-2.5 text-xs font-mono">{s.confirmedDate || s.requestedDate}</td>
                      <td className="px-3 py-2.5"><span className="text-xs">{s.type}</span></td>
                      <td className="px-3 py-2.5"><StatusBadge status={s.status} /></td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-2">
                          {s.status === 'Requested' && (
                            <button onClick={() => confirm(s.id)} className="text-xs text-success hover:underline font-display uppercase tracking-wide">Confirm</button>
                          )}
                          {(s.status === 'Requested' || s.status === 'Confirmed') && (
                            <button onClick={() => cancel(s.id)} className="text-xs text-danger hover:underline font-display uppercase tracking-wide">Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MaintenanceSlotManager;
