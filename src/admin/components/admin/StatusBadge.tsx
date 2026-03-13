import { cn } from "@/admin/lib/utils";
import { QuoteStatus } from "@/data/quotes";
import { OrderStatus } from "@/data/orders";

type StatusType = QuoteStatus | OrderStatus | "active" | "draft" | "in-stock" | "out-of-stock" | "low-stock";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Quote statuses — Amber: in-review, new | Blue: negotiation | Green: quoted
  new: { label: "New", className: "text-white" },
  "in-review": { label: "In Review", className: "text-white" },
  quoted: { label: "Quoted", className: "text-white" },
  negotiation: { label: "Negotiation", className: "text-white" },
  closed: { label: "Closed", className: "text-white" },
  // Order statuses — Amber: in-production, received | Blue: confirmed | Green: dispatched
  received: { label: "Received", className: "text-white" },
  confirmed: { label: "Confirmed", className: "text-white" },
  "in-production": { label: "In Production", className: "text-white" },
  dispatched: { label: "Dispatched", className: "text-white" },
  // Product statuses
  active: { label: "Active", className: "text-[#4ade80]" },
  draft: { label: "Draft", className: "text-[#a0b3c2]" },
  // Stock statuses — Amber: low-stock | Green: in-stock | Red: out-of-stock
  "in-stock": { label: "In Stock", className: "text-[#4ade80]" },
  "out-of-stock": { label: "Out of Stock", className: "text-[#c64242]" },
  "low-stock": { label: "Low Stock", className: "text-[#ffc107]" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <span
      className={cn(
        "status-badge",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
