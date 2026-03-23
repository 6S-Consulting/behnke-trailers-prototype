import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SensorGauge } from '@/components/shared/SensorGauge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { MaintenanceRecord, SoldTrailer } from '@/types';

const CustomerHealth = () => {
  const { user } = useAuth();
  const { state, actions } = useAppData();
  const [selected, setSelected] = useState(0);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [serviceType, setServiceType] = useState<'Scheduled' | 'Inspection' | 'Emergency'>('Scheduled');
  const [preferredDate, setPreferredDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const myTrailers = state.soldTrailers.filter(t => t.customerId === (user?.id ?? ''));
  const trailer = myTrailers[selected];
  const sd = trailer?.sensorData;
  const dealer = trailer ? state.dealers.find(d => d.id === trailer.dealerId) : undefined;

  if (!user || !trailer || !sd) {
    return (
      <DashboardLayout>
        <div className="text-sm text-muted-foreground">No trailers found for this account.</div>
      </DashboardLayout>
    );
  }

  const tempHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    temp: sd.axleTemp + Math.round((Math.random() - 0.5) * 25),
  }));

  const overallScore = Math.round((sd.brakePadWear + (100 - (sd.axleTemp / 3)) + (sd.batteryVoltage > 12 ? 90 : 60)) / 3);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Trailer Health & Service</h1>

        {/* Trailer tabs */}
        {myTrailers.length > 1 && (
          <div className="flex gap-2">
            {myTrailers.map((t, i) => (
              <button key={t.id} onClick={() => setSelected(i)} className={cn('px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide', selected === i ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Info bar */}
        <div className="flex gap-4 flex-wrap bg-card rounded-lg shadow-industrial p-3 text-sm">
          <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">VIN</span><span className="font-mono">{trailer.vin}</span></div>
          <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Model</span>{trailer.modelNumber}</div>
          <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Purchased</span>{trailer.soldDate}</div>
          <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Dealer</span>{dealer?.name}</div>
          <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Warranty</span>{trailer.warrantyExpiry}</div>
        </div>

        {/* Sensor Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-card rounded-lg shadow-industrial border-t-primary p-4 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Health Score</span>
            <span className={cn('text-4xl font-display font-bold tabular-nums', overallScore >= 80 ? 'text-success' : overallScore >= 50 ? 'text-warning' : 'text-danger')}>{overallScore}</span>
            <span className="text-xs text-muted-foreground block">/100</span>
          </div>
          <SensorGauge label="Axle Temp" value={sd.axleTemp} unit="°F" status={sd.axleTemp > 200 ? 'Critical' : sd.axleTemp > 170 ? 'Warning' : 'Good'} min={0} max={300} />
          <SensorGauge label="Brake Wear" value={sd.brakePadWear} unit="%" status={sd.brakePadWear < 20 ? 'Critical' : sd.brakePadWear < 40 ? 'Warning' : 'Good'} />
          <SensorGauge label="Load" value={sd.loadWeight} unit="lb" status="Good" min={0} max={100000} />
          <SensorGauge label="Battery" value={sd.batteryVoltage} unit="V" status={sd.batteryVoltage < 11.5 ? 'Critical' : sd.batteryVoltage < 12 ? 'Warning' : 'Good'} min={10} max={14} />
          <div className="bg-card rounded-lg shadow-industrial border-t-2 border-muted p-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Tire Pressure</span>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {sd.tirePressure.slice(0, 4).map((p, i) => (
                <div key={i} className="text-center bg-muted/30 rounded-sm py-1">
                  <span className={cn('font-mono text-xs font-bold', p < 90 ? 'text-danger' : p < 100 ? 'text-warning' : 'text-success')}>{p}</span>
                  <span className="text-[8px] text-muted-foreground block">PSI</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card rounded-lg shadow-industrial p-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Axle Temperature — 30 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={tempHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,5%,84%)" />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} domain={[100, 250]} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="temp" stroke="hsl(0,66%,45%)" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Maintenance History */}
        <div className="bg-card rounded-lg shadow-industrial p-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Maintenance History</h3>
          <DataTable<MaintenanceRecord>
            columns={[
              { key: 'date', label: 'Date', sortable: true },
              { key: 'type', label: 'Type', render: (m) => <StatusBadge status={m.type} /> },
              { key: 'description', label: 'Description' },
              { key: 'technicianName', label: 'Technician' },
              { key: 'cost', label: 'Cost', render: (m) => <span className="font-mono text-xs">${m.cost.toLocaleString()}</span> },
            ]}
            data={trailer.maintenanceHistory}
          />
        </div>

        {/* Schedule CTA */}
        <div className="bg-card rounded-lg shadow-industrial p-4 flex items-center justify-between border-l-4 border-primary">
          <div>
            <p className="text-sm font-medium">Next recommended maintenance: {trailer.nextMaintenanceDue}</p>
            <p className="text-xs text-muted-foreground">Contact your dealer to schedule service</p>
          </div>
          <button onClick={() => setScheduleOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
            Schedule Maintenance
          </button>
        </div>

        <Modal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule Maintenance">
          <div className="space-y-3">
            <div><span className="text-[10px] font-mono uppercase text-muted-foreground block">Dealer</span><p className="text-sm">{dealer?.name}</p></div>
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value as 'Scheduled' | 'Inspection' | 'Emergency')}
                className="w-full border border-border rounded-md p-2 text-sm bg-card"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Inspection">Inspection</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Preferred Date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={e => setPreferredDate(e.target.value)}
                className="w-full border border-border rounded-md p-2 text-sm bg-card"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-border rounded-md p-2 text-sm bg-card"
              />
            </div>
            <button
              onClick={() => {
                actions.requestMaintenanceSlot({
                  customerId: user.id,
                  dealerId: dealer?.id ?? trailer.dealerId,
                  soldTrailerId: trailer.id,
                  trailerId: trailer.trailerId,
                  requestedDate: preferredDate,
                  type: serviceType,
                  notes,
                });
                setScheduleOpen(false);
                setNotes('');
                toast.success('Maintenance request submitted!');
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide"
            >
              Submit Request
            </button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default CustomerHealth;
