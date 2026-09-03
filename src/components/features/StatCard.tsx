import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconColor?: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export default function StatCard({ label, value, icon, iconColor, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn('stat-card group', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-1.5 tracking-tight">{value}</p>
          {trend && (
            <p className={cn('text-xs mt-1.5 font-medium', trendUp ? 'text-emerald-500' : 'text-muted-foreground')}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconColor || 'bg-primary/10 text-primary')}>
          {icon}
        </div>
      </div>
    </div>
  );
}
