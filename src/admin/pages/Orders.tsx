import { useState } from "react";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { DataTable } from "@/admin/components/admin/DataTable";
import { StatusBadge } from "@/admin/components/admin/StatusBadge";
import { useAdmin } from "@/admin/context/AdminContext";
import { Order, OrderStatus } from "@/data/orders";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Search, Truck, Package, DollarSign } from "lucide-react";

export default function Orders() {
  const { orders, setOrders } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrderCounts = () => {
    return {
      all: orders.length,
      received: orders.filter((o) => o.status === "received").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      "in-production": orders.filter((o) => o.status === "in-production").length,
      dispatched: orders.filter((o) => o.status === "dispatched").length,
    };
  };

  const counts = getOrderCounts();

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (order: Order) => (
        <span className="font-mono text-sm text-primary">{order.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order: Order) => (
        <div>
          <p className="font-medium text-foreground">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">{order.companyName}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (order: Order) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {order.items.reduce((sum, i) => sum + i.quantity, 0)} units
          </span>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order: Order) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{order.totalAmount.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order: Order) => <StatusBadge status={order.status} />,
    },
    {
      key: "date",
      header: "Order Date",
      render: (order: Order) => (
        <span className="text-sm text-muted-foreground">{order.orderDate}</span>
      ),
    },
    {
      key: "delivery",
      header: "Est. Delivery",
      render: (order: Order) => (
        <div className="flex items-center gap-2">
          {order.trackingNumber && <Truck className="h-4 w-4 text-success" />}
          <span className="text-sm text-muted-foreground">
            {order.estimatedDelivery || "-"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Orders" subtitle="Track and manage customer orders">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "received", "confirmed", "in-production", "dispatched"] as const).map(
          (status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="gap-2"
            >
              {status === "all" ? "All" : <StatusBadge status={status as OrderStatus} />}
              <span className="text-xs opacity-70">({counts[status]})</span>
            </Button>
          )
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, customer, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredOrders.length} order(s)
      </p>

      {/* Orders Table */}
      <DataTable columns={columns} data={filteredOrders} emptyMessage="No orders found" />
    </AdminLayout>
  );
}
