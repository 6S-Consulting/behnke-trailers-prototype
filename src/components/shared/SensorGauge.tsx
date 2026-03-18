import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SensorGaugeProps {
  label: string;
  value: number;
  unit: string;
  status: 'Good' | 'Warning' | 'Critical';
  min?: number;
  max?: number;
}

export const SensorGauge = ({ label, value, unit, status, min = 0, max = 100 }: SensorGaugeProps) => {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const color = status === 'Critical' ? 'text-danger' : status === 'Warning' ? 'text-warning' : 'text-success';
  const barColor = status === 'Critical' ? 'bg-danger' : status === 'Warning' ? 'bg-warning' : 'bg-success';

  return (
    <div className="bg-card p-4 rounded-lg shadow-industrial border-t-2 border-muted">
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className={cn('text-[10px] font-mono uppercase font-bold', color)}>{status}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className={cn('text-3xl font-display font-bold tabular-nums', color)}>{value}</span>
        <span className="text-xs text-muted-foreground font-medium">{unit}</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn('h-full rounded-full', barColor)}
        />
      </div>
    </div>
  );
};
