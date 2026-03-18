import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SensorGauge } from '@/components/shared/SensorGauge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { soldTrailers } from '@/data/soldTrailers';
import { customers } from '@/data/customers';
import { dealers } from '@/data/dealers';
import { useState } from 'react';
import { ArrowLeft, Bell, Wrench, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const SensorDataDetail = () => {
  const { vin } = useParams();
  const navigate = useNavigate();
  const [notifModal, setNotifModal] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');

  const trailer = soldTrailers.find(t => t.vin === vin);
  if (!trailer) return <DashboardLayout><p>Trailer not found</p></DashboardLayout>;

  const customer = customers.find(c => c.id === trailer.customerId);
  const dealer = dealers.find(d => d.id === trailer.dealerId);
  const sd = trailer.sensorData;

  const tempHistory = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    temp: sd.axleTemp + Math.round((Math.random() - 0.5) * 30),
  }));

  const brakeHistory = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    wear: Math.min(100, sd.brakePadWear + (11 - i) * 5),
  }));

  const handleSendNotif = () => {
    setNotifModal(false);
    toast.success('Notification sent to ' + customer?.name);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-display uppercase tracking-wide">
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{trailer.name}</h1>
            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
              <span className="font-mono">VIN: {trailer.vin}</span>
              <span>Model: {trailer.modelNumber}</span>
              <span>Customer: {customer?.name}</span>
              <span>Dealer: {dealer?.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setNotifMsg(`Your B-B Trailer ${trailer.modelNumber} (${trailer.vin}) requires attention. Please contact your dealer to schedule service.`); setNotifModal(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
              <Bell size={14} /> Push Notification
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted">
              <Wrench size={14} /> Schedule Maintenance
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Info Bar */}
        <div className="flex gap-4 flex-wrap bg-card rounded-lg shadow-industrial p-3">
          <div><span className="text-[10px] font-mono uppercase text-muted-foreground">Purchased</span><p className="text-sm">{trailer.soldDate}</p></div>
          <div><span className="text-[10px] font-mono uppercase text-muted-foreground">Warranty</span><p className="text-sm">{trailer.warrantyExpiry}</p></div>
          <div><span className="text-[10px] font-mono uppercase text-muted-foreground">Mileage</span><p className="font-mono text-sm">{sd.mileage.toLocaleString()}</p></div>
          <div><span className="text-[10px] font-mono uppercase text-muted-foreground">Overall</span><StatusBadge status={sd.overallHealth} breathing /></div>
        </div>

        {/* Sensor Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SensorGauge label="Axle Temp" value={sd.axleTemp} unit="°F" status={sd.axleTemp > 200 ? 'Critical' : sd.axleTemp > 170 ? 'Warning' : 'Good'} min={0} max={300} />
          <SensorGauge label="Brake Wear" value={sd.brakePadWear} unit="%" status={sd.brakePadWear < 20 ? 'Critical' : sd.brakePadWear < 40 ? 'Warning' : 'Good'} />
          <SensorGauge label="Load Weight" value={sd.loadWeight} unit="lb" status={sd.loadWeight > 90000 ? 'Critical' : 'Good'} min={0} max={120000} />
          <SensorGauge label="Battery" value={sd.batteryVoltage} unit="V" status={sd.batteryVoltage < 11.5 ? 'Critical' : sd.batteryVoltage < 12 ? 'Warning' : 'Good'} min={10} max={14} />
          <div className="bg-card rounded-lg shadow-industrial border-t-2 border-muted p-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Frame Integrity</span>
            <div className="mt-3">
              <StatusBadge status={sd.frameMicrofractures ? 'Critical' : 'Good'} breathing={sd.frameMicrofractures} />
              <p className="text-xs text-muted-foreground mt-1">{sd.frameMicrofractures ? 'Microfractures detected' : 'Nominal'}</p>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-industrial border-t-2 border-muted p-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Tire Pressure</span>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {sd.tirePressure.slice(0, 4).map((p, i) => (
                <div key={i} className="text-center bg-muted/30 rounded-sm py-1">
                  <span className={`font-mono text-xs font-bold ${p < 90 ? 'text-danger' : p < 100 ? 'text-warning' : 'text-success'}`}>{p}</span>
                  <span className="text-[8px] text-muted-foreground block">PSI</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Axle Temp — 30 Days</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={tempHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,5%,84%)" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={6} />
                <YAxis tick={{ fontSize: 9 }} domain={[100, 250]} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="temp" stroke="hsl(0,66%,45%)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Brake Wear Decline</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={brakeHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,5%,84%)" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="wear" stroke="hsl(38,92%,50%)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance History */}
        <div className="bg-card rounded-lg shadow-industrial p-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Maintenance History</h3>
          <DataTable
            columns={[
              { key: 'date', label: 'Date', sortable: true },
              { key: 'type', label: 'Type', render: (m) => <StatusBadge status={m.type} /> },
              { key: 'description', label: 'Description' },
              { key: 'technicianName', label: 'Technician' },
              { key: 'cost', label: 'Cost', sortable: true, render: (m) => <span className="font-mono">${m.cost.toLocaleString()}</span> },
            ]}
            data={trailer.maintenanceHistory}
          />
        </div>

        {/* Push Notification Modal */}
        <Modal isOpen={notifModal} onClose={() => setNotifModal(false)} title="Send Maintenance Alert">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground">Customer</span>
              <p className="text-sm">{customer?.name} ({customer?.email})</p>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Message</label>
              <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)} rows={4} className="w-full border border-border rounded-md p-2 text-sm bg-card focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSendNotif} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:opacity-90">
                Send Notification
              </button>
              <button onClick={() => setNotifModal(false)} className="px-4 py-2 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default SensorDataDetail;
