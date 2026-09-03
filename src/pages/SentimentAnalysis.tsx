import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import EmptyState from '@/components/features/EmptyState';
import { Button } from '@/components/ui/button';
import { getMeetings } from '@/lib/storage';
import { analyzeSentiment } from '@/lib/sentiment';
import { formatDateTime } from '@/lib/utils';
import type { Meeting } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

export default function SentimentAnalysis() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    setMeetings(getMeetings().filter(m => m.intelligence?.sentiment));
  }, []);

  const aggregated = meetings.reduce(
    (acc, m) => {
      const s = m.intelligence!.sentiment;
      return {
        positive: acc.positive + s.positive,
        negative: acc.negative + s.negative,
        neutral: acc.neutral + s.neutral,
        count: acc.count + 1,
      };
    },
    { positive: 0, negative: 0, neutral: 0, count: 0 }
  );

  const avgCompound = meetings.length
    ? meetings.reduce((s, m) => s + (m.intelligence?.sentiment.compound || 0), 0) / meetings.length
    : 0;

  const pieData = meetings.length ? [
    { name: 'Positive', value: meetings.filter(m => m.intelligence?.sentiment.label === 'positive').length, color: '#10b981' },
    { name: 'Negative', value: meetings.filter(m => m.intelligence?.sentiment.label === 'negative').length, color: '#f43f5e' },
    { name: 'Neutral', value: meetings.filter(m => m.intelligence?.sentiment.label === 'neutral').length, color: '#94a3b8' },
  ].filter(d => d.value > 0) : [];

  const barData = meetings.map(m => ({
    name: m.title.length > 14 ? m.title.substring(0, 14) + '…' : m.title,
    positive: parseFloat((m.intelligence!.sentiment.positive * 100).toFixed(1)),
    negative: parseFloat((m.intelligence!.sentiment.negative * 100).toFixed(1)),
    neutral: parseFloat((m.intelligence!.sentiment.neutral * 100).toFixed(1)),
    compound: parseFloat((m.intelligence!.sentiment.compound).toFixed(3)),
  }));

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Sentiment Analysis</h1>
        <p className="page-subtitle">VADER-based sentiment analysis from meeting transcripts</p>
      </div>

      {meetings.length === 0 ? (
        <div className="section-card">
          <EmptyState
            icon={<BarChart2 className="w-8 h-8" />}
            title="No sentiment analysis yet"
            description="Sentiment is automatically analyzed using VADER during meeting processing. Process a meeting to see results here."
            action={<Button onClick={() => navigate('/upload')} className="gradient-primary text-white border-0">Upload Meeting</Button>}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Avg Compound', value: avgCompound.toFixed(3), icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-500 bg-blue-500/10' },
              { label: 'Positive Meetings', value: pieData.find(d => d.name === 'Positive')?.value || 0, icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-500/10' },
              { label: 'Negative Meetings', value: pieData.find(d => d.name === 'Negative')?.value || 0, icon: <TrendingDown className="w-5 h-5" />, color: 'text-rose-500 bg-rose-500/10' },
              { label: 'Neutral Meetings', value: pieData.find(d => d.name === 'Neutral')?.value || 0, icon: <Minus className="w-5 h-5" />, color: 'text-slate-500 bg-slate-500/10' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution Pie */}
            <div className="section-card">
              <div className="section-header"><h2 className="section-title">Sentiment Distribution</h2></div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} meeting${Number(v) !== 1 ? 's' : ''}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-5 mt-3">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}: <strong>{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="section-card">
              <div className="section-header"><h2 className="section-title">Per-Meeting Scores</h2></div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip formatter={(v) => [`${v}%`, '']} />
                    <Bar dataKey="positive" fill="#10b981" radius={[3, 3, 0, 0]} name="Positive" />
                    <Bar dataKey="negative" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Negative" />
                    <Bar dataKey="neutral" fill="#94a3b8" radius={[3, 3, 0, 0]} name="Neutral" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Per-Meeting Table */}
          <div className="section-card">
            <div className="section-header"><h2 className="section-title">Detailed Results</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                  <tr>{['Meeting','Date','Positive','Negative','Neutral','Compound','Label'].map(h => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {meetings.map(m => {
                    const s = m.intelligence!.sentiment;
                    return (
                      <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium max-w-[150px] truncate">{m.title}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{formatDateTime(m.createdAt)}</td>
                        <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{(s.positive * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-rose-600 dark:text-rose-400">{(s.negative * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-muted-foreground">{(s.neutral * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 font-mono text-xs">{s.compound.toFixed(4)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                            ${s.label === 'positive' ? 'badge-positive' : s.label === 'negative' ? 'badge-negative' : 'badge-neutral'}`}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
