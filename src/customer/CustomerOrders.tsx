import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Modal } from '@/components/shared/Modal';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { Order } from '@/types';
import { cn } from '@/lib/utils';
import { Package, Truck, CheckCircle2, Clock, Factory, ClipboardCheck, FileText, ArrowRight } from 'lucide-react';

const PIPELINE_STAGES: { status: Order['status']; label: string; icon: React.ElementType }[] = [
    { status: 'Submitted', label: 'Submitted', icon: FileText },
    { status: 'Under Review', label: 'Under Review', icon: ClipboardCheck },
    { status: 'Approved', label: 'Approved', icon: CheckCircle2 },
    { status: 'In Production', label: 'In Production', icon: Factory },
    { status: 'Shipped', label: 'Shipped', icon: Truck },
    { status: 'Delivered', label: 'Delivered', icon: Package },
];

const statusStepIndex = (status: Order['status']): number => {
    const idx = PIPELINE_STAGES.findIndex(s => s.status === status);
    return idx === -1 ? -1 : idx;
};

const CustomerOrders = () => {
    const { user } = useAuth();
    const { state } = useAppData();
    const [detail, setDetail] = useState<Order | null>(null);

    const customerId = user?.id ?? '';

    // Orders where the customer is either the sender or linked via customerId
    const myOrders = state.orders.filter(
        o => o.fromId === customerId || o.customerId === customerId
    );

    const activeOrders = myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
    const completedOrders = myOrders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="font-display text-2xl font-bold uppercase tracking-wide">My Orders</h1>

                {/* Active Orders — visual tracker */}
                {activeOrders.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Active Orders</h2>
                        {activeOrders.map(order => {
                            const currentStep = statusStepIndex(order.status);
                            return (
                                <div
                                    key={order.id}
                                    className="bg-card border border-white/5 rounded-lg shadow-industrial p-5 cursor-pointer hover:border-primary/30 transition-all"
                                    onClick={() => setDetail(order)}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <span className="font-mono text-xs text-muted-foreground">{order.orderNumber}</span>
                                            <h3 className="font-display font-bold uppercase tracking-wide text-sm text-white">
                                                {order.trailerName || order.modelNumber || 'Custom Order'}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-sm font-bold text-white">${order.totalPrice.toLocaleString()}</span>
                                            {order.estimatedDelivery && (
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Est. delivery: {order.estimatedDelivery}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pipeline tracker */}
                                    <div className="flex items-center gap-1">
                                        {PIPELINE_STAGES.map((stage, i) => {
                                            const isCompleted = i < currentStep;
                                            const isCurrent = i === currentStep;
                                            const Icon = stage.icon;
                                            return (
                                                <div key={stage.status} className="flex items-center flex-1 last:flex-initial">
                                                    <div className="flex flex-col items-center flex-1 min-w-0">
                                                        <div className={cn(
                                                            'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                                                            isCompleted ? 'bg-success/20 border-success text-success' :
                                                                isCurrent ? 'bg-primary/20 border-primary text-primary animate-pulse' :
                                                                    'bg-muted/30 border-white/10 text-muted-foreground'
                                                        )}>
                                                            <Icon size={14} />
                                                        </div>
                                                        <span className={cn(
                                                            'text-[8px] font-mono uppercase tracking-widest mt-1 text-center',
                                                            isCompleted ? 'text-success' : isCurrent ? 'text-primary' : 'text-muted-foreground/50'
                                                        )}>
                                                            {stage.label}
                                                        </span>
                                                    </div>
                                                    {i < PIPELINE_STAGES.length - 1 && (
                                                        <div className={cn(
                                                            'h-0.5 w-full mx-1 mt-[-14px]',
                                                            isCompleted ? 'bg-success/40' : 'bg-white/5'
                                                        )} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeOrders.length === 0 && (
                    <div className="bg-card border border-white/5 rounded-lg shadow-industrial p-8 text-center">
                        <Clock size={32} className="mx-auto text-muted-foreground mb-3" />
                        <p className="font-display uppercase tracking-wide text-xs text-muted-foreground">No active orders</p>
                        <p className="text-sm text-muted-foreground mt-1">Your accepted quotes will appear here once they're being processed.</p>
                    </div>
                )}

                {/* Completed Orders */}
                {completedOrders.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Order History</h2>
                        <div className="bg-card rounded-lg shadow-industrial p-4">
                            <DataTable<Order>
                                columns={[
                                    { key: 'orderNumber', label: 'Order #', sortable: true, render: (o) => <span className="font-mono text-xs">{o.orderNumber}</span> },
                                    { key: 'trailerName', label: 'Trailer', render: (o) => <span className="text-xs">{o.trailerName || o.modelNumber || '—'}</span> },
                                    { key: 'quantity', label: 'Qty', render: (o) => <span className="font-mono text-xs">{o.quantity}</span> },
                                    { key: 'totalPrice', label: 'Total', sortable: true, render: (o) => <span className="font-mono text-xs font-medium">${o.totalPrice.toLocaleString()}</span> },
                                    { key: 'status', label: 'Status', render: (o) => <StatusBadge status={o.status} /> },
                                    { key: 'createdDate', label: 'Date', sortable: true, render: (o) => <span className="text-xs">{o.createdDate}</span> },
                                ]}
                                data={completedOrders}
                                searchable
                                onRowClick={(o) => setDetail(o)}
                            />
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Order ${detail?.orderNumber || ''}`} wide>
                    {detail && (
                        <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="font-display text-xl font-bold">
                                            <span className="text-foreground">B-B </span>
                                            <span className="text-primary">TRAILERS</span>
                                        </h2>
                                        <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Behnke Enterprises, Inc.</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm font-bold">{detail.orderNumber}</p>
                                        <StatusBadge status={detail.status} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Trailer</span>
                                        <p className="text-sm font-medium">{detail.trailerName || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Model</span>
                                        <p className="text-sm font-mono">{detail.modelNumber || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Quantity</span>
                                        <p className="text-sm font-mono">{detail.quantity}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Total Price</span>
                                        <p className="text-sm font-mono font-bold text-primary">${detail.totalPrice.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-4">
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Order Date</span>
                                        <p className="text-sm">{detail.createdDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">Last Updated</span>
                                        <p className="text-sm">{detail.updatedDate}</p>
                                    </div>
                                    {detail.estimatedDelivery && (
                                        <div>
                                            <span className="text-[10px] font-mono uppercase text-muted-foreground block">Est. Delivery</span>
                                            <p className="text-sm">{detail.estimatedDelivery}</p>
                                        </div>
                                    )}
                                </div>

                                {detail.notes && (
                                    <p className="text-xs text-muted-foreground mt-4 italic border-t border-border pt-3">"{detail.notes}"</p>
                                )}
                            </div>

                            {/* Timeline tracker */}
                            <div className="border border-border rounded-lg p-4">
                                <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Order Timeline</h3>
                                <div className="space-y-3">
                                    {PIPELINE_STAGES.map((stage, i) => {
                                        const currentStep = statusStepIndex(detail.status);
                                        const isCompleted = i < currentStep;
                                        const isCurrent = i === currentStep;
                                        const Icon = stage.icon;
                                        return (
                                            <div key={stage.status} className="flex items-center gap-3">
                                                <div className={cn(
                                                    'w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0',
                                                    isCompleted ? 'bg-success/20 border-success text-success' :
                                                        isCurrent ? 'bg-primary/20 border-primary text-primary' :
                                                            'bg-muted/20 border-white/10 text-muted-foreground/40'
                                                )}>
                                                    <Icon size={13} />
                                                </div>
                                                <div className="flex-1">
                                                    <span className={cn(
                                                        'text-xs font-display uppercase tracking-wide',
                                                        isCompleted ? 'text-success' : isCurrent ? 'text-primary font-bold' : 'text-muted-foreground/40'
                                                    )}>
                                                        {stage.label}
                                                    </span>
                                                </div>
                                                {isCompleted && <CheckCircle2 size={14} className="text-success" />}
                                                {isCurrent && <ArrowRight size={14} className="text-primary animate-pulse" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default CustomerOrders;
