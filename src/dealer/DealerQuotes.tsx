import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { quotes } from '@/data/quotes';
import { customers } from '@/data/customers';
import { trailers } from '@/data/trailers';
import { Quote } from '@/types';
import { toast } from 'sonner';

const dealerId = 'd1';
const myQuotes = quotes.filter(q => q.fromId === dealerId);

const DealerQuotes = () => {
  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Quote Management</h1>
          <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
            Create New Quote
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-industrial p-4">
          <DataTable
            columns={[
              { key: 'quoteNumber', label: 'Quote #', sortable: true, render: (q: any) => <span className="font-mono text-xs">{q.quoteNumber}</span> },
              { key: 'customer', label: 'Customer', render: (q: any) => <span className="text-xs">{customers.find(c => c.id === q.toId)?.name}</span> },
              { key: 'items', label: 'Trailer', render: (q: any) => <span className="text-xs">{q.items[0]?.name}</span> },
              { key: 'total', label: 'Total', sortable: true, render: (q: any) => <span className="font-mono text-xs font-medium">${q.total.toLocaleString()}</span> },
              { key: 'createdDate', label: 'Created', render: (q: any) => <span className="text-xs">{q.createdDate}</span> },
              { key: 'validUntil', label: 'Valid Until', render: (q: any) => <span className="text-xs">{q.validUntil}</span> },
              { key: 'status', label: 'Status', render: (q: any) => <StatusBadge status={q.status} /> },
            ]}
            data={myQuotes}
            searchable
            onRowClick={(q: any) => setDetailQuote(q)}
          />
        </div>

        {/* Quote Detail */}
        <Modal isOpen={!!detailQuote} onClose={() => setDetailQuote(null)} title={`Quote ${detailQuote?.quoteNumber || ''}`} wide>
          {detailQuote && (
            <div className="space-y-4">
              {/* Quote Document Style */}
              <div className="border border-border rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-display text-xl font-bold"><span className="text-foreground">B-B </span><span className="text-primary">TRAILERS</span></h2>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Behnke Enterprises, Inc.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold">{detailQuote.quoteNumber}</p>
                    <StatusBadge status={detailQuote.status} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">Customer</span>
                    {customers.find(c => c.id === detailQuote.toId)?.name}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">Valid Until</span>
                    {detailQuote.validUntil}
                  </div>
                </div>

                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-[10px] font-mono uppercase text-muted-foreground">Item</th>
                      <th className="text-right py-2 text-[10px] font-mono uppercase text-muted-foreground">Base</th>
                      <th className="text-right py-2 text-[10px] font-mono uppercase text-muted-foreground">Options</th>
                      <th className="text-right py-2 text-[10px] font-mono uppercase text-muted-foreground">Qty</th>
                      <th className="text-right py-2 text-[10px] font-mono uppercase text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailQuote.items.map((item, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="py-2">
                          <span className="font-mono text-xs">{item.modelNumber}</span> — {item.name}
                          {item.selectedOptions.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">+ {item.selectedOptions.map(o => o.name).join(', ')}</div>
                          )}
                        </td>
                        <td className="text-right font-mono">${item.basePrice.toLocaleString()}</td>
                        <td className="text-right font-mono">${item.optionsTotal.toLocaleString()}</td>
                        <td className="text-right font-mono">{item.quantity}</td>
                        <td className="text-right font-mono font-medium">${item.lineTotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-48 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">${detailQuote.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-mono">${detailQuote.tax.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold border-t border-border pt-1"><span>Total</span><span className="font-mono text-primary">${detailQuote.total.toLocaleString()}</span></div>
                  </div>
                </div>

                {detailQuote.notes && <p className="text-xs text-muted-foreground mt-4 italic">"{detailQuote.notes}"</p>}
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setDetailQuote(null); toast.success('Quote resent'); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">Resend</button>
                <button onClick={() => { setDetailQuote(null); toast.success('Converted to order'); }} className="px-3 py-1.5 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted">Convert to Order</button>
              </div>
            </div>
          )}
        </Modal>

        {/* Create Quote Modal (simplified) */}
        <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Quote" wide>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Customer</label>
              <select className="w-full border border-border rounded-md p-2 text-sm bg-card">
                {customers.filter(c => c.assignedDealerId === dealerId).map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Trailer</label>
              <select className="w-full border border-border rounded-md p-2 text-sm bg-card">
                {trailers.map(t => <option key={t.id} value={t.id}>{t.modelNumber} — {t.name} — ${t.price.toLocaleString()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">Notes</label>
              <textarea rows={3} className="w-full border border-border rounded-md p-2 text-sm bg-card" />
            </div>
            <button onClick={() => { setCreateOpen(false); toast.success('Quote created'); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">
              Send to Customer
            </button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default DealerQuotes;
