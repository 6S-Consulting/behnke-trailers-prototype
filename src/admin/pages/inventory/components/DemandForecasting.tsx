import { useMemo, useState } from "react";
import { useAdmin } from "@/admin/context/AdminContext";
import { useInventoryState } from "@/admin/context/InventoryStateContext";
import {
  getInventoryPredictions,
  getInventorySummary,
  StockPrediction,
} from "@/admin/ai/inventoryPredictor";
import {
  getHYDRAULICWarehouseAnalytics,
  getHYDRAULICDashboardMetrics,
} from "@/data/sixes-data-initializer";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
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
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  Target,
  Brain,
  CheckCircle,
  XCircle,
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
  Search,
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/admin/lib/utils";

// Status configuration for AI predictions
const STATUS_CONFIG = {
  healthy: {
    label: "Normal",
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  warning: {
    label: "Warning",
    icon: AlertCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  critical: {
    label: "Critical",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  "dead-stock": {
    label: "Dead Stock",
    icon: Archive,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
} as const;

// Action definitions by severity
const SEVERITY_ACTIONS = {
  critical: {
    primary: {
      label: "Notify Warehouse",
      icon: Bell,
      action: "notify_warehouse",
    },
    secondary: [
      {
        label: "Trigger Production",
        icon: Factory,
        action: "trigger_production",
      },
      { label: "Create Order", icon: FileText, action: "create_order" },
    ],
  },
  warning: {
    primary: {
      label: "Schedule Reorder",
      icon: ClipboardList,
      action: "schedule_reorder",
    },
    secondary: [
      { label: "Notify Planning", icon: Bell, action: "notify_planning" },
    ],
  },
  healthy: {
    primary: { label: "Monitor", icon: Eye, action: "monitor_stock" },
    secondary: [],
  },
  "dead-stock": {
    primary: { label: "Review Stock", icon: Eye, action: "review_stock" },
    secondary: [
      { label: "Create Promotion", icon: FileText, action: "create_promotion" },
    ],
  },
} as const;

interface ActionModalState {
  isOpen: boolean;
  action: string;
  product: StockPrediction | null;
}

// Hardcoded JSON for Demand Forecasting (Prototype Data)
const MOCK_FORECASTING_DATA = [
  { sku: "PVP16", m3: 12, m2: 15, m1: 18, pred: 20, avg6m: 14, region: "TX", regPct: 45, trend: "increasing", confidence: 0.92 },
  { sku: "505A", m3: 18, m2: 16, m1: 14, pred: 12, avg6m: 16, region: "CA", regPct: 38, trend: "decreasing", confidence: 0.88 },
  { sku: "PD018", m3: 10, m2: 12, m1: 15, pred: 18, avg6m: 12, region: "FL", regPct: 25, trend: "increasing", confidence: 0.85 },
  { sku: "OIL500", m3: 15, m2: 14, m1: 16, pred: 17, avg6m: 15, region: "NY", regPct: 30, trend: "stable", confidence: 0.90 },
  { sku: "PD028", m3: 14, m2: 18, m1: 20, pred: 18, avg6m: 16, region: "TX", regPct: 42, trend: "decreasing", confidence: 0.82 },
  { sku: "OIL108", m3: 11, m2: 13, m1: 12, pred: 15, avg6m: 12, region: "GA", regPct: 28, trend: "increasing", confidence: 0.87 },
  { sku: "PVP33", m3: 16, m2: 15, m1: 14, pred: 16, avg6m: 15, region: "IL", regPct: 22, trend: "stable", confidence: 0.89 },
  { sku: "511A", m3: 13, m2: 12, m1: 15, pred: 19, avg6m: 14, region: "NC", regPct: 35, trend: "increasing", confidence: 0.91 },
  { sku: "F112", m3: 17, m2: 19, m1: 18, pred: 16, avg6m: 17, region: "AZ", regPct: 20, trend: "decreasing", confidence: 0.84 },
  { sku: "315A", m3: 12, m2: 11, m1: 14, pred: 15, avg6m: 12, region: "WA", regPct: 26, trend: "increasing", confidence: 0.86 },
];

export function DemandForecasting() {
  const { products, orders } = useAdmin();
  const { alerts } = useInventoryState();

  // Forecasts tab filters
  const [forecastSearch, setForecastSearch] = useState("");
  const [trendFilter, setTrendFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [forecastPage, setForecastPage] = useState(1);
  const FORECASTS_PER_PAGE = 10;
  const MAX_ALERTS_DISPLAY = 10;

  const analytics = useMemo(() => getHYDRAULICWarehouseAnalytics(), []);

  // Transform local JSON data to display rows
  const skuForecastingRows = useMemo(() => {
    return MOCK_FORECASTING_DATA.map((item) => {
      // Forecasted Growth Calculation: (Pred - M1) / M1
      const forecastedGrowth = item.m1 > 0 ? (item.pred - item.m1) / item.m1 : 0;

      // Calculate next 3 months projection (simulated as pred * 3 with slight variance)
      const next3MonthsTotal = item.pred * 3 + Math.floor(Math.random() * 5);

      return {
        sku: item.sku,
        last6MonthsAvg: item.avg6m,
        m1: item.m1,
        m2: item.m2,
        m3: item.m3,
        thisMonthForecast: item.pred,
        next3MonthsTotal,
        trend: item.trend,
        confidence: item.confidence,
        growthRate: forecastedGrowth,
        regionalDemand: [{ region: item.region, percentage: item.regPct }],
        totalSold: item.avg6m * 6, // Simulated
      };
    });
  }, []);

  const filteredSKURows = useMemo(() => {
    return skuForecastingRows.filter((row) => {
      const matchesSearch = row.sku.toLowerCase().includes(forecastSearch.toLowerCase());
      const matchesTrend = trendFilter === "all" || row.trend === trendFilter;
      return matchesSearch && matchesTrend;
    });
  }, [skuForecastingRows, forecastSearch, trendFilter]);

  const paginatedSKURows = useMemo(() => {
    const start = (forecastPage - 1) * FORECASTS_PER_PAGE;
    return filteredSKURows.slice(start, start + FORECASTS_PER_PAGE);
  }, [filteredSKURows, forecastPage]);

  const totalForecastPages = Math.ceil(
    filteredSKURows.length / FORECASTS_PER_PAGE,
  );

  // Filtered alerts (limit to 10 max)
  const filteredAlerts = useMemo(() => {
    const filtered = analytics.alerts.filter((alert) => {
      const matchesSeverity =
        severityFilter === "all" || alert.severity === severityFilter;
      return matchesSeverity;
    });
    // Limit to maximum 10 alerts total
    return filtered.slice(0, MAX_ALERTS_DISPLAY);
  }, [analytics.alerts, severityFilter]);

  return (
    <div className="space-y-6">
      {/* Demand Forecasting Content */}
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Forecast Period
            </p>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">3 Months</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredSKURows.length} active SKUs analyzed
          </p>
        </div>
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Growing Demand
            </p>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {
              analytics.forecasts.filter((f) => f.trend === "increasing")
                .length
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            SKUs trending up
          </p>
        </div>
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Declining Demand
            </p>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {
              analytics.forecasts.filter((f) => f.trend === "decreasing")
                .length
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            SKUs trending down
          </p>
        </div>
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Average Confidence
            </p>
            <Target className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(
              (analytics.forecasts.reduce(
                (sum, f) => sum + f.confidence,
                0,
              ) /
                analytics.forecasts.length) *
              100
            ).toFixed(0)}
            %
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Prediction accuracy
          </p>
        </div>
      </div>

      {/* Demand Forecast Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                3-Month Pump Demand Projection
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Comparing baseline history with AI-powered monthly projections for hydraulic pumps
              </p>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold">
              {filteredSKURows.length} SKUs
            </Badge>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-md shadow-sm">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search SKU or month..."
                value={forecastSearch}
                onChange={(e) => {
                  setForecastSearch(e.target.value);
                  setForecastPage(1);
                }}
                className="pl-9 h-9 border-muted-foreground/20"
              />
            </div>
            <Select
              value={trendFilter}
              onValueChange={(val) => {
                setTrendFilter(val);
                setForecastPage(1);
              }}
            >
              <SelectTrigger className="w-44 h-9 border-muted-foreground/20">
                <SelectValue placeholder="Select Trend" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trends</SelectItem>
                <SelectItem value="increasing">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span>Increasing</span>
                  </div>
                </SelectItem>
                <SelectItem value="stable">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300" />
                    <span>Stable</span>
                  </div>
                </SelectItem>
                <SelectItem value="decreasing">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span>Decreasing</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr className="text-[11px] text-muted-foreground">
                <th className="text-left p-3 font-bold w-32 leading-tight">Product<br />SKU</th>
                <th className="text-right p-3 font-bold w-24 leading-tight">6-Month<br />Average</th>
                <th className="text-right p-3 font-bold w-20 leading-tight">3 Months<br />Ago</th>
                <th className="text-right p-3 font-bold w-20 leading-tight">2 Months<br />Ago</th>
                <th className="text-right p-3 font-bold w-24 text-foreground bg-muted/20 border-x border-border/50 leading-tight">Last Month<br />Actual</th>
                <th className="text-right p-3 font-bold w-28 leading-tight" style={{ color: '#a879c6', backgroundColor: 'rgba(168, 121, 198, 0.08)' }}>This Month<br />Forecast</th>
                <th className="text-right p-3 font-bold w-28 leading-tight">Month-over-Month<br />Growth</th>
                <th className="text-right p-3 font-bold w-24 leading-tight" style={{ color: '#a879c6', backgroundColor: 'rgba(168, 121, 198, 0.08)' }}>3-Month<br />Target</th>
                <th className="text-left p-3 font-bold w-24 leading-tight">AI<br />Insight</th>
                <th className="text-left p-3 font-bold w-32 leading-tight">Top<br />Region</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSKURows.map((row, idx) => {
                const growthVal = (row.growthRate * 100).toFixed(1);
                return (
                  <tr
                    key={`${row.sku}-${idx}`}
                    className="border-t border-border text-sm hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-3 font-bold text-foreground">{row.sku}</td>
                    <td className="p-3 text-right">
                      <span className="font-medium text-muted-foreground">{row.last6MonthsAvg}</span>
                    </td>
                    <td className="p-3 text-right text-muted-foreground/60">{row.m3}</td>
                    <td className="p-3 text-right text-muted-foreground/80">{row.m2}</td>
                    <td className="p-3 text-right bg-muted/5 font-semibold">
                      {row.m1}
                    </td>
                    <td className="p-3 text-right" style={{ backgroundColor: 'rgba(168, 121, 198, 0.06)', borderLeft: '1px solid rgba(168, 121, 198, 0.2)' }}>
                      <span className="font-bold" style={{ color: '#a879c6' }}>{row.thisMonthForecast}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={cn(
                        "font-bold",
                        parseFloat(growthVal) > 0 ? "text-emerald-600" : parseFloat(growthVal) < 0 ? "text-red-500" : "text-muted-foreground"
                      )}>
                        {parseFloat(growthVal) > 0 ? '+' : ''}{growthVal}%
                      </span>
                    </td>
                    <td className="p-3 text-right" style={{ backgroundColor: 'rgba(168, 121, 198, 0.06)', borderLeft: '1px solid rgba(168, 121, 198, 0.2)' }}>
                      <span className="font-bold" style={{ color: '#a879c6' }}>{row.next3MonthsTotal}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {row.trend === "increasing" ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : row.trend === "decreasing" ? (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground/70">{(row.confidence * 100).toFixed(0)}% AI</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {row.regionalDemand.slice(0, 1).map((rd) => (
                          <span
                            key={rd.region}
                            className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded-sm whitespace-nowrap"
                          >
                            {rd.region}: {rd.percentage.toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalForecastPages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(forecastPage - 1) * FORECASTS_PER_PAGE + 1} to{" "}
              {Math.min(
                forecastPage * FORECASTS_PER_PAGE,
                filteredSKURows.length,
              )}{" "}
              of {filteredSKURows.length} SKUs
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForecastPage((p) => Math.max(1, p - 1))}
                disabled={forecastPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {forecastPage} of {totalForecastPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setForecastPage((p) =>
                    Math.min(totalForecastPages, p + 1),
                  )
                }
                disabled={forecastPage === totalForecastPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Alerts */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Stock Alerts
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Automated recommendations based on forecasts
              </p>
            </div>
            <Badge variant="secondary" className="text-xs font-semibold">
              {filteredAlerts.length} Alerts
            </Badge>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-md shadow-sm">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={severityFilter}
              onValueChange={(val) => {
                setSeverityFilter(val);
              }}
            >
              <SelectTrigger className="w-48 h-9 border-muted-foreground/20">
                <SelectValue placeholder="Select Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-foreground">
              No Stock Alerts
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All inventory levels are healthy
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20 border-b border-border">
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left p-3 font-medium">SKU</th>
                  <th className="text-left p-3 font-medium">Warehouse</th>
                  <th className="text-right p-3 font-medium">
                    Current Stock
                  </th>
                  <th className="text-left p-3 font-medium">Issue</th>
                  <th className="text-left p-3 font-medium">
                    Recommended Action
                  </th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => {
                  const wh = analytics.warehouses.find(
                    (w) => w.id === alert.warehouseId,
                  );
                  return (
                    <tr
                      key={alert.id}
                      className="border-t border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3">
                        <span className="font-medium text-sm">
                          {alert.sku}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {wh?.name || "N/A"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs font-semibold",
                            alert.currentStock === 0 &&
                            "bg-red-500/10 text-red-700",
                            alert.currentStock > 0 &&
                            alert.currentStock < 50 &&
                            "bg-amber-500/10 text-amber-700",
                          )}
                        >
                          {alert.currentStock} units
                        </Badge>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-foreground max-w-xs">
                          {alert.message}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {alert.recommendedAction}
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                      
                          <Badge
                            variant={
                              alert.severity === "critical"
                                ? "destructive"
                                : alert.severity === "warning"
                                  ? "default"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {alert.type.replace("-", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
