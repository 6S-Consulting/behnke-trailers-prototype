import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { StatusBadge } from "@/admin/components/admin/StatusBadge";
import { useAdmin, CRITICAL_MARGIN } from "@/admin/context/AdminContext";
import { QuoteStatus } from "@/data/quotes";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Textarea } from "@/admin/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  Building2,
  User,
  Package,
  DollarSign,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { cn } from "@/admin/lib/utils";

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in-review", label: "In Review" },
  { value: "quoted", label: "Quoted" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed", label: "Closed" },
];

export default function QuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotes, setQuotes, products, globalSteelIndex } = useAdmin();

  const quote = quotes.find((q) => q.id === id);

  const [status, setStatus] = useState<QuoteStatus>(quote?.status || "new");
  const [quotedPrice, setQuotedPrice] = useState<string>(quote?.quotedPrice?.toString() || "");
  const [internalNotes, setInternalNotes] = useState(quote?.internalNotes || "");

  // Calculate real-time margin
  const marginInfo = useMemo(() => {
    if (!quote || !quotedPrice) return null;

    const price = parseFloat(quotedPrice);
    if (isNaN(price) || price <= 0) return null;

    let totalCost = 0;
    quote.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const baseCost = product?.baseCost || product?.price || 0;
      totalCost += baseCost * globalSteelIndex * item.quantity;
    });

    const margin = (price - totalCost) / price;
    const isCritical = margin < CRITICAL_MARGIN;

    return {
      margin,
      marginPercent: (margin * 100).toFixed(1),
      totalCost,
      isCritical,
    };
  }, [quote, quotedPrice, products, globalSteelIndex]);

  if (!quote) {
    return (
      <AdminLayout title="Quote Not Found">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">Quote request not found</p>
          <Button onClick={() => navigate("/admin/quotes")}>Back to Quotes</Button>
        </div>
      </AdminLayout>
    );
  }

  const handleSave = () => {
    setQuotes(
      quotes.map((q) =>
        q.id === id
          ? {
            ...q,
            status,
            quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
            internalNotes,
            updatedAt: new Date().toISOString().split("T")[0],
          }
          : q
      )
    );
    navigate("/admin/quotes");
  };

  return (
    <AdminLayout
      title={`Quote ${quote.id}`}
      subtitle={`From ${quote.companyName}`}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/quotes")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Quotes
        </Button>
        <div className="flex items-center gap-2">
          <StatusBadge status={quote.status} />
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="form-section">
            <h3 className="form-section-title">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm" style={{ background: 'rgba(168,121,198,0.12)', border: '1px solid rgba(168,121,198,0.2)' }}>
                  <User className="h-5 w-5" style={{ color: '#a879c6' }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact Name</p>
                  <p className="font-medium">{quote.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm" style={{ background: 'rgba(168,121,198,0.12)', border: '1px solid rgba(168,121,198,0.2)' }}>
                  <Building2 className="h-5 w-5" style={{ color: '#a879c6' }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="font-medium">{quote.companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm" style={{ background: 'rgba(79,106,175,0.12)', border: '1px solid rgba(79,106,175,0.2)' }}>
                  <Mail className="h-5 w-5" style={{ color: '#7a9fd4' }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{quote.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm" style={{ background: 'rgba(79,106,175,0.12)', border: '1px solid rgba(79,106,175,0.2)' }}>
                  <Phone className="h-5 w-5" style={{ color: '#7a9fd4' }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{quote.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requested Products */}
          <div className="form-section">
            <h3 className="form-section-title">Requested Products</h3>
            <div className="space-y-3">
              {quote.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-sm"
                  style={{ background: 'rgba(168,121,198,0.05)', border: '1px solid rgba(168,121,198,0.12)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm" style={{ background: 'rgba(168,121,198,0.15)', border: '1px solid rgba(168,121,198,0.25)' }}>
                      <Package className="h-5 w-5" style={{ color: '#a879c6' }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">ID: {item.productId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{item.quantity}</p>
                    <p className="text-xs text-muted-foreground">units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Requirements */}
          {quote.customRequirements && (
            <div className="form-section">
              <h3 className="form-section-title">Custom Requirements</h3>
              <div className="flex items-start gap-3 p-3 rounded-sm" style={{ background: 'rgba(86,72,153,0.08)', border: '1px solid rgba(86,72,153,0.18)' }}>
                <FileText className="h-5 w-5 mt-0.5" style={{ color: '#a879c6' }} />
                <p className="text-sm">{quote.customRequirements}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="form-section">
            <h3 className="form-section-title">Update Status</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quote Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as QuoteStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={opt.value} />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quotedPrice">Quoted Price ($)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="quotedPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={quotedPrice}
                      onChange={(e) => setQuotedPrice(e.target.value)}
                      placeholder="Enter quoted price"
                      className="pl-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/intelligence/${id}`)}
                    title="Estimate pricing in Simulator"
                    className="gap-2"
                    style={{ borderColor: 'rgba(168,121,198,0.35)', color: '#a879c6' }}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Estimate
                  </Button>
                </div>
              </div>

              {/* Margin Warning Alert */}
              {marginInfo?.isCritical && (
                <div className="mt-4 p-3 rounded-sm border-2 border-red-500 bg-red-500/10 animate-pulse">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-500">Critical Margin Alert</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current margin ({marginInfo.marginPercent}%) is below healthy threshold (15%).
                        Material cost spike detected.
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 gap-2 bg-red-600 hover:bg-red-700"
                        onClick={() => navigate(`/admin/intelligence/${id}`)}
                      >
                        <Brain className="h-4 w-4" />
                        Analyze & Optimize
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="form-section">
            <h3 className="form-section-title">Internal Notes</h3>
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add notes for internal team (not visible to customer)"
              rows={4}
            />
          </div>

          {/* Timeline */}
          <div className="form-section">
            <h3 className="form-section-title">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg,#9b5796,#a879c6,#4f6aaf)' }}>
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requested</p>
                  <p className="text-sm font-medium">{quote.requestedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'rgba(168,121,198,0.12)', border: '1px solid rgba(168,121,198,0.2)' }}>
                  <Clock className="h-4 w-4" style={{ color: '#a879c6' }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">{quote.updatedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
