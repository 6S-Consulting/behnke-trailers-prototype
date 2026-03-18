import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { soldTrailers } from '@/data/soldTrailers';
import { quotes } from '@/data/quotes';
import { dealers } from '@/data/dealers';
import { customers } from '@/data/customers';
import { useNavigate } from 'react-router-dom';

const customerId = 'c1';
const customer = customers.find(c => c.id === customerId)!;
const myTrailers = soldTrailers.filter(t => t.customerId === customerId);
const myQuotes = quotes.filter(q => q.toId === customerId).slice(0, 3);
const dealer = dealers.find(d => d.id === customer.assignedDealerId)!;

const CustomerDashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">Welcome back, {customer.name}</h1>
            <p className="text-xs text-muted-foreground mt-1">{customer.company} — {customer.address}</p>
          </div>
          <div className="bg-white/5 rounded-md p-3 border border-white/5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Your Dealer</p>
            <p className="text-sm font-medium text-white">{dealer.name}</p>
            <p className="text-xs text-muted-foreground">{dealer.phone} • {dealer.email}</p>
          </div>
        </div>

        {/* My Trailers */}
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-3">My Trailers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myTrailers.map(t => (
              <div key={t.id} className="bg-card border border-white/5 rounded-lg shadow-industrial p-4 border-t-primary transition-all duration-300 hover:border-primary/30 group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{t.name}</h3>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">VIN: {t.vin}</span>
                  </div>
                  <StatusBadge status={t.sensorData.overallHealth} breathing={t.sensorData.overallHealth === 'Critical'} />
                </div>
                <StatusBadge status={t.category} className="mb-2" />
                <p className="text-[11px] text-muted-foreground italic">Purchased: {t.soldDate}</p>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <span className="font-mono text-xs font-bold block text-white">{t.sensorData.brakePadWear}%</span>
                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground">Brakes</span>
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-xs font-bold block text-white">{t.sensorData.axleTemp}°F</span>
                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground">Axle</span>
                  </div>
                  <div className="text-center">
                    <span className="font-mono text-xs font-bold block text-white">{t.sensorData.mileage.toLocaleString()}</span>
                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted-foreground">Miles</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => navigate('/customer/health')} className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all rounded-sm text-[10px] font-display uppercase tracking-widest text-center">Health Details</button>
                  <button onClick={() => navigate('/customer/contact')} className="flex-1 px-2 py-1.5 bg-primary text-white hover:brightness-110 transition-all rounded-sm text-[10px] font-display uppercase tracking-widest text-center">Schedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Quotes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Quick Actions</h3>
            <div className="flex gap-2">
              <button onClick={() => navigate('/customer/contact')} className="flex-1 px-3 py-3 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
                💬 Request a Quote
              </button>
              <button onClick={() => navigate('/customer/health')} className="flex-1 px-3 py-3 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted">
                🔔 View Alerts
              </button>
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur-sm border border-white/5 rounded-lg shadow-industrial p-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Active Quotes</h3>
            {myQuotes.map(q => (
              <div key={q.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <span className="font-mono text-xs text-white">{q.quoteNumber}</span>
                  <span className="text-xs text-muted-foreground ml-2">{q.items[0]?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-white">${q.total.toLocaleString()}</span>
                  <StatusBadge status={q.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
