import { cn } from '@/lib/utils';

type StatusType = 'Active' | 'Pending' | 'Inactive' | 'Critical' | 'Warning' | 'Good' |
  'Approved' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled' |
  'Draft' | 'Submitted' | 'Under Review' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired' |
  'Requested' | 'Confirmed' | 'Completed' | 'Available' | 'Low Stock' | 'Out of Stock' | 'Custom Order' |
  'Scheduled' | 'Emergency' | 'Inspection' | string;

const statusStyles: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Good: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Delivered: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Accepted: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Confirmed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Available: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Under Review': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Requested: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Low Stock': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Submitted: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  'In Production': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Sent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Viewed: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Shipped: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Scheduled: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  Rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
  'Out of Stock': 'text-red-400 bg-red-500/10 border-red-500/20',
  Emergency: 'text-red-400 bg-red-500/10 border-red-500/20',
  Cancelled: 'text-steel bg-white/[0.04] border-white/[0.08]',
  Inactive: 'text-steel bg-white/[0.04] border-white/[0.08]',
  Expired: 'text-steel bg-white/[0.04] border-white/[0.08]',
  Draft: 'text-steel bg-white/[0.04] border-white/[0.08]',
  'Custom Order': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Inspection: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Standard: 'text-steel bg-white/[0.04] border-white/[0.08]',
  Custom: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

export const StatusBadge = ({ status, breathing = false, className }: { status: StatusType; breathing?: boolean; className?: string }) => {
  const style = statusStyles[status] || 'text-steel bg-white/[0.04] border-white/[0.08]';
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-[0.1em] border transition-colors',
        style,
        breathing && (status === 'Critical' || status === 'Emergency') && 'animate-breathing',
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'Critical' || status === 'Rejected' || status === 'Out of Stock' || status === 'Emergency' ? 'bg-red-400' :
          status === 'Pending' || status === 'Warning' || status === 'Under Review' || status === 'Requested' || status === 'Low Stock' ? 'bg-amber-400' :
            status === 'Active' || status === 'Good' || status === 'Approved' || status === 'Delivered' || status === 'Accepted' || status === 'Confirmed' || status === 'Completed' || status === 'Available' ? 'bg-emerald-400' :
              status === 'Submitted' || status === 'In Production' || status === 'Sent' || status === 'Viewed' || status === 'Shipped' || status === 'Scheduled' ? 'bg-sky-400' :
                status === 'Custom Order' || status === 'Inspection' || status === 'Custom' ? 'bg-violet-400' :
                  'bg-steel'
      )} />
      {status}
    </span>
  );
};
