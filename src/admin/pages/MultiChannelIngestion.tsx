import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { KPICard } from "@/admin/components/admin/KPICard";
import { Button } from "@/admin/components/ui/button";
import { Switch } from "@/admin/components/ui/switch";
import { Progress } from "@/admin/components/ui/progress";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/admin/components/ui/dialog";
import { cn } from "@/admin/lib/utils";
import { toast } from "@/admin/hooks/use-toast";
import {
  Package,
  Radio,
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  Plus,
  Globe,
  ShoppingBag,
  Store,
  Warehouse as WarehouseIcon,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Zap,
  Timer,
  PackageCheck,
  Activity,
  Loader2,
  ChevronLeft,
  ArrowRight,
  Shield,
  Settings2,
  Key,
  Plug,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  type Channel,
  type ConflictEntry,
  conflictData,
  orderFlowData,
  dummyLogEntries,
} from "@/data/multiChannelData";
import { useMultiChannel } from "@/admin/context/MultiChannelContext";

// Import platform logos
import shopifyLogo from "@/assets/images/channellogo/shopify.png";
import woocomLogo from "@/assets/images/channellogo/woocom.png";
import meeshoLogo from "@/assets/images/channellogo/meesho.png";
import indiamartLogo from "@/assets/images/channellogo/indiamart.jpg";

// ─── Channel Icon Helper ───────────────────────────────────────
function ChannelIcon({ channelId, className }: { channelId: string; className?: string }) {
  const base = cn("h-5 w-5", className);
  const id = channelId.toLowerCase();
  if (id === "website") return <Globe className={base} />;
  if (id === "amazon") return <ShoppingBag className={base} />;
  if (id === "flipkart") return <Store className={base} />;
  if (id === "ebay") return <ShoppingCart className={base} />;
  if (id === "pos") return <WarehouseIcon className={base} />;
  if (id.includes("shopify")) return <Store className={base} />;
  if (id.includes("woocommerce")) return <Globe className={base} />;
  if (id.includes("meesho")) return <ShoppingBag className={base} />;
  if (id.includes("indiamart")) return <Package className={base} />;
  return <Package className={base} />;
}

