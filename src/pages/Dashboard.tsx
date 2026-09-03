import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Video, FileText, Brain, BarChart2, CheckSquare } from 'lucide-react';
import StatCard from '@/components/features/StatCard';
import EmptyState from '@/components/features/EmptyState';
import { Button } from '@/components/ui/button';
import { getStats, getMeetings } from '@/lib/storage';
import { formatDateTime } from '@/lib/utils';
import SentimentBadge from '@/components/features/SentimentBadge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import type { AppStats, Meeting } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AppStats>(getStats);
  const [meetings, setMeetings] = useState<Meeting[]>(getMeetings);

  useEffect(() => {
    const refresh = () => { setStats(getStats()); setMeetings(getMeetings()); };
    refresh();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const hasSentiment = stats.sentimentPositive + stats.sentimentNegative + stats.sentimentNeutral > 0;
  const sentimentData = hasSentiment ? [
    { name: 'Positive', value: stats.sentimentPositive, color: '#10b981' },
    { name: 'Negative', value: stats.sentimentNegative, color: '#f43f5e' },
    { name: 'Neutral', value: stats.sentimentNeutral, color: '#94a3b8' },
  ] : [];

  const recentMeetings = [...meetings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="page-content">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Dashboard
          </h1>
          <p className="page-subtitle">Real-time meeting intelligence overview</p>
        </div>
        <Button onClick={() => navigate('/upload')} className="gradient-primary text-white border-0">
          + Upload Meeting
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Meetings" value={stats.totalMeetings} icon={<Video className="w-5 h-5" />} iconColor="bg-blue-500/10 text-blue-500" />
        <StatCard label="Transcripts" value={stats.totalTranscripts} icon={<FileText className="w-5 h-5" />} iconColor="bg-violet-500/10 text-violet-500" />
        <StatCard label="Action Items" value={stats.totalActionItems} icon={<CheckSquare className="w-5 h-5" />} iconColor="bg-amber-500/10 text-amber-500" />
        <StatCard label="Participants" value={stats.totalParticipants} icon={<Brain className="w-5 h-5" />} iconColor="bg-emerald-500/10 text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Meetings */}
        <div className="lg:col-span-2 section-card">
          <div className="section-header">
            <h2 className="section-title">Recent Meetings</h2>
            {meetings.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/transcripts')}>View all</Button>
            )}
          </div>
          {recentMeetings.length === 0 ? (
            <EmptyState
              icon={<Video className="w-8 h-8" />}
              title="No meetings yet"
              description="Upload your first meeting to generate intelligence. Your dashboard will populate with real data after processing."
              action={
                <Button onClick={() => navigate('/upload')} className="gradient-primary text-white border-0">
                  Upload Meeting
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {recentMeetings.map(m => (
                <div
                  key={m.id}
                  className="px-6 py-4 hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between group"
                  onClick={() => navigate(m.status === 'processed' ? `/intelligence/${m.id}` : `/transcripts/${m.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{m.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(m.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {m.intelligence?.sentiment && (
                      <SentimentBadge label={m.intelligence.sentiment.label} />
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${m.status === 'processed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        m.status === 'transcribed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-muted text-muted-foreground'}`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sentiment Summary */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Sentiment
            </h2>
          </div>
          {!hasSentiment ? (
            <EmptyState
              icon={<BarChart2 className="w-7 h-7" />}
              title="No data available yet"
              description="Sentiment analysis will appear after you process meetings."
              className="py-10"
            />
          ) : (
            <div className="p-6">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {sentimentData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} meeting${Number(v) !== 1 ? 's' : ''}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {sentimentData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
