import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { Quote } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { LayoutGrid, List } from 'lucide-react';

const DealerQuotes = () => {
  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [respondNotes, setRespondNotes] = useState('');
  const { user } = useAuth();
  const { state, actions } = useAppData();

  const dealerId = user?.id ?? '';
  const myQuotes = state.quotes.filter(q => q.toId === dealerId);

  const getCustomerForQuote = (q: Quote) => {
    return state.customers.find(c => c.id === q.fromId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Quote Management</h1>
          <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-border rounded-sm hover:bg-muted">
            {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
          </button>
        </div>

        {view === 'table' ? (
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <DataTable<Quote>
              columns={[
                { key: 'quoteNumber', label: 'Quote #', sortable: true, render: (q) => <span className="font-mono text-xs">{q.quoteNumber}</span> },
                { key: 'customer', label: 'Customer', render: (q) => <span className="text-xs">{getCustomerForQuote(q)?.name}</span> },
                { key: 'items', label: 'Trailer', render: (q) => <span className="text-xs">{q.items[0]?.name}</span> },
                { key: 'total', label: 'Total', sortable: true, render: (q) => <span className="font-mono text-xs font-medium">${q.total.toLocaleString()}</span> },
                { key: 'createdDate', label: 'Created', render: (q) => <span className="text-xs">{q.createdDate}</span> },
                { key: 'status', label: 'Status', render: (q) => <StatusBadge status={q.status} /> },
              ]}
              data={myQuotes}
              searchable
              onRowClick={(q) => setDetailQuote(q)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {myQuotes.map(q => {
              const customer = getCustomerForQuote(q);
              return (
                <div
                  key={q.id}
                  onClick={() => setDetailQuote(q)}
                  className="bg-card/60 border border-white/5 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-white">{q.quoteNumber}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  {q.status === 'Requested' && (
                    <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 mb-1">Needs Response</span>
                  )}
                  <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{q.items[0]?.name || 'Quote'}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{customer?.name}</p>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                    <div className="text-center">
                      <span className="font-display font-bold text-sm block text-white">${q.total.toLocaleString()}</span>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground">Total</span>
                    </div>
                    <div className="text-center">
                      <span className="font-display font-bold text-sm block text-white">{q.validUntil}</span>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground">Valid Until</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Created: {q.createdDate}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Quote Detail */}
        <Modal isOpen={!!detailQuote} onClose={() => { setDetailQuote(null); setRespondNotes(''); }} title={`Quote ${detailQuote?.quoteNumber || ''}`} wide>
          {detailQuote && (() => {
            const customer = getCustomerForQuote(detailQuote);
            return (
              <div className="space-y-4">
                {/* Incoming request banner */}
                {detailQuote.status === 'Requested' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
                    <p className="text-sm font-display font-bold text-blue-400 uppercase tracking-wide">Customer Quote Request</p>
                    <p className="text-xs text-muted-foreground mt-1">This customer is requesting a quote. Review and respond with your pricing.</p>
                  </div>
                )}

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
                      {customer?.name}
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

                {/* Actions based on status */}
                <div className="flex flex-col gap-3">
                  {/* Respond to customer request */}
                  {detailQuote.status === 'Requested' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground block">Response Notes (optional)</label>
                      <textarea
                        rows={2}
                        value={respondNotes}
                        onChange={e => setRespondNotes(e.target.value)}
                        className="w-full border border-border rounded-md p-2 text-sm bg-card"
                        placeholder="Add pricing details, availability, lead times..."
                      />
                      <button
                        onClick={() => {
                          if (!detailQuote) return;
                          actions.respondToQuoteRequest(detailQuote.id, respondNotes || undefined);
                          setDetailQuote(null);
                          setRespondNotes('');
                          toast.success('Quote sent to customer');
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide"
                      >
                        Respond with Quote
                      </button>
                    </div>
                  )}

                  {/* Actions for sent/viewed quotes */}
                  {(detailQuote.status === 'Sent' || detailQuote.status === 'Viewed') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!detailQuote) return;
                          actions.updateQuoteStatus(detailQuote.id, 'Sent');
                          setDetailQuote(null);
                          toast.success('Quote re-sent to customer');
                        }}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide"
                      >
                        Resend
                      </button>
                    </div>
                  )}

                  {/* Convert accepted quote to order */}
                  {detailQuote.status === 'Accepted' && (
                    <button
                      onClick={() => {
                        if (!detailQuote) return;
                        const order = actions.convertQuoteToOrder({ quoteId: detailQuote.id });
                        if (!order) {
                          toast.error('Could not convert quote to order.');
                          return;
                        }
                        setDetailQuote(null);
                        toast.success(`Converted to order ${order.orderNumber}`);
                      }}
                      className="px-4 py-2 bg-success text-white rounded-sm text-xs font-display uppercase tracking-wide w-fit"
                    >
                      Convert to Order
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>

        {/* No create quote modal — quotes are initiated by customers */}
      </div>
    </DashboardLayout>
  );
};

export default DealerQuotes;
