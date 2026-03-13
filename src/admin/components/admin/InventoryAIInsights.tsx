import { useMemo, useState } from "react";
import { useAdmin } from "@/admin/context/AdminContext";
import {
    getInventoryPredictions,
    getInventorySummary,
    StockPrediction
} from "@/admin/ai/inventoryPredictor";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/admin/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";
import {
    Package,
    AlertTriangle,
    Search,
    Brain,
    CheckCircle,
    XCircle,
    Calendar,
    Zap,
    Archive,
    RefreshCw,
    Bell,
    Factory,
    FileText,
    ClipboardList,
    ChevronDown,
    Eye,
    Send,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/admin/lib/utils";

interface InventoryAIInsightsProps {
    onClose?: () => void;
}

// Action definitions by severity
const SEVERITY_ACTIONS = {
    critical: {
        primary: { label: "Notify Warehouse", icon: Bell, action: "notify_warehouse" },
        secondary: [
            { label: "Trigger Production", icon: Factory, action: "trigger_production" },
            { label: "Create ERP Order", icon: FileText, action: "create_erp_order" },
        ]
    },
    warning: {
        primary: { label: "Schedule Reorder", icon: ClipboardList, action: "schedule_reorder" },
        secondary: [
            { label: "Notify Planning", icon: Bell, action: "notify_planning" },
        ]
    },
    healthy: {
        primary: { label: "Monitor Stock", icon: Eye, action: "monitor_stock" },
        secondary: []
    },
    "dead-stock": {
        primary: { label: "Review Stock", icon: Eye, action: "review_stock" },
        secondary: [
            { label: "Create Promotion", icon: FileText, action: "create_promotion" },
        ]
    }
} as const;

// Status configuration
const STATUS_CONFIG = {
    healthy: {
        label: "Normal",
        icon: CheckCircle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        buttonVariant: "outline" as const
    },
    warning: {
        label: "Warning",
        icon: AlertTriangle,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        buttonVariant: "outline" as const
    },
    critical: {
        label: "Critical",
        icon: XCircle,
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        buttonVariant: "destructive" as const
    },
    "dead-stock": {
        label: "Dead Stock",
        icon: Archive,
        color: "text-slate-400",
        bg: "bg-slate-500/10",
        border: "border-slate-500/20",
        buttonVariant: "outline" as const
    }
} as const;

interface ActionModalState {
    isOpen: boolean;
    action: string;
    product: StockPrediction | null;
}

export function InventoryAIInsights({ onClose }: InventoryAIInsightsProps) {
    const { products, orders } = useAdmin();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [actionModal, setActionModal] = useState<ActionModalState>({
        isOpen: false,
        action: "",
        product: null
    });
    const [actionSuccess, setActionSuccess] = useState(false);

    const predictions = useMemo(() =>
        getInventoryPredictions(products, orders),
        [products, orders]
    );

    const summary = useMemo(() =>
        getInventorySummary(predictions),
        [predictions]
    );

    const filteredPredictions = predictions.filter(pred => {
        const matchesSearch =
            pred.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pred.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || pred.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Generate action message
    const getActionMessage = (action: string, product: StockPrediction | null): { title: string; message: string } => {
        if (!product) return { title: "", message: "" };

        const messages: Record<string, { title: string; message: string }> = {
            notify_warehouse: {
                title: "Warehouse Notification",
                message: `URGENT: Stock Alert for ${product.productName} (${product.sku})\n\nCurrent Stock: ${product.currentStock} units\nSafe Level: ${product.safeStockLevel} units\nEstimated Depletion: ${product.daysUntilStockoutFormatted}\n\nAction Required: Immediate restocking needed. Recommended order quantity: ${product.reorderQuantity} units.`
            },
            trigger_production: {
                title: "Production Request",
                message: `Production Order Request\n\nProduct: ${product.productName}\nSKU: ${product.sku}\nQuantity Needed: ${product.reorderQuantity} units\nPriority: HIGH\nReason: Stock level critical (${product.currentStock}/${product.safeStockLevel})\n\nThis request will be sent to the production planning team.`
            },
            create_erp_order: {
                title: "ERP Purchase Order",
                message: `Purchase Order Draft\n\nVendor: [Primary Supplier]\nProduct: ${product.productName}\nSKU: ${product.sku}\nOrder Qty: ${product.reorderQuantity} units\nEstimated Cost: $${(product.reorderQuantity * 150).toLocaleString()}\n\nThis order will be created in the ERP system for approval.`
            },
            schedule_reorder: {
                title: "Reorder Scheduled",
                message: `Reorder Reminder Set\n\nProduct: ${product.productName}\nSKU: ${product.sku}\nReorder Date: ${new Date(Date.now() + product.recommendedReorderDays * 24 * 60 * 60 * 1000).toLocaleDateString()}\nQuantity: ${product.reorderQuantity} units\n\nYou will be notified when the reorder date approaches.`
            },
            notify_planning: {
                title: "Planning Team Notification",
                message: `Stock Planning Alert\n\nProduct: ${product.productName}\nSKU: ${product.sku}\nCurrent Stock: ${product.currentStock} units\nDaily Usage: ${product.avgDailyUsage} units/day\nDays Until Stockout: ${product.daysUntilStockout}\n\nPlease review production schedule and adjust accordingly.`
            },
            monitor_stock: {
                title: "Stock Monitoring Active",
                message: `Monitoring Enabled\n\nProduct: ${product.productName}\nSKU: ${product.sku}\nCurrent Status: Healthy\nStock Level: ${product.currentStock} units\n\nYou will receive alerts if stock falls below safe level (${product.safeStockLevel} units).`
            },
            review_stock: {
                title: "Stock Review Required",
                message: `Dead Stock Review\n\nProduct: ${product.productName}\nSKU: ${product.sku}\nCurrent Stock: ${product.currentStock} units\nEstimated Daily Usage: ${product.avgDailyUsage} units\n\nThis product shows minimal movement. Consider clearance pricing or promotional campaigns.`
            },
            create_promotion: {
                title: "Promotion Draft",
                message: `Promotional Campaign Draft\n\nProduct: ${product.productName}\nSKU: ${product.sku}\nCurrent Stock: ${product.currentStock} units\nSuggested Discount: 15-25%\n\nA promotional campaign will be drafted to accelerate stock movement.`
            }
        };

        return messages[action] || { title: "Action", message: "Action completed successfully." };
    };

    const handleAction = (action: string, product: StockPrediction) => {
        setActionModal({ isOpen: true, action, product });
        setActionSuccess(false);
    };

    const confirmAction = () => {
        setActionSuccess(true);
        setTimeout(() => {
            setActionModal({ isOpen: false, action: "", product: null });
            setActionSuccess(false);
        }, 2000);
    };

    const modalContent = getActionMessage(actionModal.action, actionModal.product);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/80 to-indigo-600/80 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Stock Decision Panel</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Zap className="h-3 w-3 text-violet-400" />
                            AI-Powered Inventory Actions
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md">
                    <RefreshCw className="h-3 w-3" />
                    Live Data
                </div>
            </div>

            {/* Summary Cards - Compact */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { key: 'critical', value: summary.criticalProducts, label: 'Critical', urgent: true },
                    { key: 'warning', value: summary.warningProducts, label: 'Warning', urgent: false },
                    { key: 'healthy', value: summary.healthyProducts, label: 'Normal', urgent: false },
                    { key: 'upcoming', value: summary.upcomingReorders, label: 'Upcoming Orders', urgent: false }
                ].map(item => {
                    const config = item.key === 'upcoming'
                        ? { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: Calendar }
                        : STATUS_CONFIG[item.key as keyof typeof STATUS_CONFIG];
                    const Icon = 'icon' in config ? config.icon : Calendar;

                    return (
                        <div
                            key={item.key}
                            className={cn(
                                "p-3 rounded-lg border transition-all",
                                config.bg,
                                config.border,
                                item.urgent && item.value > 0 && "ring-1 ring-red-500/30"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <Icon className={cn("h-4 w-4", config.color)} />
                                <span className={cn("text-2xl font-bold tabular-nums", config.color)}>
                                    {item.value}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 bg-muted/20"
                    />
                </div>
                <div className="flex gap-1.5">
                    {['all', 'critical', 'warning', 'healthy'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                                "h-8 px-3 text-xs",
                                statusFilter !== status && "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === 'all' ? 'All' : status === 'healthy' ? 'Normal' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Products List */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        Actionable Items
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {filteredPredictions.length} products
                    </p>
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                    {filteredPredictions.map((pred) => {
                        const config = STATUS_CONFIG[pred.status];
                        const StatusIcon = config.icon;
                        const actions = SEVERITY_ACTIONS[pred.status];
                        const PrimaryActionIcon = actions.primary.icon;

                        return (
                            <div
                                key={pred.productId}
                                className={cn(
                                    "p-4 rounded-lg border bg-card/30 transition-all",
                                    config.border,
                                    pred.status === 'critical' && "border-red-500/30 bg-red-500/5"
                                )}
                            >
                                <div className="flex items-center gap-6">
                                    {/* Left: Product Identity */}
                                    <div className="w-64 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full shrink-0",
                                                pred.status === 'healthy' && "bg-emerald-400",
                                                pred.status === 'warning' && "bg-amber-400",
                                                pred.status === 'critical' && "bg-red-400 animate-pulse",
                                                pred.status === 'dead-stock' && "bg-slate-400"
                                            )} />
                                            <h4 className="font-medium text-foreground truncate">
                                                {pred.productName}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground/70 mt-0.5 ml-4">
                                            {pred.sku} • {pred.category.split(' ')[0]}
                                        </p>
                                    </div>

                                    {/* Center: Metrics Grid */}
                                    <div className="flex-1 grid grid-cols-4 gap-6">
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Stock</p>
                                            <p className={cn(
                                                "text-xl font-bold tabular-nums",
                                                pred.currentStock === 0 ? "text-red-400" :
                                                    pred.currentStock < pred.safeStockLevel ? "text-amber-400" : "text-foreground"
                                            )}>
                                                {pred.currentStock}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Usage/Day</p>
                                            <p className="text-xl font-bold tabular-nums text-foreground">
                                                {pred.avgDailyUsage}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Days Left</p>
                                            <p className={cn(
                                                "text-xl font-bold tabular-nums",
                                                pred.daysUntilStockout <= 7 && "text-red-400",
                                                pred.daysUntilStockout > 7 && pred.daysUntilStockout <= 21 && "text-amber-400",
                                                pred.daysUntilStockout > 21 && "text-foreground"
                                            )}>
                                                {pred.daysUntilStockout === 0 ? "0" : pred.daysUntilStockout > 60 ? "60+" : pred.daysUntilStockout}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Safe Level</p>
                                            <p className="text-xl font-bold tabular-nums text-muted-foreground">
                                                {pred.safeStockLevel}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Status Badge + Actions */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Status Badge */}
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium",
                                            config.bg,
                                            config.color
                                        )}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {config.label}
                                        </div>

                                        {/* Primary Action */}
                                        <Button
                                            size="sm"
                                            variant={pred.status === 'critical' ? "destructive" : "outline"}
                                            className={cn(
                                                "h-8 gap-1.5 text-xs",
                                                pred.status === 'critical' && "bg-red-600 hover:bg-red-700"
                                            )}
                                            onClick={() => handleAction(actions.primary.action, pred)}
                                        >
                                            <PrimaryActionIcon className="h-3.5 w-3.5" />
                                            {actions.primary.label}
                                        </Button>

                                        {/* Secondary Actions Dropdown */}
                                        {actions.secondary.length > 0 && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    {actions.secondary.map((action) => {
                                                        const ActionIcon = action.icon;
                                                        return (
                                                            <DropdownMenuItem
                                                                key={action.action}
                                                                onClick={() => handleAction(action.action, pred)}
                                                                className="gap-2 cursor-pointer"
                                                            >
                                                                <ActionIcon className="h-4 w-4" />
                                                                {action.label}
                                                            </DropdownMenuItem>
                                                        );
                                                    })}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Modal */}
            <Dialog open={actionModal.isOpen} onOpenChange={(open) => !actionSuccess && setActionModal(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {actionSuccess ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    Action Completed
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5 text-primary" />
                                    {modalContent.title}
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {actionSuccess
                                ? "The action has been processed successfully."
                                : "Review the auto-generated message below before confirming."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {!actionSuccess && (
                        <div className="bg-muted/30 rounded-lg p-4 border border-border">
                            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                                {modalContent.message}
                            </pre>
                        </div>
                    )}

                    {actionSuccess ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <CheckCircle2 className="h-8 w-8" />
                                <span className="text-lg font-medium">Success!</span>
                            </div>
                        </div>
                    ) : (
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setActionModal({ isOpen: false, action: "", product: null })}
                            >
                                Cancel
                            </Button>
                            <Button onClick={confirmAction}>
                                <Send className="h-4 w-4 mr-2" />
                                Confirm & Send
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default InventoryAIInsights;
