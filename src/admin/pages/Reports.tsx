import { useState } from "react";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { SalesForecastAI } from "@/admin/components/admin/SalesForecastAI";
import { Button } from "@/admin/components/ui/button";
import { useAdmin } from "@/admin/context/AdminContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Package,
  FileQuestion,
  DollarSign,
  Brain,
  BarChart3,
} from "lucide-react";

export default function Reports() {
  const { products, quotes, orders, customers } = useAdmin();
  const [activeTab, setActiveTab] = useState<"reports" | "ai-forecast">(
    "reports",
  );

  // Quote conversion data
  const quoteConversion = [
    { name: "New", value: quotes.filter((q) => q.status === "new").length },
    {
      name: "In Review",
      value: quotes.filter((q) => q.status === "in-review").length,
    },
    {
      name: "Quoted",
      value: quotes.filter((q) => q.status === "quoted").length,
    },
    {
      name: "Negotiation",
      value: quotes.filter((q) => q.status === "negotiation").length,
    },
    {
      name: "Closed",
      value: quotes.filter((q) => q.status === "closed").length,
    },
  ];

  // Category demand (based on quotes)
  const categoryDemand = products
    .reduce(
      (acc, product) => {
        const existing = acc.find(
          (item) => item.name === product.category.split(" ")[0],
        );
        if (existing) {
          existing.products += 1;
          existing.stock += product.stock;
        } else {
          acc.push({
            name: product.category.split(" ")[0],
            products: 1,
            stock: product.stock,
          });
        }
        return acc;
      },
      [] as { name: string; products: number; stock: number }[],
    )
    .slice(0, 6);

  // Stock movement trend (mock data)
  const stockTrend = [
    { month: "Oct", inbound: 120, outbound: 85 },
    { month: "Nov", inbound: 95, outbound: 110 },
    { month: "Dec", inbound: 150, outbound: 130 },
    { month: "Jan", inbound: 88, outbound: 95 },
    { month: "Feb", inbound: 110, outbound: 105 },
    { month: "Mar", inbound: 135, outbound: 120 },
  ];

  // Top products by stock
  const topProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  const COLORS = [
    "#a879c6",
    "#975fc4",
    "#4f6aaf",
    "#5551af",
    "#766dc4",
  ];

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const conversionRate =
    quotes.length > 0
      ? (
        (quotes.filter((q) => q.status === "closed").length / quotes.length) *
        100
      ).toFixed(1)
      : "0";

  return (
    <AdminLayout title="Reports" subtitle="Business analytics and insights">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "reports" ? "default" : "outline"}
          onClick={() => setActiveTab("reports")}
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
        <Button
          variant={activeTab === "ai-forecast" ? "default" : "outline"}
          onClick={() => setActiveTab("ai-forecast")}
          className="gap-2"
        >
          <Brain className="h-4 w-4" />
          AI Forecast
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-500 rounded">
            NEW
          </span>
        </Button>
      </div>

      {activeTab === "ai-forecast" ? (
        <SalesForecastAI />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Total Revenue
                </span>
              </div>
              <p className="text-2xl font-bold">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">
                  Quote Conversion
                </span>
              </div>
              <p className="text-2xl font-bold">{conversionRate}%</p>
            </div>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Active Products
                </span>
              </div>
              <p className="text-2xl font-bold">
                {products.filter((p) => p.status === "active").length}
              </p>
            </div>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <FileQuestion className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">
                  Pending Quotes
                </span>
              </div>
              <p className="text-2xl font-bold">
                {quotes.filter((q) => q.status !== "closed").length}
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Quote Pipeline */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className="text-sm font-semibold mb-4">Quote Pipeline</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quoteConversion}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#a0b3c2", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                    />
                    <YAxis
                      tick={{ fill: "#a0b3c2", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1b2a3a",
                        borderColor: "rgba(255,255,255,0.05)",
                        borderRadius: "12px",
                      }}
                      labelStyle={{ color: "#e5e5e5" }}
                      itemStyle={{ color: "#a879c6" }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#766dc4"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Movement */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className="text-sm font-semibold mb-4">
                Stock Movement Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockTrend}>
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
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1b2a3a",
                        borderColor: "rgba(255,255,255,0.05)",
                        borderRadius: "12px",
                      }}
                      labelStyle={{ color: "#e5e5e5" }}
                      itemStyle={{ color: "#a879c6" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="inbound"
                      stroke="#975fc4"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="outbound"
                      stroke="#766dc4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: "#975fc4" }}
                  />
                  <span className="text-muted-foreground">Inbound</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: "#766dc4" }}
                  />
                  <span className="text-muted-foreground">Outbound</span>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className="text-sm font-semibold mb-4">
                Products by Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDemand} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "#a0b3c2", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "#a0b3c2", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1b2a3a",
                        borderColor: "rgba(255,255,255,0.05)",
                        borderRadius: "12px",
                      }}
                      labelStyle={{ color: "#e5e5e5" }}
                      itemStyle={{ color: "#a879c6" }}
                    />
                    <Bar
                      dataKey="products"
                      fill="#4f6aaf"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className="text-sm font-semibold mb-4">
                Top Products by Stock
              </h3>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-sm flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: COLORS[index],
                          color: "#e5e5e5",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.stock}</p>
                      <p className="text-xs text-muted-foreground">units</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