// ─── Status Badge ──────────────────────────────────────────────
function ChannelStatusBadge({ status }: { status: Channel["status"] }) {
  const config = {
    connected: { label: "Connected", className: "bg-green-500/15 text-green-500", icon: CheckCircle2 },
    syncing: { label: "Syncing", className: "bg-yellow-500/15 text-yellow-500", icon: RefreshCw },
    error: { label: "Error", className: "bg-red-500/15 text-red-500", icon: XCircle },
    disabled: { label: "Disabled", className: "bg-muted text-muted-foreground", icon: Minus },
  };
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium", c.className)}>
      <c.icon className={cn("h-3 w-3", status === "syncing" && "animate-spin")} />
      {c.label}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function MultiChannelIngestion() {
  const navigate = useNavigate();
  // Shared context state
  const { channels, setChannels, syncLogs, setSyncLogs, addChannelAndAutoUpgrade } = useMultiChannel();
  // Tab filter
  const [activeTab, setActiveTab] = useState("All");
  // Modals
  const [logsModal, setLogsModal] = useState<{ open: boolean; channel: string }>({ open: false, channel: "" });
  const [addChannelModal, setAddChannelModal] = useState(false);
  // Add Channel multi-step state
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformOption | null>(null);
  const [channelForm, setChannelForm] = useState({
    channelName: "",
    storeUrl: "",
    region: "",
    currency: "",
    apiKey: "",
    apiSecret: "",
    environment: "production",
    syncMode: "realtime",
    importOrders: true,
    syncInventory: true,
    autoPriceUpdate: false,
    enableAutoReorder: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [testState, setTestState] = useState<"idle" | "testing" | "success">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  // Sync animation
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  // Reorder animation
  const [isReordering, setIsReordering] = useState(false);
  // Conflicts
  const [conflicts, setConflicts] = useState<ConflictEntry[]>(conflictData);

  const feedRef = useRef<HTMLDivElement>(null);

  // ─── Sync All Channels ──────────────────────────────────────
  const handleSyncAll = useCallback(() => {
    setIsSyncing(true);
    setSyncProgress(0);
    // Animate progress
    const steps = 20;
    let step = 0;
    const iv = setInterval(() => {
      step += 1;
      setSyncProgress(Math.min((step / steps) * 100, 100));
      if (step >= steps) {
        clearInterval(iv);
        setIsSyncing(false);
        setSyncProgress(0);
        setChannels((prev) =>
          prev.map((ch) => (ch.enabled ? { ...ch, lastSync: "Just now", status: "connected" as const } : ch))
        );
        toast({ title: "Sync Complete", description: "All channels synchronized successfully." });
      }
    }, 120);
  }, []);

  // ─── Toggle channel enable/disable ──────────────────────────
  const toggleChannel = useCallback((id: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === id
          ? { ...ch, enabled: !ch.enabled, status: ch.enabled ? ("disabled" as const) : ("connected" as const) }
          : ch
      )
    );
  }, []);

  // ─── Simulate Reorder ──────────────────────────────────────
  const handleReorder = useCallback(() => {
    setIsReordering(true);
    setTimeout(() => {
      setIsReordering(false);
      toast({ title: "Reorder Triggered", description: "6 auto-reorders have been submitted to suppliers." });
    }, 2000);
  }, []);

  // ─── Conflict actions ──────────────────────────────────────
  const handleConflictAction = useCallback((id: string, action: string) => {
    setConflicts((prev) => prev.filter((c) => c.id !== id));
    toast({ title: `${action} Applied`, description: "Conflict has been resolved." });
  }, []);

  // ─── Add Channel helpers ────────────────────────────────────
  type PlatformOption = {
    name: string;
    icon: LucideIcon;
    logo: string;
    desc: string;
  };

  const platformOptions: PlatformOption[] = [
    { name: "Shopify", icon: Store, logo: shopifyLogo, desc: "Sync with your Shopify storefront" },
    { name: "WooCommerce", icon: Globe, logo: woocomLogo, desc: "WordPress WooCommerce integration" },
    { name: "Meesho", icon: ShoppingBag, logo: meeshoLogo, desc: "Connect Meesho marketplace" },
    { name: "IndiaMART", icon: Package, logo: indiamartLogo, desc: "B2B marketplace sync" },
  ];

  const resetAddChannelModal = useCallback(() => {
    setAddStep(1);
    setSelectedPlatform(null);
    setChannelForm({
      channelName: "",
      storeUrl: "",
      region: "",
      currency: "",
      apiKey: "",
      apiSecret: "",
      environment: "production",
      syncMode: "realtime",
      importOrders: true,
      syncInventory: true,
      autoPriceUpdate: false,
      enableAutoReorder: false,
    });
    setFormErrors({});
    setTestState("idle");
    setTestMessage("");
    setSaveState("idle");
    setSaveMessage("");
  }, []);

  const handleOpenAddChannel = useCallback((open: boolean) => {
    if (!open) resetAddChannelModal();
    setAddChannelModal(open);
  }, [resetAddChannelModal]);

  const handleSelectPlatform = useCallback((platform: PlatformOption) => {
    setSelectedPlatform(platform);
    setChannelForm((prev) => ({ ...prev, channelName: platform.name + " Store" }));
    setAddStep(2);
  }, []);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!channelForm.channelName.trim()) errors.channelName = "Channel name is required";
    if (!channelForm.storeUrl.trim()) errors.storeUrl = "Store URL or Seller ID is required";
    if (!channelForm.apiKey.trim()) errors.apiKey = "API Key is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [channelForm]);

  const handleTestConnection = useCallback(() => {
    if (!validateForm()) return;
    setTestState("testing");
    setTestMessage("Authenticating...");
    setTimeout(() => setTestMessage("Verifying credentials..."), 700);
    setTimeout(() => {
      setTestMessage("Connection successful");
      setTestState("success");
    }, 2000);
  }, [validateForm]);

  const handleSaveAndConnect = useCallback(() => {
    if (!validateForm() || !selectedPlatform) return;
    setSaveState("saving");
    setSaveMessage("Connecting...");
    setTimeout(() => setSaveMessage("Fetching products..."), 800);
    setTimeout(() => setSaveMessage("Initial sync started..."), 1600);
    setTimeout(() => {
      // Create new channel
      const newId = selectedPlatform.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      const newChannel: Channel = {
        id: newId,
        name: channelForm.channelName,
        shortName: selectedPlatform.name,
        status: "syncing",
        lastSync: "Just now",
        ordersToday: 0,
        billedAmount: 0,
        syncAccuracy: 0,
        enabled: true,
        logo: selectedPlatform.logo,
      };

      addChannelAndAutoUpgrade(newChannel, selectedPlatform.name);

      // Close modal
      handleOpenAddChannel(false);
      toast({
        title: "Channel Connected",
        description: `${channelForm.channelName} has been added and initial sync started.`,
      });
    }, 2500);
  }, [validateForm, selectedPlatform, channelForm, handleOpenAddChannel, addChannelAndAutoUpgrade]);

  const updateFormField = useCallback((field: string, value: string | boolean) => {
    setChannelForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    setFormErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
    // Reset test state on credential change
    if (["apiKey", "apiSecret", "storeUrl"].includes(field)) {
      setTestState("idle");
      setTestMessage("");
    }
  }, []);

  const isFormSaveable = channelForm.channelName.trim() && channelForm.storeUrl.trim() && channelForm.apiKey.trim();

  // ─── Filtered logs ─────────────────────────────────────────
  const filteredLogs = activeTab === "All" ? syncLogs : syncLogs.filter((l) => l.channel === activeTab);

  // ─── KPI values ─────────────────────────────────────────────
  const activeChannels = channels.filter((c) => c.enabled).length;
  const totalOrdersToday = channels.reduce((s, c) => s + c.ordersToday, 0);

  const tabs = ["All", ...Array.from(new Set(channels.map((c) => c.shortName)))];

  return (
    <AdminLayout
      title="Multi-Channel Inventory Integration"
      subtitle="Real-time synchronization and centralized inventory visibility across all channels"
    >
      {/* ── Header Actions ────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div /> {/* spacer for flex layout */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setAddChannelModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Channel
          </Button>
          <Button onClick={handleSyncAll} disabled={isSyncing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Sync All Channels"}
          </Button>
        </div>
      </div>

      {/* ── Sync Progress Bar ─────────────────────────────── */}
      {isSyncing && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Synchronizing all channels…</span>
            <span>{Math.round(syncProgress)}%</span>
          </div>
          <Progress value={syncProgress} className="h-2" />
        </div>
      )}

      {/* ── KPI Strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Products" value={245} change="+12 this week" changeType="positive" icon={Package} />
        <KPICard title="Active Channels" value={activeChannels} change={`${channels.length} configured`} changeType="neutral" icon={Radio} />
        <KPICard title="Orders Today" value={totalOrdersToday} change="+18% vs yesterday" changeType="positive" icon={ShoppingCart} />
        <KPICard title="Low Stock Alerts" value={18} change="3 critical" changeType="negative" icon={AlertTriangle} />
      </div>

      {/* ── Channel Status Grid ───────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Channel Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="kpi-card flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/admin/multi-channel/channel/${ch.id.toLowerCase()}`)}
            >
              {/* Top row: icon + name + badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden",
                    ch.logo ? "bg-white" : (ch.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")
                  )}>
                    {ch.logo ? (
                      <img src={ch.logo} alt={ch.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <ChannelIcon channelId={ch.id} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{ch.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Last sync: {ch.lastSync}</p>
                  </div>
                </div>
              </div>

              <ChannelStatusBadge status={ch.status} />

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{ch.ordersToday}</p>
                  <p className="text-[10px] text-muted-foreground">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">${ch.billedAmount.toLocaleString('en-US')}</p>
                  <p className="text-[10px] text-muted-foreground">Billed Amt.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={ch.enabled}
                    onCheckedChange={() => toggleChannel(ch.id)}
                    className="scale-90"
                  />
                  <span className="text-xs text-muted-foreground">{ch.enabled ? "Enabled" : "Disabled"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogsModal({ open: true, channel: ch.name });
                  }}
                >
                  <Eye className="mr-1 h-3 w-3" /> View Logs
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-Column Layout: Feed + Order Flow ──────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Live Sync Feed (2 cols) */}
        <div className="xl:col-span-2">
          <div className="kpi-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Live Inventory Sync Feed</h3>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-green-500">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Live
              </span>
            </div>

            {/* Channel Filter Tabs */}
            <div className="flex flex-wrap gap-1 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Scrollable feed */}
            <div ref={feedRef} className="flex-1 overflow-y-auto max-h-[320px] space-y-1.5 pr-1">
              {filteredLogs.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">Waiting for activity…</p>
              )}
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-start gap-3 rounded-sm px-3 py-2 text-sm border-l-2 transition-all animate-in fade-in slide-in-from-top-1 duration-300",
                    log.type === "success" && "border-l-green-500 bg-green-500/5",
                    log.type === "syncing" && "border-l-yellow-500 bg-yellow-500/5",
                    log.type === "error" && "border-l-red-500 bg-red-500/5"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded",
                        log.type === "success" && "bg-green-500/15 text-green-500",
                        log.type === "syncing" && "bg-yellow-500/15 text-yellow-500",
                        log.type === "error" && "bg-red-500/15 text-red-500"
                      )}>
                        {log.channel}
                      </span>
                      <span className="text-muted-foreground truncate">{log.message}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Flow Widget (1 col) */}
        <div className="kpi-card flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Orders Received Today</h3>
          </div>
          <div className="flex-1 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderFlowData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#a0b3c2", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="channel" width={70} tick={{ fill: "#a0b3c2", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1b2a3a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", fontSize: 12 }}
                  labelStyle={{ color: "#e5e5e5" }}
                  itemStyle={{ color: "#a879c6" }}
                />
                <Bar dataKey="orders" radius={[0, 4, 4, 0]} barSize={22}>
                  {orderFlowData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{totalOrdersToday}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+18% vs yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reorder ────────────────────────────────────────── */}
      <div className="mb-6">
        {/* Automated Reorder Card */}
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Automated Reorder</h3>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-green-500/15 text-green-500 px-2.5 py-1 text-xs font-medium">
              <CheckCircle2 className="h-3 w-3" /> Auto-Reorder ON
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-1 items-center divide-x divide-border">
              <div className="flex items-center gap-3 flex-1 px-6 first:pl-0">
                <p className="text-2xl font-bold text-foreground">18</p>
                <p className="text-xs text-muted-foreground">Low Stock Products</p>
              </div>
              <div className="flex items-center gap-3 flex-1 px-6">
                <p className="text-2xl font-bold text-foreground">6</p>
                <p className="text-xs text-muted-foreground">Reorders Triggered Today</p>
              </div>
            </div>
            <Button
              className="shrink-0 min-w-[180px]"
              onClick={handleReorder}
              disabled={isReordering}
            >
              {isReordering ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing Reorders…
                </>
              ) : (
                <>
                  <PackageCheck className="mr-2 h-4 w-4" /> Simulate Reorder
                </>
              )}
            </Button>
          </div>
        </div>

      </div>

      {/* ── Conflict & Alert Table ────────────────────────── */}
      <div className="kpi-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Inventory Conflicts & Alerts</h3>
          </div>
          <span className="text-xs text-muted-foreground">{conflicts.length} active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Channel</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Issue</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Severity</th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {conflicts.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="py-3 pr-4 text-sm font-medium text-foreground">{c.product}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{c.channel}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{c.issue}</td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
                      c.severity === "high" && "bg-red-500/15 text-red-500",
                      c.severity === "medium" && "bg-orange-500/15 text-orange-500",
                      c.severity === "low" && "bg-yellow-500/15 text-yellow-500"
                    )}>
                      {c.severity.charAt(0).toUpperCase() + c.severity.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleConflictAction(c.id, c.severity === "high" ? "Resolve" : c.severity === "medium" ? "Retry" : "Ignore")}
                    >
                      {c.severity === "high" ? "Resolve" : c.severity === "medium" ? "Retry" : "Ignore"}
                    </Button>
                  </td>
                </tr>
              ))}
              {conflicts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    All conflicts resolved
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── View Logs Modal ───────────────────────────────── */}
      <Dialog open={logsModal.open} onOpenChange={(open) => setLogsModal({ open, channel: open ? logsModal.channel : "" })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Sync Logs — {logsModal.channel}</DialogTitle>
            <DialogDescription>Recent synchronization activity for this channel.</DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-sm p-4 max-h-[350px] overflow-y-auto font-mono text-xs leading-relaxed">
            {dummyLogEntries.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "py-0.5",
                  line.includes("ERR") && "text-red-500",
                  line.includes("WARN") && "text-yellow-500",
                  line.includes("OK") && "text-green-500",
                  line.includes("INFO") && "text-muted-foreground"
                )}
              >
                {line}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsModal({ open: false, channel: "" })}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Channel Modal (Multi-Step) ────────────────── */}
      <Dialog open={addChannelModal} onOpenChange={handleOpenAddChannel}>
        <DialogContent className={cn("transition-all duration-200", addStep === 2 ? "sm:max-w-[580px]" : "sm:max-w-[480px]")}>
          {/* ── STEP 1: Platform Selection ──────────────── */}
          {addStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle>Add New Channel</DialogTitle>
                <DialogDescription>Select a platform to connect to your inventory system.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                {platformOptions.map((opt) => (
                  <button
                    key={opt.name}
                    className="flex items-center gap-3 w-full rounded-sm border border-border p-3 text-left hover:bg-muted/50 transition-colors group"
                    onClick={() => handleSelectPlatform(opt)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-white border border-border overflow-hidden">
                      <img src={opt.logo} alt={`${opt.name} logo`} className="h-6 w-6 object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{opt.name}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}

                {/* Divider */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
                  <div className="flex-1 border-t border-border" />
                </div>

                {/* Other / Custom Channel */}
                <button
                  className="flex items-center gap-3 w-full rounded-sm border border-dashed border-border p-3 text-left hover:bg-muted/50 transition-colors group"
                  onClick={() => {
                    handleOpenAddChannel(false);
                    navigate("/admin/multi-channel/add-custom");
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                    <Plug className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Other / Custom Channel</p>
                    <p className="text-xs text-muted-foreground">Connect any external marketplace or system</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleOpenAddChannel(false)}>Cancel</Button>
              </DialogFooter>
            </>
          )}

          {/* ── STEP 2: Configuration Form ─────────────── */}
          {addStep === 2 && selectedPlatform && (() => {
            const PlatformIcon = selectedPlatform.icon;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-sm" style={{ background: 'linear-gradient(135deg, #9b5796 0%, #a879c6 60%, #4f6aaf 100%)' }}>
                      <PlatformIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle>Configure {selectedPlatform.name}</DialogTitle>
                      <DialogDescription>Fill in details to connect this channel.</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto space-y-5 py-4 pr-1">
                  {/* ── Basic Information ───────────── */}
                  <div className="rounded-lg border border-white/[0.07] bg-black/20 p-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                      <Package className="h-4 w-4" style={{ color: '#a879c6' }} /> Basic Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="channelName" className="text-xs">Channel Name *</Label>
                        <Input
                          id="channelName"
                          placeholder="e.g. HYDRAULIC pumps Shopify"
                          value={channelForm.channelName}
                          onChange={(e) => updateFormField("channelName", e.target.value)}
                          className={cn(formErrors.channelName && "border-red-500")}
                        />
                        {formErrors.channelName && <p className="text-[11px] text-red-500">{formErrors.channelName}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="storeUrl" className="text-xs">Store URL / Seller ID *</Label>
                        <Input
                          id="storeUrl"
                          placeholder="https://hydraulic-pumps-store.myshopify.com"
                          value={channelForm.storeUrl}
                          onChange={(e) => updateFormField("storeUrl", e.target.value)}
                          className={cn(formErrors.storeUrl && "border-red-500")}
                        />
                        {formErrors.storeUrl && <p className="text-[11px] text-red-500">{formErrors.storeUrl}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Region</Label>
                        <Select value={channelForm.region} onValueChange={(v) => updateFormField("region", v)}>
                          <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="eu">Europe</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="sea">Southeast Asia</SelectItem>
                            <SelectItem value="global">Global</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Currency</Label>
                        <Select value={channelForm.currency} onValueChange={(v) => updateFormField("currency", v)}>
                          <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* ── Authentication ─────────────── */}
                  <div className="rounded-lg border border-white/[0.07] bg-black/20 p-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                      <Key className="h-4 w-4" style={{ color: '#a879c6' }} /> Authentication
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="apiKey" className="text-xs">API Key / Access Token *</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          placeholder="sk_live_••••••••"
                          value={channelForm.apiKey}
                          onChange={(e) => updateFormField("apiKey", e.target.value)}
                          className={cn(formErrors.apiKey && "border-red-500")}
                        />
                        {formErrors.apiKey && <p className="text-[11px] text-red-500">{formErrors.apiKey}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="apiSecret" className="text-xs">API Secret (optional)</Label>
                        <Input
                          id="apiSecret"
                          type="password"
                          placeholder="••••••••"
                          value={channelForm.apiSecret}
                          onChange={(e) => updateFormField("apiSecret", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">Environment</Label>
                        <div className="flex gap-2">
                          {(["production", "sandbox"] as const).map((env) => (
                            <button
                              key={env}
                              onClick={() => updateFormField("environment", env)}
                              className={cn(
                                "flex-1 rounded-sm border px-3 py-2 text-xs font-medium transition-colors",
                                channelForm.environment === env
                                  ? "border-[#a879c6]/60 text-white"
                                  : "border-white/10 text-[#a0b3c2] hover:bg-white/5"
                              )}
                              style={channelForm.environment === env ? { background: 'linear-gradient(90deg,#9b5796,#a879c6,#4f6aaf)' } : undefined}
                            >
                              {env === "production" ? "Production" : "Sandbox"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Sync Settings ──────────────── */}
                  <div className="rounded-lg border border-white/[0.07] bg-black/20 p-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                      <Settings2 className="h-4 w-4" style={{ color: '#a879c6' }} /> Sync Settings
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Sync Mode</Label>
                        <Select value={channelForm.syncMode} onValueChange={(v) => updateFormField("syncMode", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="5min">Every 5 minutes</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { key: "importOrders", label: "Import Orders" },
                          { key: "syncInventory", label: "Sync Inventory" },
                          { key: "autoPriceUpdate", label: "Auto Price Update" },
                          { key: "enableAutoReorder", label: "Enable Auto-Reorder" },
                        ].map((toggle) => (
                          <div key={toggle.key} className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5">
                            <span className="text-xs text-foreground">{toggle.label}</span>
                            <Switch
                              checked={channelForm[toggle.key as keyof typeof channelForm] as boolean}
                              onCheckedChange={(v) => updateFormField(toggle.key, v)}
                              className="scale-90"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Test Connection Result ─────── */}
                  {testState !== "idle" && (
                    <div className={cn(
                      "rounded-sm border px-4 py-3 text-sm flex items-center gap-2.5 transition-all",
                      testState === "testing" && "border-yellow-500/30 bg-yellow-500/5 text-yellow-500",
                      testState === "success" && "border-green-500/30 bg-green-500/5 text-green-500"
                    )}>
                      {testState === "testing" && <Loader2 className="h-4 w-4 animate-spin" />}
                      {testState === "success" && <CheckCircle2 className="h-4 w-4" />}
                      <span>{testMessage}</span>
                    </div>
                  )}

                  {/* ── Save Connection Progress ──── */}
                  {saveState === "saving" && (
                    <div className="rounded-sm border border-primary/30 bg-primary/5 px-4 py-3 text-sm flex items-center gap-2.5 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{saveMessage}</span>
                    </div>
                  )}
                </div>

                {/* ── Footer Buttons ──────────────── */}
                <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                  <div className="flex gap-2 mr-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setAddStep(1); setTestState("idle"); setTestMessage(""); }}
                      disabled={saveState === "saving"}
                    >
                      <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddChannel(false)}
                      disabled={saveState === "saving"}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testState === "testing" || saveState === "saving"}
                    >
                      {testState === "testing" ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing…</>
                      ) : testState === "success" ? (
                        <><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Verified</>
                      ) : (
                        <><Shield className="mr-2 h-4 w-4" /> Test Connection</>
                      )}
                    </Button>
                    <Button
                      onClick={handleSaveAndConnect}
                      disabled={!isFormSaveable || saveState === "saving"}
                    >
                      {saveState === "saving" ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting…</>
                      ) : (
                        <>Save & Connect</>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
