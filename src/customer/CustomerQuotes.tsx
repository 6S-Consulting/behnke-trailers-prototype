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

const CustomerQuotes = () => {
  const [detail, setDetail] = useState<Quote | null>(null);
  const [modOpen, setModOpen] = useState(false);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const { user } = useAuth();
  const { state, actions } = useAppData();

  const myQuotes = state.quotes.filter(q => q.toId === (user?.id ?? ''));

  const handleAccept = (q: Quote) => {
    const updated = actions.updateQuoteStatus(q.id, 'Accepted');
    if (!updated) {
      toast.error('Could not accept quote');
      return;
    }
    setDetail(null);
    toast.success('Quote accepted! Your dealer will be in touch to finalize your order.');
  };

  const handleReject = (q: Quote) => {
    const updated = actions.updateQuoteStatus(q.id, 'Rejected');
    if (!updated) {
      toast.error('Could not reject quote');
      return;
    }
    setDetail(null);
    toast.info('Quote rejected.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">My Quotes</h1>
          <button onClick={() => setView(view === 'table' ? 'grid' : 'table')} className="p-1.5 border border-border rounded-sm hover:bg-muted">
            {view === 'table' ? <LayoutGrid size={14} /> : <List size={14} />}
          </button>
        </div>

        {view === 'table' ? (
          <div className="bg-card rounded-lg shadow-industrial p-4">
            <DataTable<Quote>
              columns={[
                { key: 'quoteNumber', label: 'Quote #', sortable: true, render: (q) => <span className="font-mono text-xs">{q.quoteNumber}</span> },
                { key: 'trailer', label: 'Trailer', render: (q) => <span className="text-xs">{q.items[0]?.name}</span> },
                { key: 'createdDate', label: 'Created', render: (q) => <span className="text-xs">{q.createdDate}</span> },
                { key: 'validUntil', label: 'Valid Until', render: (q) => <span className="text-xs">{q.validUntil}</span> },
                { key: 'total', label: 'Total', sortable: true, render: (q) => <span className="font-mono text-xs font-medium">${q.total.toLocaleString()}</span> },
                { key: 'status', label: 'Status', render: (q) => <StatusBadge status={q.status} /> },
                {
                  key: 'actions', label: '', render: (q) => (
                    <button onClick={(e) => { e.stopPropagation(); setDetail(q); }} className="text-xs text-primary hover:underline font-display uppercase tracking-wide">View</button>
                  )
                },
              ]}
              data={myQuotes}
              onRowClick={(q) => setDetail(q)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {myQuotes.map(q => {
              const dealer = state.dealers.find(d => d.id === q.fromId);
              return (
                <div
                  key={q.id}
                  onClick={() => setDetail(q)}
                  className="bg-card/60 border border-white/5 rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-white">{q.quoteNumber}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white group-hover:text-primary transition-colors">{q.items[0]?.name || 'Quote'}</h3>
                  <p className="text-xs text-muted-foreground mb-3">From: {dealer?.name}</p>
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

        <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Quote ${detail?.quoteNumber || ''}`} wide>
          {detail && (
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold"><span>B-B </span><span className="text-primary">TRAILERS</span></h2>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Behnke Enterprises, Inc.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold">{detail.quoteNumber}</p>
                    <StatusBadge status={detail.status} />
                  </div>
                </div>
                <div className="mb-4 text-sm">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground block">From</span>
                  {state.dealers.find(d => d.id === detail.fromId)?.name}
                </div>
                <table className="w-full text-sm mb-4">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 text-[10px] font-mono uppercase text-muted-foreground">Item</th>
                    <th className="text-right py-2 text-[10px] font-mono uppercase text-muted-foreground">Qty</th>
                    <th className="text-right py-2 text-[10px] font-mono uppercase text-muted-foreground">Total</th>
                  </tr></thead>
                  <tbody>
                    {detail.items.map((item, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="py-2"><span className="font-mono text-xs">{item.modelNumber}</span> — {item.name}
                          {item.selectedOptions.length > 0 && <div className="text-xs text-muted-foreground">+ {item.selectedOptions.map(o => o.name).join(', ')}</div>}
                        </td>
                        <td className="text-right font-mono">{item.quantity}</td>
                        <td className="text-right font-mono">${item.lineTotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end">
                  <div className="w-48 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">${detail.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-mono">${detail.tax.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold border-t border-border pt-1"><span>Total</span><span className="font-mono text-primary">${detail.total.toLocaleString()}</span></div>
                  </div>
                </div>
                {detail.notes && <p className="text-xs text-muted-foreground mt-4 italic">"{detail.notes}"</p>}
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleAccept(detail)} className="px-4 py-2 bg-success text-success-foreground rounded-sm text-xs font-display uppercase tracking-wide">✅ Accept Quote</button>
                <button onClick={() => handleReject(detail)} className="px-4 py-2 bg-danger text-danger-foreground rounded-sm text-xs font-display uppercase tracking-wide">❌ Reject Quote</button>
                <button onClick={() => { setDetail(null); setModOpen(true); }} className="px-4 py-2 border border-border rounded-sm text-xs font-display uppercase tracking-wide hover:bg-muted">💬 Request Changes</button>
              </div>
            </div>
          )}
        </Modal>

        <Modal isOpen={modOpen} onClose={() => setModOpen(false)} title="Request Modifications">
          <div className="space-y-3">
            <textarea rows={4} placeholder="Describe the changes you'd like..." className="w-full border border-border rounded-md p-2 text-sm bg-card" />
            <button onClick={() => { setModOpen(false); toast.success('Modification request sent to dealer'); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide">Send Request</button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default CustomerQuotes;
