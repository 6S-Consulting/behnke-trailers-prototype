import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppData } from '@/context/AppDataContext';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MaintenanceSlotManager = () => {
  const { state, actions } = useAppData();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const confirm = (id: string) => {
    toast.success('Slot confirmed — notification sent to customer');
    actions.confirmMaintenanceSlot({
      slotId: id,
      message: undefined,
      priority: 'Normal',
    });
  };

  const complete = (id: string) => {
    toast.success('Slot marked as completed');
    actions.completeMaintenanceSlot({ slotId: id });
  };

  const cancel = (id: string) => {
    toast.info('Slot cancelled');
    actions.cancelMaintenanceSlot(id);
  };

  // Simple calendar for March-October 2025
  const currentMonth = 2; // March (0-indexed)
  const [month, setMonth] = useState(currentMonth);
  const year = 2025;
  const slots = state.maintenanceSlots;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const slotsForDate = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return slots.filter(s => s.requestedDate === dateStr || s.confirmedDate === dateStr);
  };

  const daySlots = selectedDay ? slots.filter(s => s.requestedDate === selectedDay || s.confirmedDate === selectedDay) : [];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Maintenance Schedule</h1>

        {/* Month selector */}
        <div className="flex items-center gap-2">
          {months.map((m, i) => (
            <button key={m} onClick={() => setMonth(i)} className={cn('px-2 py-1 text-xs font-display uppercase tracking-wide rounded-sm', month === i ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
              {m}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-card rounded-lg shadow-industrial p-4">
            <h3 className="font-display font-bold uppercase tracking-wide mb-3">{months[month]} {year}</h3>
            <div className="grid grid-cols-7 gap-px">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[9px] font-mono uppercase text-muted-foreground text-center py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {days.map(d => {
                const ds = slotsForDate(d);
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(dateStr)}
                    className={cn(
                      'aspect-square flex flex-col items-center justify-center rounded-sm text-xs hover:bg-muted relative',
                      selectedDay === dateStr && 'ring-1 ring-primary'
                    )}
                  >
                    {d}
                    {ds.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {ds.map(s => (
                          <div key={s.id} className={cn('w-1.5 h-1.5 rounded-full', s.status === 'Confirmed' ? 'bg-success' : s.status === 'Completed' ? 'bg-muted-foreground' : s.status === 'Requested' ? 'bg-warning' : 'bg-muted-foreground')} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day detail / All slots */}
          <div className="bg-card rounded-lg shadow-industrial p-4 max-h-[500px] overflow-y-auto">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              {selectedDay ? `Slots for ${selectedDay}` : 'All Upcoming Slots'}
            </h3>
            {(selectedDay ? daySlots : slots.filter(s => s.status !== 'Completed' && s.status !== 'Cancelled')).map(s => {
              const trailer = state.soldTrailers.find(t => t.id === s.trailerId);
              const cust = state.customers.find(c => c.id === s.customerId);
              const dlr = state.dealers.find(d => d.id === s.dealerId);
              return (
                <div key={s.id} className="py-3 border-b border-border last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs">{trailer?.vin || s.trailerId}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs">{cust?.name} — {trailer?.modelNumber}</p>
                  <p className="text-xs text-muted-foreground">{dlr?.name} • {s.type}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>
                  <div className="flex gap-1 mt-2">
                    {s.status === 'Requested' && (
                      <button onClick={() => confirm(s.id)} className="px-2 py-1 bg-success text-success-foreground rounded-sm text-[10px] font-display uppercase tracking-wide">Confirm</button>
                    )}
                    {(s.status === 'Requested' || s.status === 'Confirmed') && (
                      <>
                        <button onClick={() => complete(s.id)} className="px-2 py-1 bg-muted rounded-sm text-[10px] font-display uppercase tracking-wide">Complete</button>
                        <button onClick={() => cancel(s.id)} className="px-2 py-1 bg-danger/10 text-danger rounded-sm text-[10px] font-display uppercase tracking-wide">Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MaintenanceSlotManager;
