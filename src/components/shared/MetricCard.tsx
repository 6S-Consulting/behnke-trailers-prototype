import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  accent?: boolean;
}

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, accent = true }: MetricCardProps) => {
  return (
    <div className={cn(
      'bg-card border border-white/5 rounded-lg shadow-industrial p-4 transition-all duration-300 hover:border-primary/30',
      accent && 'border-t-primary'
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{title}</span>
        {Icon && <Icon size={16} className="text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-display font-bold tabular-nums text-foreground">{value}</span>
        {trend && <span className="text-xs text-success font-medium">{trend}</span>}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
};
