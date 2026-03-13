import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { KPICard } from "@/admin/components/admin/KPICard";
import { StatusBadge } from "@/admin/components/admin/StatusBadge";
import { useAdmin } from "@/admin/context/AdminContext";
import {
  Package,
  FileQuestion,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { products, quotes, orders } = useAdmin();

  const totalProducts = products.length;
  const activeQuotes = quotes.filter((q) => q.status !== "closed").length;
  const pendingOrders = orders.filter((o) => o.status !== "dispatched").length;
  const lowStockItems = products.filter(
    (p) => p.stock > 0 && p.stock <= 10,
  ).length;

  // Mock chart data
  const quoteData = [
    { name: "Mon", quotes: 3 },
    { name: "Tue", quotes: 5 },
    { name: "Wed", quotes: 2 },
    { name: "Thu", quotes: 7 },
    { name: "Fri", quotes: 4 },
    { name: "Sat", quotes: 1 },
    { name: "Sun", quotes: 2 },
  ];

  const categoryData = products.reduce(
    (acc, product) => {
      const existing = acc.find((item) => item.name === product.category);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: product.category, value: 1 });
      }
      return acc;
    },
    [] as { name: string; value: number }[],
  );

  const CHART_COLORS = [
    "#a879c6",  // chart-1: light purple
    "#975fc4",  // chart-2: medium purple
    "#4f6aaf",  // chart-3: blue-purple
    "#5551af",  // chart-4: indigo
    "#766dc4",  // chart-5: lavender
    "#7b8ec8",  // chart-6: periwinkle
    "#9b5796",  // chart-7: magenta-purple
    "#6a5acd",  // chart-8: slate blue
  ];

  const recentQuotes = quotes.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your hydraulics business"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Products"
          value={totalProducts}
          change="+2 this week"
          changeType="positive"
          icon={Package}
        />
        <KPICard
          title="Active Quotes"
          value={activeQuotes}
          change={`${quotes.filter((q) => q.status === "new").length} new`}
          changeType="neutral"
          icon={FileQuestion}
        />
        <KPICard
          title="Pending Orders"
          value={pendingOrders}
          change="On track"
          changeType="positive"
          icon={ShoppingCart}
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockItems}
          change="Needs attention"
          changeType={lowStockItems > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Quote Requests Chart */}
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Quote Requests (Last 7 Days)
            </h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quoteData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#a0b3c2", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                />
                <YAxis
                  tick={{ fill: "#a0b3c2", fontSize: 12 }}
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
                  dataKey="quotes"
                  fill="#766dc4"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Product Categories
            </h3>
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1b2a3a",
                    borderColor: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ color: "#e5e5e5" }}
                  itemStyle={{ color: "#a879c6" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {categoryData.slice(0, 4).map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index] }}
                />
                <span className="text-muted-foreground truncate max-w-[100px]">
                  {cat.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quote Requests */}
        <div className="bg-card border border-border rounded-sm">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Recent Quote Requests
            </h3>
            <Link
              to="/admin/quotes"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentQuotes.map((quote) => (
              <div
                key={quote.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {quote.companyName}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {quote.requestedDate}
                  </p>
                </div>
                <StatusBadge status={quote.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-sm">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Recent Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {order.id}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />$
                    {order.totalAmount.toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}
