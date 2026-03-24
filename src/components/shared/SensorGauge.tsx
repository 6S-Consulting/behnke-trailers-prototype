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

const statusColors = {
  Good: { text: 'text-emerald-400', bar: 'from-emerald-500 to-emerald-400', glow: 'hsl(152 69% 53% / 0.15)' },
  Warning: { text: 'text-amber-400', bar: 'from-amber-500 to-amber-400', glow: 'hsl(38 92% 50% / 0.15)' },
  Critical: { text: 'text-red-400', bar: 'from-red-500 to-red-400', glow: 'hsl(0 72% 51% / 0.15)' },
};

export const SensorGauge = ({ label, value, unit, status, min = 0, max = 100 }: SensorGaugeProps) => {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const sc = statusColors[status];

  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 border border-white/[0.06] group transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}
    >
      {/* Status glow */}
      <div
        className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none transition-opacity"
        style={{ background: `radial-gradient(circle, ${sc.glow}, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-steel">{label}</span>
          <span className={cn('text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border', sc.text,
            status === 'Good' && 'bg-emerald-500/10 border-emerald-500/20',
            status === 'Warning' && 'bg-amber-500/10 border-amber-500/20',
            status === 'Critical' && 'bg-red-500/10 border-red-500/20'
          )}>{status}</span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-4">
          <motion.span
            className={cn('text-3xl font-display font-bold tabular-nums', sc.text)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {value}
          </motion.span>
          <span className="text-xs text-steel font-medium">{unit}</span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'hsl(220 14% 14%)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn('h-full rounded-full bg-gradient-to-r', sc.bar)}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[9px] font-mono text-steel/50">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  );
};
