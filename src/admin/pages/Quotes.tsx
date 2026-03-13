import { useState } from "react";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { DataTable } from "@/admin/components/admin/DataTable";
import { StatusBadge } from "@/admin/components/admin/StatusBadge";
import { useAdmin } from "@/admin/context/AdminContext";
import { Quote, QuoteStatus } from "@/data/quotes";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import { Search, Filter, Eye, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Quotes() {
  const { quotes } = useAdmin();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getQuoteCounts = () => {
    return {
      all: quotes.length,
      new: quotes.filter((q) => q.status === "new").length,
      "in-review": quotes.filter((q) => q.status === "in-review").length,
      quoted: quotes.filter((q) => q.status === "quoted").length,
      negotiation: quotes.filter((q) => q.status === "negotiation").length,
      closed: quotes.filter((q) => q.status === "closed").length,
    };
  };

  const counts = getQuoteCounts();

  const columns = [
    {
      key: "id",
      header: "Quote ID",
      render: (quote: Quote) => (
        <span className="font-mono text-sm text-primary">{quote.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (quote: Quote) => (
        <div>
          <p className="font-medium text-foreground">{quote.customerName}</p>
          <p className="text-xs text-muted-foreground">{quote.companyName}</p>
        </div>
      ),
    },
    {
      key: "products",
      header: "Products",
      render: (quote: Quote) => (
        <div>
          <p className="text-sm text-foreground">{quote.items.length} item(s)</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {quote.items.map((i) => i.productName).join(", ")}
          </p>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      render: (quote: Quote) => (
        <span className="text-sm">{quote.items.reduce((sum, i) => sum + i.quantity, 0)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (quote: Quote) => <StatusBadge status={quote.status} />,
    },
    {
      key: "date",
      header: "Requested",
      render: (quote: Quote) => (
        <span className="text-sm text-muted-foreground">{quote.requestedDate}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (quote: Quote) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/quotes/${quote.id}`);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout title="Quote Requests" subtitle="Manage B2B quote requests from customers">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "new", "in-review", "quoted", "negotiation", "closed"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="gap-2"
          >
            {status === "all" ? "All" : <StatusBadge status={status as QuoteStatus} />}
            <span className="text-xs opacity-70">({counts[status]})</span>
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, customer, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredQuotes.length} quote request(s)
      </p>

      {/* Quotes Table */}
      <DataTable
        columns={columns}
        data={filteredQuotes}
        onRowClick={(quote) => navigate(`/admin/quotes/${quote.id}`)}
        emptyMessage="No quote requests found"
      />
    </AdminLayout>
  );
}
