import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink } from 'lucide-react';
import EmptyState from '@/components/features/EmptyState';
import { Button } from '@/components/ui/button';
import { getMeetings, getTranscripts } from '@/lib/storage';
import { formatDateTime } from '@/lib/utils';
import type { Meeting, Transcript } from '@/types';

export default function Transcripts() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  useEffect(() => {
    setMeetings(getMeetings());
    setTranscripts(getTranscripts());
  }, []);

  const transcribed = meetings.filter(m => m.status === 'transcribed' || m.status === 'processed');

  return (
    <div className="page-content">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Transcripts</h1>
          <p className="page-subtitle">{transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''} generated</p>
        </div>
        <Button onClick={() => navigate('/upload')} className="gradient-primary text-white border-0">
          + New Upload
        </Button>
      </div>

      {transcribed.length === 0 ? (
        <div className="section-card">
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="No transcripts yet"
            description="Upload and process a meeting to generate transcripts. All generated transcripts will appear here."
            action={<Button onClick={() => navigate('/upload')} className="gradient-primary text-white border-0">Upload Meeting</Button>}
          />
        </div>
      ) : (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">All Transcripts</h2>
          </div>
          <div className="divide-y divide-border">
            {transcribed.map(m => {
              const t = transcripts.find(x => x.meetingId === m.id);
              return (
                <div key={m.id}
                  className="px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-between group"
                  onClick={() => navigate(`/transcripts/${m.id}`)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{m.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</span>
                        {t && <span className="text-xs text-muted-foreground">{t.wordCount} words</span>}
                        <span className="text-xs text-muted-foreground capitalize">{t?.source || 'unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
