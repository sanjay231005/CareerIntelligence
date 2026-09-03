import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import EmptyState from '@/components/features/EmptyState';
import { Button } from '@/components/ui/button';
import { getAllParticipants, getAllActionItems } from '@/lib/storage';
import type { Participant, ActionItem } from '@/types';

export default function Participants() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    setParticipants(getAllParticipants());
    setActionItems(getAllActionItems());
  }, []);

  // Deduplicate by name (case-insensitive)
  const unique = participants.reduce((acc, p) => {
    const key = p.name.toLowerCase();
    if (!acc.find(x => x.name.toLowerCase() === key)) acc.push(p);
    return acc;
  }, [] as Participant[]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Participants</h1>
        <p className="page-subtitle">{unique.length} unique participant{unique.length !== 1 ? 's' : ''} identified</p>
      </div>

      {unique.length === 0 ? (
        <div className="section-card">
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="No participants identified yet"
            description="Participants are automatically extracted from meeting transcripts during AI processing. Process a meeting to see participants here."
            action={<Button onClick={() => navigate('/upload')} className="gradient-primary text-white border-0">Upload Meeting</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unique.map(p => {
            const assigned = actionItems.filter(a => a.assignedTo === p.name);
            const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
            const colorIdx = p.name.charCodeAt(0) % colors.length;
            return (
              <div key={p.id} className="section-card p-5 hover:-translate-y-0.5 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${colors[colorIdx]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {p.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role}</p>
                  </div>
                </div>
                {p.responsibilities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Responsibilities</p>
                    <ul className="space-y-1">
                      {p.responsibilities.slice(0, 2).map((r, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span className="line-clamp-1">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {assigned.length} assigned task{assigned.length !== 1 ? 's' : ''}
                  </p>
                  {assigned.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {assigned.slice(0, 2).map(a => (
                        <div key={a.id} className="text-xs bg-muted rounded-lg px-2.5 py-1.5 line-clamp-1">{a.task}</div>
                      ))}
                      {assigned.length > 2 && (
                        <p className="text-xs text-muted-foreground pl-1">+{assigned.length - 2} more</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
