import { cn } from '@/lib/utils';
import type { ActionStatus, Priority } from '@/types';

interface StatusBadgeProps {
  value: ActionStatus | Priority | 'pass' | 'fail' | 'not_run' | string;
  className?: string;
}

export default function StatusBadge({ value, className }: StatusBadgeProps) {
  const classes: Record<string, string> = {
    'Pending': 'badge-pending',
    'In Progress': 'badge-in-progress',
    'Completed': 'badge-completed',
    'Blocked': 'badge-blocked',
    'High': 'badge-high',
    'Medium': 'badge-medium',
    'Low': 'badge-low',
    'Not specified': 'badge-neutral',
    'pass': 'badge-pass',
    'fail': 'badge-fail',
    'not_run': 'badge-not-run',
  };

  const display: Record<string, string> = {
    'not_run': 'Not Run',
    'pass': 'Pass',
    'fail': 'Fail',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      classes[value] || 'badge-neutral',
      className
    )}>
      {display[value] || value}
    </span>
  );
}
