import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, User } from 'lucide-react';
import EmptyState from '@/components/features/EmptyState';
import StatusBadge from '@/components/features/StatusBadge';
import { Button } from '@/components/ui/button';
import { getAllActionItems, updateActionItemStatus } from '@/lib/storage';
import type { ActionItem, ActionStatus } from '@/types';
import { toast } from 'sonner';

type Filter = 'All' | ActionStatus;
const FILTERS: Filter[] = ['All', 'Pending', 'In Progress', 'Completed', 'Blocked'];

export default function ActionItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => { setItems(getAllActionItems()); }, []);

  const filtered = filter === 'All' ? items : items.filter(i => i.status === filter);

  const handleStatus = (id: string, status: ActionStatus) => {
    updateActionItemStatus(id, status);
    setItems(getAllActionItems());
    toast.success('Status updated');
  };

  return (
    <div className="page-content">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Action Items</h1>
          <p className="page-subtitle">{items.length} total action item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {f}
              {f === 'All' ? ` (${items.length})` : ` (${items.filter(i => i.status === f).length})`}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="section-card">
          <EmptyState
            icon={<CheckSquare className="w-8 h-8" />}
            title="No action items yet"
            description="Action items are automatically extracted from meeting transcripts during AI processing."
            action={<Button onClick={() => navigate('/upload')} className="gradient-primary text-white border-0">Upload Meeting</Button>}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="section-card">
          <EmptyState icon={<CheckSquare className="w-7 h-7" />} title={`No ${filter} items`} description="Try a different filter." className="py-12" />
        </div>
      ) : (
        <div className="section-card">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                <tr>{['Task','Assigned To','Deadline','Priority','Status','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="truncate font-medium" title={item.task}>{item.task}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-muted-foreground" />{item.assignedTo}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.deadline}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge value={item.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge value={item.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={e => handleStatus(item.id, e.target.value as ActionStatus)}
                        className="text-xs border rounded-lg px-2 py-1 bg-card cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50"
                      >
                        {(['Pending', 'In Progress', 'Completed', 'Blocked'] as ActionStatus[]).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {filtered.map(item => (
              <div key={item.id} className="p-4 space-y-3">
                <p className="text-sm font-medium">{item.task}</p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={item.priority} />
                  <StatusBadge value={item.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.assignedTo}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.deadline}</span>
                </div>
                <select
                  value={item.status}
                  onChange={e => handleStatus(item.id, e.target.value as ActionStatus)}
                  className="w-full text-xs border rounded-lg px-2 py-2 bg-card focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {(['Pending', 'In Progress', 'Completed', 'Blocked'] as ActionStatus[]).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
