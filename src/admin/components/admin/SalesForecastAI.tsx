import { useMemo, useState } from "react";
import { useAdmin } from "@/admin/context/AdminContext";
import {
  predictProductDemand,
  getCategoryForecasts,
  getSalesForecastSummary,
  generateMonthlyForecastData,
  ProductForecast,
} from "@/admin/ai/salesForecast";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Zap,
  AlertTriangle,
  Target,
  Package,
  DollarSign,
  Calendar,
  Search,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/admin/lib/utils";
import { formatCurrency } from "@/admin/ai/aiUtils";
import {
  SeasonalInsightBadge,
  parseSeasonalFactor,
} from "./SeasonalInsightBadge";

export function SalesForecastAI() {
  const { products, orders, quotes } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [demandFilter, setDemandFilter] = useState<string>("all");

  const productForecasts = useMemo(
    () =>
      products
        .filter((p) => p.status === "active")
        .map((p) => predictProductDemand(p, orders, quotes)),
    [products, orders, quotes],
  );

  const categoryForecasts = useMemo(
    () => getCategoryForecasts(products, orders),
    [products, orders],
  );

  const summary = useMemo(
    () => getSalesForecastSummary(productForecasts, categoryForecasts),
    [productForecasts, categoryForecasts],
  );

  const monthlyData = useMemo(() => generateMonthlyForecastData(), []);

  const filteredForecasts = productForecasts.filter((f) => {
    const matchesSearch = f.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDemand =
      demandFilter === "all" || f.demandLevel === demandFilter;
    return matchesSearch && matchesDemand;
  });

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDemandColor = (level: ProductForecast["demandLevel"]) => {
    switch (level) {
      case "high":
        return "bg-green-500/10 border-green-500/30 text-green-500";
      case "medium":
        return "bg-blue-500/10 border-blue-500/30 text-blue-500";
      case "low":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-500";
      case "declining":
        return "bg-red-500/10 border-red-500/30 text-red-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9b5796, #a879c6)' }}>
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              AI Sales Forecast
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Demand prediction & trend analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          Updated just now
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">
              Next Month
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(summary.predictedNextMonthRevenue)}
          </p>
          <p
            className={cn(
              "text-xs flex items-center gap-1 mt-1",
              summary.overallGrowthRate >= 0
                ? "text-green-500"
                : "text-red-500",
            )}
          >
            {summary.overallGrowthRate >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {summary.overallGrowthRate >= 0 ? "+" : ""}
            {summary.overallGrowthRate}% predicted
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground font-medium">
              Next Quarter
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(summary.predictedNextQuarterRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on seasonal trends
          </p>
        </div>

        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-500 font-medium">
              High Demand
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {summary.highDemandProducts}
          </p>
          <p className="text-xs text-muted-foreground">products trending up</p>
        </div>

        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-xs text-red-500 font-medium">Declining</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {summary.decliningProducts}
          </p>
          <p className="text-xs text-muted-foreground">need attention</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Forecast Chart */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Monthly Revenue Forecast
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#a0b3c2", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                />
                <YAxis
                  tick={{ fill: "#a0b3c2", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1b2a3a",
                    borderColor: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ color: "#e5e5e5" }}
                  formatter={(value) => [
                    `$${(value ?? 0).toLocaleString()}`,
                    "",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#975fc4"
                  strokeWidth={2}
                  dot={{ fill: "#975fc4" }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#766dc4"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#766dc4" }}
                  name="Predicted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Forecast Chart */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Category Demand Forecast
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryForecasts.slice(0, 6)} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#a0b3c2", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fill: "#a0b3c2", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                  width={80}
                  tickFormatter={(v) => v.split(" ")[0]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1b2a3a",
                    borderColor: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ color: "#e5e5e5" }}
                  formatter={(value) => [
                    `$${(value ?? 0).toLocaleString()}`,
                    "",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="currentRevenue"
                  fill="#4f6aaf"
                  name="Current"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="predictedRevenue"
                  fill="#766dc4"
                  name="Predicted"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["all", "high", "medium", "low", "declining"].map((level) => (
            <Button
              key={level}
              variant={demandFilter === level ? "default" : "outline"}
              size="sm"
              onClick={() => setDemandFilter(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Product Forecasts Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border">
          <p className="text-sm font-medium text-foreground">
            Product Demand Forecasts ({filteredForecasts.length} products)
          </p>
        </div>
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {filteredForecasts.map((forecast) => (
            <div
              key={forecast.productId}
              className="p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Product Identity */}
                <div className="flex items-start gap-3 w-64 shrink-0">
                  <div
                    className={cn(
                      "px-2 py-1 rounded border text-xs font-medium shrink-0",
                      getDemandColor(forecast.demandLevel),
                    )}
                  >
                    {forecast.demandLevel}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {forecast.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {forecast.category.split(" ")[0]}
                    </p>
                    <SeasonalInsightBadge
                      demandLevel={forecast.demandLevel}
                      seasonalFactor={parseSeasonalFactor(
                        forecast.seasonalTrend,
                      )}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Right: Metrics + Insights Column */}
                <div className="flex-1 flex flex-col items-end gap-3">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-6 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        This Month
                      </p>
                      <p className="font-bold">{forecast.currentMonthSales}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Growth</p>
                      <p
                        className={cn(
                          "font-medium flex items-center justify-end gap-1",
                          forecast.growthRate > 0
                            ? "text-green-500"
                            : forecast.growthRate < 0
                              ? "text-red-500"
                              : "text-gray-500",
                        )}
                      >
                        {forecast.growthRate > 0 ? "+" : ""}
                        {Math.round(forecast.growthRate * 100)}%
                        {getTrendIcon(
                          forecast.growthRate > 0.05
                            ? "up"
                            : forecast.growthRate < -0.05
                              ? "down"
                              : "stable",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Next Month
                      </p>
                      <p className="font-medium text-primary">
                        {forecast.predictedNextMonth}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Confidence
                      </p>
                      <p className="font-medium">
                        {forecast.confidence.percentage}%
                      </p>
                    </div>
                  </div>

                  {/* AI Insights - Right Aligned */}
                  {forecast.insights.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {forecast.insights.map((insight, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "text-xs px-2 py-1 rounded inline-flex items-center gap-1",
                            insight.type === "success" &&
                            "bg-green-500/10 text-green-500",
                            insight.type === "warning" &&
                            "bg-yellow-500/10 text-yellow-500",
                            insight.type === "info" &&
                            "bg-blue-500/10 text-blue-500",
                          )}
                        >
                          <Brain className="h-3 w-3" />
                          {insight.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SalesForecastAI;
