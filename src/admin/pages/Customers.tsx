import { useState } from "react";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { DataTable } from "@/admin/components/admin/DataTable";
import { useAdmin } from "@/admin/context/AdminContext";
import { Customer } from "@/data/customers";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import {
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingCart,
  Calendar,
  Eye,
} from "lucide-react";

export default function Customers() {
  const { customers, quotes, orders } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getCustomerQuotes = (customerId: string) => {
    return quotes.filter((q) => q.customerId === customerId);
  };

  const getCustomerOrders = (customerId: string) => {
    return orders.filter((o) => o.customerId === customerId);
  };

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center bg-[#1b2a3a]">
            <span className="text-sm font-bold text-[#a879c6]">
              {customer.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-[#e5e5e5]">{customer.name}</p>
            <p className="text-xs text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{customer.companyName}</span>
        </div>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      render: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{customer.totalOrders}</span>
        </div>
      ),
    },
    {
      key: "spent",
      header: "Total Spent",
      render: (customer: Customer) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{customer.totalSpent.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "lastOrder",
      header: "Last Order",
      render: (customer: Customer) => (
        <span className="text-sm text-muted-foreground">
          {customer.lastOrderDate || "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (customer: Customer) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCustomer(customer);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout title="Customers" subtitle="Manage your B2B customer relationships">
      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#9b5796]"></span>
        {filteredCustomers.length} customer(s) found
      </p>

      {/* Customers Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        onRowClick={(customer) => setSelectedCustomer(customer)}
        emptyMessage="No customers found"
      />

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl bg-[#121c26] border-[#1b2a3a] rounded-[24px] shadow-2xl p-6 overflow-hidden">
          {/* Decorative background glow behind modal */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#9b5796]/10 blur-[100px] rounded-full pointer-events-none" />

          <DialogHeader className="mb-2 z-10 relative">
            <DialogTitle className="text-xl font-bold text-[#e5e5e5]">Customer Details</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 z-10 relative">
              {/* Header Section - Avatar and Contact Info */}
              <div className="flex gap-5 p-5 bg-[#1b2a3a] rounded-[16px] border border-[#a879c6]/20">
                {/* Avatar */}
                <div
                  className="h-[72px] w-[72px] rounded-full flex items-center justify-center shrink-0 border border-[#a879c6]/30 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(155,87,150,0.15), rgba(86,72,153,0.15))' }}
                >
                  <span className="text-3xl font-bold text-[#a879c6]">
                    {selectedCustomer.name.charAt(0)}
                  </span>
                </div>
                {/* Contact Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {selectedCustomer.companyName}
                  </p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{selectedCustomer.email}</span>
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      {selectedCustomer.phone}
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{selectedCustomer.address}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics Section - Three equal stat cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-5 bg-[#1b2a3a] border border-[#a879c6]/10 rounded-[16px] text-center hover:border-[#a879c6]/30 transition-colors">
                  <p className="text-xs text-[#a0b3c2] uppercase font-bold tracking-wider mb-2">Total Orders</p>
                  <p className="text-[28px] font-bold text-[#e5e5e5] leading-none">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="p-5 bg-[#1b2a3a] border border-[#a879c6]/10 rounded-[16px] text-center hover:border-[#a879c6]/30 transition-colors relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#9b5796]/10 blur-xl rounded-full" />
                  <p className="text-xs text-[#a0b3c2] uppercase font-bold tracking-wider mb-2">Total Spent</p>
                  <p className="text-[28px] font-bold text-[#a879c6] leading-none drop-shadow-[0_0_10px_rgba(168,121,198,0.3)]">
                    ${selectedCustomer.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="p-5 bg-[#1b2a3a] border border-[#a879c6]/10 rounded-[16px] text-center hover:border-[#a879c6]/30 transition-colors">
                  <p className="text-xs text-[#a0b3c2] uppercase font-bold tracking-wider mb-2">Customer Since</p>
                  <p className="text-xl font-bold text-[#e5e5e5] mt-1.5">{selectedCustomer.createdAt}</p>
                </div>
              </div>

              {/* History Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
                {/* Quote History */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#a879c6] border-b border-[#a879c6]/20 pb-2 flex items-center gap-2">
                    Quote History
                  </h4>
                  <div className="space-y-2">
                    {getCustomerQuotes(selectedCustomer.id).length > 0 ? (
                      getCustomerQuotes(selectedCustomer.id)
                        .slice(0, 3)
                        .map((quote) => (
                          <div
                            key={quote.id}
                            className="flex items-center justify-between p-3 bg-[#1b2a3a]/50 border border-[#a879c6]/10 rounded-xl text-sm hover:bg-[#1b2a3a] transition-colors"
                          >
                            <span className="font-mono text-[#a0b3c2]">{quote.id}</span>
                            <span className="text-xs text-[#5e5e5e]">{quote.requestedDate}</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-2 italic font-medium">No quotes yet</p>
                    )}
                  </div>
                </div>

                {/* Order History */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#a879c6] border-b border-[#a879c6]/20 pb-2 flex items-center gap-2">
                    Order History
                  </h4>
                  <div className="space-y-2">
                    {getCustomerOrders(selectedCustomer.id).length > 0 ? (
                      getCustomerOrders(selectedCustomer.id)
                        .slice(0, 3)
                        .map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 bg-[#1b2a3a]/50 border border-[#a879c6]/10 rounded-xl text-sm hover:bg-[#1b2a3a] transition-colors"
                          >
                            <span className="font-mono text-[#a0b3c2]">{order.id}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-[#e5e5e5]">${order.totalAmount.toLocaleString()}</span>
                              <span className="text-xs text-[#5e5e5e]">{order.orderDate}</span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-2 italic font-medium">No orders yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
