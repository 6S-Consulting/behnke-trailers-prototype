import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { orders } from '@/data/orders';
import { trailers } from '@/data/trailers';
import { customers } from '@/data/customers';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const dealerId = 'd1';

const DealerOrders = () => {
  const [tab, setTab] = useState<'behnke' | 'customer'>('behnke');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);

  const myOrders = orders.filter(o => o.fromId === dealerId && o.fromType === 'Dealer');
  const custOrders = orders.filter(o => o.toId === dealerId && o.toType === 'Dealer');

  const statusSteps = ['Draft', 'Submitted', 'Under Review', 'Approved', 'In Production', 'Shipped', 'Delivered'];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Order Management</h1>
          <button onClick={() => { setWizardOpen(true); setWizardStep(1); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
            New Order to Behnke
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTab('behnke')} className={cn('px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide', tab === 'behnke' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
            My Orders to Behnke
          </button>
          <button onClick={() => setTab('customer')} className={cn('px-3 py-1.5 rounded-sm text-xs font-display uppercase tracking-wide', tab === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
            Customer Orders to Me
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-industrial p-4">
          <DataTable
            columns={[
              { key: 'orderNumber', label: 'Order #', sortable: true, render: (o: any) => <span className="font-mono text-xs">{o.orderNumber}</span> },
              { key: 'trailerName', label: 'Trailer', render: (o: any) => <span className="text-xs">{o.trailerName}</span> },
              { key: 'type', label: 'Type', render: (o: any) => <StatusBadge status={o.type} /> },
              { key: 'quantity', label: 'Qty', render: (o: any) => <span className="font-mono text-xs">{o.quantity}</span> },
              { key: 'totalPrice', label: 'Total', sortable: true, render: (o: any) => <span className="font-mono text-xs">${o.totalPrice.toLocaleString()}</span> },
              { key: 'status', label: 'Status', render: (o: any) => <StatusBadge status={o.status} /> },
              { key: 'createdDate', label: 'Date', render: (o: any) => <span className="text-xs">{o.createdDate}</span> },
            ]}
            data={tab === 'behnke' ? myOrders : custOrders}
            searchable
          />
        </div>

        {/* Order Wizard */}
        <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title="New Order to Behnke" wide>
          <div className="space-y-4">
            {/* Steps indicator */}
            <div className="flex gap-6 mb-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={cn('flex items-center gap-2', wizardStep >= s ? 'text-primary' : 'text-muted-foreground')}>
                  <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold', wizardStep >= s ? 'border-primary' : 'border-border')}>
                    {s}
                  </div>
                  <span className="font-display uppercase text-xs tracking-widest">
                    {s === 1 ? 'Select Trailer' : s === 2 ? 'Customize' : 'Review'}
                  </span>
                </div>
              ))}
            </div>

            {wizardStep === 1 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Select a trailer from the catalog:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {trailers.slice(0, 8).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTrailer(t.id)}
                      className={cn('text-left p-3 rounded-md border transition-colors', selectedTrailer === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                    >
                      <span className="font-mono text-xs text-muted-foreground">{t.modelNumber}</span>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="font-mono text-xs text-primary mt-1">${t.price.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => setWizardStep(2)} disabled={!selectedTrailer} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide disabled:opacity-50">
                  Next →
                </button>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Customize your order:</p>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Quantity</label>
                  <input type="number" defaultValue={1} min={1} className="w-20 border border-border rounded-md p-2 text-sm bg-card" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Notes</label>
                  <textarea rows={3} className="w-full border border-border rounded-md p-2 text-sm bg-card" placeholder="Special requirements..." />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setWizardStep(1)} className="px-4 py-2 border border-border rounded-sm text-xs font-display uppercase tracking-wide">← Back</button>
                  <button onClick={() => setWizardStep(3)} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">Next →</button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Order Summary</p>
                {selectedTrailer && (() => {
                  const t = trailers.find(tr => tr.id === selectedTrailer);
                  return t ? (
                    <div className="bg-muted/30 rounded-md p-3">
                      <p className="font-mono text-xs">{t.modelNumber}</p>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="font-display text-lg font-bold mt-2">${t.price.toLocaleString()}</p>
                    </div>
                  ) : null;
                })()}
                <div className="flex gap-2">
                  <button onClick={() => setWizardStep(2)} className="px-4 py-2 border border-border rounded-sm text-xs font-display uppercase tracking-wide">← Back</button>
                  <button onClick={() => { setWizardOpen(false); toast.success('Order submitted to Behnke!'); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">Submit Order</button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default DealerOrders;
