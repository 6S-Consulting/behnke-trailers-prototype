import { cn } from '@/lib/utils';

type StatusType = 'Active' | 'Pending' | 'Inactive' | 'Critical' | 'Warning' | 'Good' |
  'Approved' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled' |
  'Draft' | 'Submitted' | 'Under Review' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired' |
  'Requested' | 'Confirmed' | 'Completed' | 'Available' | 'Low Stock' | 'Out of Stock' | 'Custom Order' |
  'Scheduled' | 'Emergency' | 'Inspection' | string;

const statusStyles: Record<string, string> = {
  Active: 'bg-success/15 text-success',
  Good: 'bg-success/15 text-success',
  Approved: 'bg-success/15 text-success',
  Delivered: 'bg-success/15 text-success',
  Accepted: 'bg-success/15 text-success',
  Confirmed: 'bg-success/15 text-success',
  Completed: 'bg-success/15 text-success',
  Available: 'bg-success/15 text-success',
  Pending: 'bg-warning/15 text-warning',
  Warning: 'bg-warning/15 text-warning',
  'Under Review': 'bg-warning/15 text-warning',
  Requested: 'bg-warning/15 text-warning',
  'Low Stock': 'bg-warning/15 text-warning',
  Submitted: 'bg-primary/15 text-primary',
  'In Production': 'bg-primary/15 text-primary',
  Sent: 'bg-primary/15 text-primary',
  Viewed: 'bg-primary/15 text-primary',
  Shipped: 'bg-primary/15 text-primary',
  Scheduled: 'bg-primary/15 text-primary',
  Critical: 'bg-danger/15 text-danger',
  Rejected: 'bg-danger/15 text-danger',
  'Out of Stock': 'bg-danger/15 text-danger',
  Emergency: 'bg-danger/15 text-danger',
  Cancelled: 'bg-muted text-muted-foreground',
  Inactive: 'bg-muted text-muted-foreground',
  Expired: 'bg-muted text-muted-foreground',
  Draft: 'bg-muted text-muted-foreground',
  'Custom Order': 'bg-secondary text-secondary-foreground',
  Inspection: 'bg-secondary text-secondary-foreground',
};

export const StatusBadge = ({ status, breathing = false, className }: { status: StatusType; breathing?: boolean; className?: string }) => {
  const style = statusStyles[status] || 'bg-muted text-muted-foreground';
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold font-display uppercase tracking-[0.1em]',
        style,
        breathing && (status === 'Critical' || status === 'Emergency') && 'animate-breathing',
        className
      )}
    >
      {status}
    </span>
  );
};
