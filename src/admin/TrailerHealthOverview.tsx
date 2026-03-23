import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { CheckCircle, AlertTriangle, XCircle, Calendar } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useAppData } from '@/context/AppDataContext';

const radarData = [
  { subject: 'Axle Temp', A: 75 },
  { subject: 'Tire Pressure', A: 82 },
  { subject: 'Brake Wear', A: 58 },
  { subject: 'Frame Integrity', A: 88 },
  { subject: 'Load Rating', A: 70 },
  { subject: 'Battery', A: 90 },
];

const TrailerHealthOverview = () => {
  const navigate = useNavigate();
  const { state } = useAppData();

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

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Fleet Health Overview</h1>
          <span className="text-[10px] font-mono text-muted-foreground">Last sync: {new Date().toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard title="Healthy" value={healthCounts.Good} icon={CheckCircle} />
          <MetricCard title="Warning" value={healthCounts.Warning} icon={AlertTriangle} />
          <MetricCard title="Critical" value={healthCounts.Critical} icon={XCircle} />
          <MetricCard title="Maint. Due Soon" value={dueSoonCount} icon={Calendar} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Fleet Health Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(240,5%,84%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Fleet Avg" dataKey="A" stroke="hsl(0,66%,45%)" fill="hsl(0,66%,45%)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 bg-card rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Alert Feed</h3>
              {state.soldTrailers.filter(t => t.sensorData.overallHealth !== 'Good').map(t => {
                const cust = state.customers.find(c => c.id === t.customerId);
                const dlr = state.dealers.find(d => d.id === t.dealerId);
              return (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={t.sensorData.overallHealth} breathing />
                    <div>
                      <span className="font-mono text-xs">{t.vin}</span>
                      <span className="text-xs text-muted-foreground ml-2">{t.modelNumber}</span>
                      <span className="text-xs text-muted-foreground ml-2">• {cust?.name}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/admin/health/${t.vin}`)} className="text-xs text-primary font-display uppercase tracking-wide hover:underline">
                    View
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Fleet Table */}
        <div className="bg-card rounded-lg shadow-industrial p-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">All Sold Trailers</h3>
          <DataTable
            columns={[
              { key: 'vin', label: 'VIN', sortable: true, render: (t) => <span className="font-mono text-xs">{t.vin}</span> },
              { key: 'modelNumber', label: 'Model', sortable: true },
              { key: 'category', label: 'Category', render: (t) => <StatusBadge status={t.category} /> },
              { key: 'customer', label: 'Customer', render: (t) => <span className="text-xs">{state.customers.find(c => c.id === t.customerId)?.name}</span> },
              { key: 'dealer', label: 'Dealer', render: (t) => <span className="text-xs">{state.dealers.find(d => d.id === t.dealerId)?.name}</span> },
              { key: 'mileage', label: 'Mileage', sortable: true, render: (t) => <span className="font-mono text-xs">{t.sensorData.mileage.toLocaleString()}</span> },
              { key: 'health', label: 'Health', render: (t) => <StatusBadge status={t.sensorData.overallHealth} breathing /> },
            ]}
            data={state.soldTrailers}
            searchable
            onRowClick={(t) => navigate(`/admin/health/${t.vin}`)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrailerHealthOverview;
