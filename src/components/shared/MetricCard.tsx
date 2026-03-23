import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  accent?: boolean;
  href?: string;
  trendDown?: boolean;
}

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, accent = true, href, trendDown }: MetricCardProps) => {
  const navigate = useNavigate();
  const Wrapper = href ? 'button' : 'div';
  return (
    <Wrapper
      className={cn(
        'bg-card border border-white/5 rounded-lg shadow-industrial p-4 transition-all duration-300 hover:border-primary/30 text-left w-full',
        accent && 'border-t-primary',
        href && 'cursor-pointer hover:bg-card/80'
      )}
      onClick={href ? () => navigate(href) : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{title}</span>
        {Icon && <Icon size={16} className="text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-display font-bold tabular-nums text-foreground">{value}</span>
        {trend && <span className={cn('text-xs font-medium', trendDown ? 'text-danger' : 'text-success')}>{trend}</span>}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </Wrapper>
  );
};
