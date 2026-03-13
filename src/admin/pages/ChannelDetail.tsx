import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { KPICard } from "@/admin/components/admin/KPICard";
import { Button } from "@/admin/components/ui/button";
import { useMultiChannel } from "@/admin/context/MultiChannelContext";
import {
    Globe,
    ShoppingBag,
    Store,
    ShoppingCart,
    Warehouse as WarehouseIcon,
    Package,
    ChevronLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    RefreshCw,
    Wifi,
    Activity,
} from "lucide-react";
import { cn } from "@/admin/lib/utils";

// ─── Helper Functions ───────────────────────────────────────
function getChannelIcon(channelName: string) {
    const name = channelName.toLowerCase();
    if (name.includes("website")) return Globe;
    if (name.includes("amazon")) return ShoppingBag;
    if (name.includes("flipkart")) return Store;
    if (name.includes("ebay")) return ShoppingCart;
    if (name.includes("pos") || name.includes("warehouse")) return WarehouseIcon;
    return Package;
}

function formatChannelName(name: string): string {
    return name
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// ─── Mock Data ──────────────────────────────────────────────
function getChannelData(channelName: string) {
    const channelDisplayName = formatChannelName(channelName);

    return {
        name: channelDisplayName,
        status: "connected" as const,
        lastSync: "2 minutes ago",
        ordersToday: 41,
        productsSynced: 245,
        billedAmount: 6150,
        syncAccuracy: 96,
        region: "India",
        apiStatus: "Active",
        syncMode: "Real-time",
        lastWebhook: "2 minutes ago",

        topProducts: [
            { product: "Hydraulic Pump X1", sku: "HYD-PMP-X1", unitsSold: 12, stock: 24 },
            { product: "Valve Kit V2", sku: "VLV-KIT-V2", unitsSold: 6, stock: 18 },
            { product: "Motor Pack M4", sku: "MTR-M4", unitsSold: 3, stock: 10 },
            { product: "Bearing Set B5", sku: "BRG-B5", unitsSold: 8, stock: 32 },
            { product: "Seal Kit S3", sku: "SL-KIT-S3", unitsSold: 5, stock: 15 },
        ],

        recentOrders: [
            { orderId: "AMZ-2041", product: "Hydraulic Pump X1", quantity: 2, status: "Shipped", date: "Feb 23" },
            { orderId: "AMZ-2042", product: "Valve Kit V2", quantity: 1, status: "Pending", date: "Feb 23" },
            { orderId: "AMZ-2043", product: "Motor Pack M4", quantity: 3, status: "Processing", date: "Feb 22" },
            { orderId: "AMZ-2044", product: "Bearing Set B5", quantity: 1, status: "Shipped", date: "Feb 22" },
            { orderId: "AMZ-2045", product: "Seal Kit S3", quantity: 2, status: "Delivered", date: "Feb 21" },
        ],

        inventorySync: [
            { sku: "HYD-PMP-X1", productName: "Pump X1", localStock: 24, channelStock: 22, status: "Synced" },
            { sku: "VLV-KIT-V2", productName: "Valve Kit V2", localStock: 18, channelStock: 18, status: "Synced" },
            { sku: "MTR-M4", productName: "Motor Pack M4", localStock: 10, channelStock: 10, status: "Synced" },
            { sku: "BRG-B5", productName: "Bearing Set B5", localStock: 32, channelStock: 30, status: "Pending" },
            { sku: "SL-KIT-S3", productName: "Seal Kit S3", localStock: 15, channelStock: 15, status: "Synced" },
        ],

        activityLogs: [
            { time: "09:14:22", level: "INFO", message: "Sync initiated" },
            { time: "09:14:25", level: "OK", message: "Retrieved 41 new orders" },
            { time: "09:14:26", level: "OK", message: "Stock updated for 63 SKUs" },
            { time: "09:14:27", level: "WARN", message: "Stock mismatch detected" },
            { time: "09:14:30", level: "OK", message: "Sync completed" },
            { time: "09:12:15", level: "INFO", message: "Webhook received: order.created" },
            { time: "09:10:42", level: "OK", message: "Price update completed for 12 products" },
            { time: "09:08:33", level: "INFO", message: "Inventory check initiated" },
        ],
    };
}

// ─── Status Badge ──────────────────────────────────────────
function StatusBadge({ status }: { status: "connected" | "syncing" | "error" }) {
    const config = {
        connected: { label: "Connected", className: "bg-green-500/15 text-green-500", icon: CheckCircle2 },
        syncing: { label: "Syncing", className: "bg-yellow-500/15 text-yellow-500", icon: RefreshCw },
        error: { label: "Error", className: "bg-red-500/15 text-red-500", icon: AlertCircle },
    };
    const c = config[status];
    return (
        <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium", c.className)}>
            <c.icon className={cn("h-3 w-3", status === "syncing" && "animate-spin")} />
            {c.label}
        </span>
    );
}

// ─── Main Component ─────────────────────────────────────────
export default function ChannelDetail() {
    const { channelName } = useParams<{ channelName: string }>();
    const navigate = useNavigate();
    const { channels } = useMultiChannel();

    if (!channelName) {
        navigate("/admin/multi-channel");
        return null;
    }

    const channel = channels.find(ch => ch.id === channelName);
    const data = getChannelData(channelName);
    const ChannelIcon = getChannelIcon(channelName);

    return (
        <AdminLayout
            title={`${data.name} Channel Dashboard`}
            subtitle="Detailed synchronization and sales information for this channel"
        >
            {/* Back Button */}
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => navigate("/admin/multi-channel")}
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Multi-Channel Dashboard
                </Button>
            </div>

            {/* Section 1: Channel Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="kpi-card">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Channel Status</p>
                            <div className="mt-2">
                                <StatusBadge status={data.status} />
                            </div>
                        </div>
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden",
                            channel?.logo ? "bg-white" : "bg-muted text-primary"
                        )}>
                            {channel?.logo ? (
                                <img src={channel.logo} alt={data.name} className="h-8 w-8 object-contain" />
                            ) : (
                                <ChannelIcon className="h-5 w-5" />
                            )}
                        </div>
                    </div>
                </div>
                <KPICard
                    title="Last Sync Time"
                    value={data.lastSync}
                    icon={Clock}
                />
                <KPICard
                    title="Orders Today"
                    value={data.ordersToday}
                    icon={ShoppingCart}
                    change="+12%"
                    changeType="positive"
                />
                <KPICard
                    title="Products Synced"
                    value={data.productsSynced}
                    icon={Package}
                />
            </div>

            {/* Section 2: Top Selling Products */}
            <div className="kpi-card mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Top Selling Products</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Product</th>
                                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">SKU</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Units Sold Today</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Available Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topProducts.map((item, idx) => (
                                <tr key={idx} className="border-b border-border/50 last:border-0">
                                    <td className="py-3 px-3 text-sm text-foreground">{item.product}</td>
                                    <td className="py-3 px-3 text-sm text-muted-foreground">{item.sku}</td>
                                    <td className="py-3 px-3 text-sm text-right font-medium text-foreground">{item.unitsSold}</td>
                                    <td className="py-3 px-3 text-sm text-right text-foreground">{item.stock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 3: Recent Orders */}
            <div className="kpi-card mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Recent Orders from this Channel</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Order ID</th>
                                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Product</th>
                                <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Quantity</th>
                                <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Order Status</th>
                                <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentOrders.map((order, idx) => (
                                <tr key={idx} className="border-b border-border/50 last:border-0">
                                    <td className="py-3 px-3 text-sm font-medium text-foreground">{order.orderId}</td>
                                    <td className="py-3 px-3 text-sm text-foreground">{order.product}</td>
                                    <td className="py-3 px-3 text-sm text-center text-foreground">{order.quantity}</td>
                                    <td className="py-3 px-3 text-center">
                                        <span className={cn(
                                            "inline-block rounded-sm px-2 py-0.5 text-xs font-medium",
                                            order.status === "Shipped" && "bg-blue-500/15 text-blue-500",
                                            order.status === "Delivered" && "bg-green-500/15 text-green-500",
                                            order.status === "Processing" && "bg-yellow-500/15 text-yellow-500",
                                            order.status === "Pending" && "bg-orange-500/15 text-orange-500"
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-sm text-right text-muted-foreground">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 4: Inventory Sync Status */}
            <div className="kpi-card mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Inventory Sync Status</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">SKU</th>
                                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Product Name</th>
                                <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Local Stock</th>
                                <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Channel Stock</th>
                                <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.inventorySync.map((item, idx) => (
                                <tr key={idx} className="border-b border-border/50 last:border-0">
                                    <td className="py-3 px-3 text-sm font-medium text-foreground">{item.sku}</td>
                                    <td className="py-3 px-3 text-sm text-foreground">{item.productName}</td>
                                    <td className="py-3 px-3 text-sm text-center text-foreground">{item.localStock}</td>
                                    <td className="py-3 px-3 text-sm text-center text-foreground">{item.channelStock}</td>
                                    <td className="py-3 px-3 text-center">
                                        <span className={cn(
                                            "inline-block rounded-sm px-2 py-0.5 text-xs font-medium",
                                            item.status === "Synced" && "bg-green-500/15 text-green-500",
                                            item.status === "Pending" && "bg-yellow-500/15 text-yellow-500",
                                            item.status === "Error" && "bg-red-500/15 text-red-500"
                                        )}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 5 & 6: Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Section 5: Channel Activity Logs */}
                <div className="kpi-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Channel Activity Logs</h3>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {data.activityLogs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-sm border-l-2 pl-3 py-1"
                                style={{
                                    borderColor: log.level === "OK" ? "rgb(34 197 94)" :
                                        log.level === "WARN" ? "rgb(234 179 8)" :
                                            log.level === "INFO" ? "rgb(59 130 246)" : "rgb(156 163 175)"
                                }}>
                                <span className="text-xs text-muted-foreground font-mono min-w-[60px]">{log.time}</span>
                                <span className={cn(
                                    "text-xs font-medium min-w-[40px]",
                                    log.level === "OK" && "text-green-500",
                                    log.level === "WARN" && "text-yellow-500",
                                    log.level === "INFO" && "text-blue-500",
                                    log.level === "ERROR" && "text-red-500"
                                )}>
                                    {log.level}
                                </span>
                                <span className="text-foreground flex-1">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 6: Channel Settings */}
                <div className="kpi-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Wifi className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Channel Settings</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Channel Name</span>
                            <span className="text-sm font-medium text-foreground">{data.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Region</span>
                            <span className="text-sm font-medium text-foreground">{data.region}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">API Status</span>
                            <span className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium bg-green-500/15 text-green-500">
                                <CheckCircle2 className="h-3 w-3" />
                                {data.apiStatus}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Sync Mode</span>
                            <span className="text-sm font-medium text-foreground">{data.syncMode}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-muted-foreground">Last Webhook Event</span>
                            <span className="text-sm font-medium text-foreground">{data.lastWebhook}</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
