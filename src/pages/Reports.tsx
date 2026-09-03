import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileBarChart, Download, Printer } from 'lucide-react';
import EmptyState from '@/components/features/EmptyState';
import StatusBadge from '@/components/features/StatusBadge';
import SentimentBadge from '@/components/features/SentimentBadge';
import { Button } from '@/components/ui/button';
import { getMeetings, getTranscript, getActionItems, getParticipants } from '@/lib/storage';
import { formatDateTime, downloadText, downloadCSV } from '@/lib/utils';
import type { Meeting } from '@/types';

export default function Reports() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    const all = getMeetings().filter(m => m.status === 'processed');
    setMeetings(all);
    if (all.length > 0) setSelected(all[all.length - 1].id);
  }, []);

  const meeting = meetings.find(m => m.id === selected);

  const generateTextReport = () => {
    if (!meeting) return;
    const t = getTranscript(meeting.id);
    const a = getActionItems(meeting.id);
    const p = getParticipants(meeting.id);
    const intel = meeting.intelligence!;

    const lines = [
      `AI CAREER INTELLIGENCE PLATFORM - MEETING REPORT`,
      `${'='.repeat(50)}`,
      ``,
      `MEETING INFORMATION`,
      `Title: ${meeting.title}`,
      `Date: ${formatDateTime(meeting.createdAt)}`,
      `Duration: ${meeting.duration}`,
      `Status: ${meeting.status}`,
      ``,
      `SUMMARY`,
      intel.summary,
      ``,
      `KEY POINTS`,
      ...intel.keyPoints.map((kp, i) => `${i + 1}. ${kp.text}`),
      ``,
      `DECISIONS`,
      ...(intel.decisions.length ? intel.decisions.map(d => `• ${d.text}`) : ['No decisions identified.']),
      ``,
      `ACTION ITEMS`,
      ...a.map(ai => `• ${ai.task} | ${ai.assignedTo} | ${ai.deadline} | ${ai.priority} | ${ai.status}`),
      ``,
      `PARTICIPANTS`,
      ...p.map(pt => `• ${pt.name} (${pt.role})`),
      ``,
      `SENTIMENT ANALYSIS`,
      `Label: ${intel.sentiment.label}`,
      `Positive: ${(intel.sentiment.positive * 100).toFixed(1)}%`,
      `Negative: ${(intel.sentiment.negative * 100).toFixed(1)}%`,
      `Neutral: ${(intel.sentiment.neutral * 100).toFixed(1)}%`,
      `Compound: ${intel.sentiment.compound}`,
      ``,
      `TRANSCRIPT`,
      t?.content || 'Not available.',
    ];
    downloadText(lines.join('\n'), `${meeting.title}-report.txt`);
  };

  const exportCSV = () => {
    if (!meeting) return;
    const a = getActionItems(meeting.id);
    downloadCSV(a.map(x => ({
      Task: x.task, AssignedTo: x.assignedTo, Deadline: x.deadline,
      Priority: x.priority, Status: x.status
    })), `${meeting.title}-actions.csv`);
  };

  return (
    <div className="page-content">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate reports from processed meetings</p>
        </div>
        {meeting && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
            </Button>
            <Button size="sm" onClick={generateTextReport} className="gradient-primary text-white border-0">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download Report
            </Button>
          </div>
        )}
      </div>

      {meetings.length === 0 ? (
        <div className="section-card">
          <EmptyState
            icon={<FileBarChart className="w-8 h-8" />}
            title="No reports available"
            description="Reports are generated from processed meetings. Process a meeting to generate your first report."
            action={<Button onClick={() => navigate('/upload')} className="gradient-primary text-white border-0">Upload Meeting</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Meeting List */}
          <div className="section-card lg:col-span-1 h-fit">
            <div className="section-header"><h2 className="section-title">Meetings</h2></div>
            <div className="divide-y divide-border">
              {meetings.map(m => (
                <button key={m.id} onClick={() => setSelected(m.id)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/40 ${selected === m.id ? 'bg-primary/10 border-r-2 border-primary' : ''}`}>
                  <p className="text-sm font-medium line-clamp-2">{m.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(m.createdAt)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Report Detail */}
          {meeting && (() => {
            const t = getTranscript(meeting.id);
            const a = getActionItems(meeting.id);
            const p = getParticipants(meeting.id);
            const intel = meeting.intelligence!;
            return (
              <div className="lg:col-span-3 space-y-5">
                {/* Header card */}
                <div className="section-card p-6">
                  <div className="flex flex-wrap gap-3 items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{meeting.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{formatDateTime(meeting.createdAt)} · {meeting.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <SentimentBadge label={intel.sentiment.label} />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">Processed</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t text-center">
                    {[['Participants', p.length], ['Action Items', a.length], ['Key Points', intel.keyPoints.length], ['Decisions', intel.decisions.length]].map(([l, v]) => (
                      <div key={String(l)}>
                        <p className="text-2xl font-bold">{v}</p>
                        <p className="text-xs text-muted-foreground mt-1">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="section-card"><div className="section-header"><h3 className="section-title">Summary</h3></div>
                  <div className="section-body"><p className="text-sm leading-relaxed text-foreground/80">{intel.summary}</p></div>
                </div>

                {/* Action Items */}
                {a.length > 0 && (
                  <div className="section-card"><div className="section-header"><h3 className="section-title">Action Items</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                          <tr>{['Task','Assigned To','Deadline','Priority','Status'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {a.map(ai => (
                            <tr key={ai.id} className="hover:bg-muted/20">
                              <td className="px-4 py-3 text-sm max-w-[180px] truncate">{ai.task}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{ai.assignedTo}</td>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{ai.deadline}</td>
                              <td className="px-4 py-3"><StatusBadge value={ai.priority} /></td>
                              <td className="px-4 py-3"><StatusBadge value={ai.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sentiment Detail */}
                <div className="section-card"><div className="section-header"><h3 className="section-title">Sentiment Analysis</h3></div>
                  <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Positive', value: `${(intel.sentiment.positive * 100).toFixed(1)}%`, color: 'text-emerald-500' },
                      { label: 'Negative', value: `${(intel.sentiment.negative * 100).toFixed(1)}%`, color: 'text-rose-500' },
                      { label: 'Neutral', value: `${(intel.sentiment.neutral * 100).toFixed(1)}%`, color: 'text-slate-500' },
                      { label: 'Compound', value: intel.sentiment.compound.toFixed(4), color: 'text-primary' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl border bg-muted/30 p-4 text-center">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
