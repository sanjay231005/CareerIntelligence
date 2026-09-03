import { cn } from '@/lib/utils';
import type { SentimentLabel } from '@/types';

interface SentimentBadgeProps {
  label: SentimentLabel;
  className?: string;
}

export default function SentimentBadge({ label, className }: SentimentBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
      label === 'positive' && 'badge-positive',
      label === 'negative' && 'badge-negative',
      label === 'neutral' && 'badge-neutral',
      className
    )}>
      {label === 'positive' ? '▲' : label === 'negative' ? '▼' : '●'} {label}
    </span>
  );
}
