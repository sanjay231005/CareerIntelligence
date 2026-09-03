import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Users, CheckSquare, Lightbulb, ArrowLeft, Target, Clock } from 'lucide-react';
import EmptyState from '@/components/features/EmptyState';
import SentimentBadge from '@/components/features/SentimentBadge';
import StatusBadge from '@/components/features/StatusBadge';
import { Button } from '@/components/ui/button';
import { getMeetings, getMeeting } from '@/lib/storage';
import { formatDateTime } from '@/lib/utils';
import type { Meeting } from '@/types';

function IntelligenceDetail({ meeting }: { meeting: Meeting }) {
  const intel = meeting.intelligence!;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="section-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{meeting.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{formatDateTime(meeting.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            {intel.sentiment && <SentimentBadge label={intel.sentiment.label} />}
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">Processed</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t">
          <div><p className="text-xs text-muted-foreground">Duration</p><p className="text-sm font-semibold mt-0.5">{meeting.duration}</p></div>
          <div><p className="text-xs text-muted-foreground">Participants</p><p className="text-sm font-semibold mt-0.5">{intel.participants.length}</p></div>
          <div><p className="text-xs text-muted-foreground">Action Items</p><p className="text-sm font-semibold mt-0.5">{intel.actionItems.length}</p></div>
          <div><p className="text-xs text-muted-foreground">Key Points</p><p className="text-sm font-semibold mt-0.5">{intel.keyPoints.length}</p></div>
        </div>
      </div>

      {/* Summary */}
      <div className="section-card">
        <div className="section-header"><h3 className="section-title flex items-center gap-2"><Brain className="w-4 h-4 text-primary" />Summary</h3></div>
        <div className="section-body">
          <p className="text-sm leading-relaxed text-foreground/80">{intel.summary}</p>
        </div>
      </div>

      {/* Key Points */}
      <div className="section-card">
        <div className="section-header"><h3 className="section-title flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" />Key Points</h3></div>
        <div className="section-body">
          {intel.keyPoints.length === 0
            ? <p className="text-sm text-muted-foreground">No key points identified.</p>
            : <ol className="space-y-3">{intel.keyPoints.map((kp, i) => (
                <li key={kp.id} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm leading-relaxed">{kp.text}</p>
                </li>
              ))}</ol>
          }
        </div>
      </div>

      {/* Decisions */}
      <div className="section-card">
        <div className="section-header"><h3 className="section-title flex items-center gap-2"><Target className="w-4 h-4 text-violet-500" />Decisions</h3></div>
        <div className="section-body">
          {intel.decisions.length === 0
            ? <p className="text-sm text-muted-foreground">No decisions were identified.</p>
            : <ul className="space-y-2">{intel.decisions.map(d => (
                <li key={d.id} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                  {d.text}
                </li>
              ))}</ul>
          }
        </div>
      </div>

      {/* Action Items */}
      <div className="section-card">
        <div className="section-header"><h3 className="section-title flex items-center gap-2"><CheckSquare className="w-4 h-4 text-emerald-500" />Action Items</h3></div>
        {intel.actionItems.length === 0
          ? <div className="section-body"><p className="text-sm text-muted-foreground">No action items identified.</p></div>
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                  <tr>{['Task','Assigned To','Deadline','Priority','Status'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {intel.actionItems.map(a => (
                    <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 max-w-[200px]"><p className="truncate" title={a.task}>{a.task}</p></td>
                      <td className="px-4 py-3 whitespace-nowrap">{a.assignedTo}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{a.deadline}</td>
                      <td className="px-4 py-3"><StatusBadge value={a.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge value={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {/* Participants */}
      <div className="section-card">
        <div className="section-header"><h3 className="section-title flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" />Participants</h3></div>
        {intel.participants.length === 0
          ? <div className="section-body"><p className="text-sm text-muted-foreground">No participants identified.</p></div>
          : <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {intel.participants.map(p => (
                <div key={p.id} className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {p.name[0]}
                    </div>
                    <div><p className="text-sm font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.role}</p></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.actionItemIds.length} action item{p.actionItemIds.length !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

export default function MeetingIntelligence() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selected, setSelected] = useState<Meeting | null>(null);

  useEffect(() => {
    const all = getMeetings().filter(m => m.status === 'processed');
    setMeetings(all);
    if (id) {
      const m = getMeeting(id);
      if (m?.status === 'processed') setSelected(m);
    } else if (all.length > 0) {
      setSelected(all[all.length - 1]);
    }
  }, [id]);

  return (
    <div className="page-content">
      <div className="page-header flex items-center gap-3">
        {id && (
          <Button variant="ghost" size="icon" onClick={() => navigate('/intelligence')} className="rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h1 className="page-title">Meeting Intelligence</h1>
          <p className="page-subtitle">AI-extracted insights from processed meetings</p>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="section-card">
          <EmptyState
            icon={<Brain className="w-8 h-8" />}
            title="No intelligence yet"
            description="Upload and process a meeting to generate AI intelligence including summaries, key points, decisions, action items, and participant mapping."
            action={<Button onClick={() => navigate('/upload')} className="gradient-primary text-white border-0">Upload Meeting</Button>}
          />
        </div>
      ) : !selected ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map(m => (
            <div key={m.id} onClick={() => navigate(`/intelligence/${m.id}`)}
              className="section-card p-5 cursor-pointer hover:-translate-y-0.5 transition-all hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <Brain className="w-5 h-5 text-primary" />
                {m.intelligence?.sentiment && <SentimentBadge label={m.intelligence.sentiment.label} />}
              </div>
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{m.title}</h3>
              <p className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</p>
              <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                <span>{m.intelligence?.actionItems.length || 0} actions</span>
                <span>{m.intelligence?.participants.length || 0} participants</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <IntelligenceDetail meeting={selected} />
      )}
    </div>
  );
}
