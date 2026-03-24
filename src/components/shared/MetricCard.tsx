import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
        'relative overflow-hidden rounded-xl p-4 transition-all duration-300 text-left w-full h-full group flex flex-col',
        'border border-white/[0.06]',
        'hover:-translate-y-1 hover:border-primary/20',
        href && 'cursor-pointer'
      )}
      style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
      onClick={href ? () => navigate(href) : undefined}
    >
      {/* Gradient accent line */}
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(0 72% 51%), hsl(32 95% 52%), transparent)' }} />
      )}

      {/* Ambient glow on hover */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(0 72% 51% / 0.12), transparent 70%)' }} />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">{title}</span>
          {Icon && (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/[0.06] group-hover:border-primary/20 group-hover:bg-primary/[0.06]" style={{ background: 'hsl(220 14% 12%)' }}>
              <Icon size={16} className="text-steel group-hover:text-primary transition-colors duration-300" />
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2 mt-auto">
          <motion.span
            className="text-2xl font-display font-bold tabular-nums text-foreground"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {value}
          </motion.span>
          {trend && (
            <span className={cn(
              'text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full',
              trendDown ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
            )}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-[11px] text-steel mt-1.5 min-h-[1rem]">{subtitle ?? '\u00A0'}</p>
      </div>
    </Wrapper>
  );
};
