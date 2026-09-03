import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Edit2, Check, FileText, Hash, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getMeeting, getTranscript, updateTranscript } from '@/lib/storage';
import { formatDateTime, downloadText, countWords } from '@/lib/utils';
import type { Meeting, Transcript } from '@/types';
import { toast } from 'sonner';

export default function TranscriptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const m = getMeeting(id);
    const t = getTranscript(id);
    setMeeting(m || null);
    setTranscript(t || null);
    if (t) setEditContent(t.content);
  }, [id]);

  if (!meeting || !transcript) {
    return (
      <div className="page-content">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-base font-medium">Transcript not found</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate('/transcripts')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Transcripts
          </Button>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadText(transcript.content, `${meeting.title}-transcript.txt`);
  };

  const handleSave = () => {
    if (!editContent.trim()) { toast.error('Transcript cannot be empty'); return; }
    updateTranscript(transcript.id, editContent);
    setTranscript({ ...transcript, content: editContent, wordCount: countWords(editContent) });
    setEditing(false);
    toast.success('Transcript updated');
  };

  return (
    <div className="page-content max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/transcripts')} className="rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="page-title truncate">{meeting.title}</h1>
          <p className="page-subtitle">{formatDateTime(meeting.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download
          </Button>
          {!editing && (
            <Button size="sm" onClick={() => { setEditing(true); setEditContent(transcript.content); }}
              className="gradient-primary text-white border-0">
              <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <Globe className="w-4 h-4" />, label: 'Language', value: transcript.language.toUpperCase() },
          { icon: <Hash className="w-4 h-4" />, label: 'Words', value: transcript.wordCount.toLocaleString() },
          { icon: <Clock className="w-4 h-4" />, label: 'Processing', value: `${transcript.processingTime}s` },
          { icon: <FileText className="w-4 h-4" />, label: 'Source', value: transcript.source },
        ].map(item => (
          <div key={item.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">{item.icon}<span className="text-xs">{item.label}</span></div>
            <p className="text-sm font-semibold capitalize">{item.value}</p>
          </div>
        ))}
      </div>

      {/* WER / CER */}
      {!transcript.wer && (
        <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground mb-4">
          Reference transcript required to calculate WER/CER accuracy metrics.
        </div>
      )}

      {/* Transcript Content */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Transcript Content</h2>
          {editing && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} className="gradient-primary text-white border-0">Save Changes</Button>
            </div>
          )}
        </div>
        <div className="p-6">
          {editing ? (
            <Textarea
              value={editContent} onChange={e => setEditContent(e.target.value)}
              rows={20} className="font-mono text-sm resize-y"
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/80 max-h-[600px] overflow-y-auto">
              {transcript.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
