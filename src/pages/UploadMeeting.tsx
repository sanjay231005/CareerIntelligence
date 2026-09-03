import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileVideo, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ProcessingStages from '@/components/features/ProcessingStages';
import { cn, generateId, countWords, sleep } from '@/lib/utils';
import { analyzeSentiment, preprocessText } from '@/lib/sentiment';
import { processTranscriptWithLLM } from '@/lib/llm';
import { saveMeeting, saveTranscript, saveActionItems, saveParticipants } from '@/lib/storage';
import { SUPPORTED_VIDEO_FORMATS, MAX_FILE_SIZE_MB } from '@/constants';
import type { Meeting, Transcript, ProcessingStage } from '@/types';
import { toast } from 'sonner';

type InputMode = 'video' | 'text' | 'file';

export default function UploadMeeting() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const txtRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<InputMode>('video');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [error, setError] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');

  const validateFile = (f: File): string => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_VIDEO_FORMATS.includes(ext)) return `Unsupported format. Use: ${SUPPORTED_VIDEO_FORMATS.join(', ')}`;
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
    return '';
  };

  const handleFileDrop = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError('');
    setSelectedFile(f);
    if (!meetingTitle) setMeetingTitle(f.name.replace(/\.[^/.]+$/, ''));
  }, [meetingTitle]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileDrop(f);
  };

  const onTxtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setTextInput(ev.target?.result as string || '');
      if (!meetingTitle) setMeetingTitle(f.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsText(f);
  };

  const process = async () => {
    setError('');
    const text = mode === 'video'
      ? `[Simulated Whisper Transcription from ${selectedFile?.name}]\n\nThe team reviewed the quarterly roadmap and discussed key deliverables. Sarah confirmed the frontend redesign will be completed by next Friday. John agreed to review the backend API documentation and send a summary to the team by Wednesday. The group decided to move forward with the new deployment pipeline after resolving the current blocking issue. Mike will coordinate with the DevOps team to schedule the deployment for next Monday. The meeting concluded with an agreement to hold weekly check-ins every Tuesday at 10am. Overall progress was confirmed as on track.`
      : textInput.trim();

    if (!text) { setError('Please provide text or upload a file.'); return; }
    if (!meetingTitle.trim()) { setError('Please enter a meeting title.'); return; }

    // Empty input guard
    if (text.length < 10) { setError('Input is too short for meaningful analysis.'); return; }

    const meetingId = generateId();
    const now = new Date().toISOString();
    const start = Date.now();

    const meeting: Meeting = {
      id: meetingId, title: meetingTitle.trim(), date: now,
      duration: '—', status: 'uploaded', createdAt: now,
      ...(selectedFile ? { fileName: selectedFile.name, fileType: selectedFile.type } : {}),
    };

    try {
      setStage('uploading'); await sleep(700);
      saveMeeting(meeting);

      if (mode === 'video') {
        setStage('extracting_audio'); await sleep(900);
        setStage('transcribing'); await sleep(1400);
      }

      setStage('validating'); await sleep(500);

      const { tokens, stopwordsRemoved } = preprocessText(text);
      if (tokens.length === 0) { setError('No valid tokens found in input.'); setStage('idle'); return; }

      const processingTime = Date.now() - start;
      const transcript: Transcript = {
        id: generateId(), meetingId, content: text,
        language: 'en', wordCount: countWords(text),
        processingTime: Math.round(processingTime / 1000),
        createdAt: now, source: mode,
        ...(selectedFile ? { sourceFileName: selectedFile.name } : {}),
      };
      saveTranscript(transcript);
      saveMeeting({ ...meeting, status: 'transcribed', transcript });

      setStage('processing_ai'); await sleep(1200);
      const intelligence = await processTranscriptWithLLM(text, meetingId);

      setStage('extracting_actions'); await sleep(700);
      saveActionItems(intelligence.actionItems);

      setStage('mapping_participants'); await sleep(600);
      saveParticipants(intelligence.participants);

      setStage('saving'); await sleep(500);
      saveMeeting({
        ...meeting,
        status: 'processed',
        duration: `${Math.ceil(tokens.length / 130)} min`,
        transcript,
        intelligence,
      });

      setStage('done');
      toast.success('Meeting processed successfully!');
      setTimeout(() => navigate(`/intelligence/${meetingId}`), 800);
    } catch (e) {
      setStage('error');
      setError('Processing failed. Please try again.');
    }
  };

  const canProcess = stage === 'idle' && (
    (mode === 'video' && selectedFile !== null) ||
    ((mode === 'text' || mode === 'file') && textInput.trim().length > 0)
  ) && meetingTitle.trim().length > 0;

  const isProcessing = !['idle', 'done', 'error'].includes(stage);

  return (
    <div className="page-content max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Upload Meeting</h1>
        <p className="page-subtitle">Upload a video, paste text, or import a file for AI analysis</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 w-fit">
        {(['video', 'text', 'file'] as InputMode[]).map(m => (
          <button key={m} onClick={() => !isProcessing && setMode(m)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
              mode === m ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {m === 'video' ? '🎥 Video' : m === 'text' ? '📝 Text' : '📄 File'}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-sm font-medium mb-1.5 block">Meeting Title</Label>
          <input
            id="title" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)}
            placeholder="e.g. Q3 Planning Session"
            disabled={isProcessing}
            className="w-full px-3 py-2.5 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition"
          />
        </div>

        {/* Video Upload */}
        {mode === 'video' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !isProcessing && fileRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
              selectedFile && 'border-emerald-500 bg-emerald-500/5',
              isProcessing && 'pointer-events-none opacity-60'
            )}
          >
            <input ref={fileRef} type="file" className="hidden" accept=".mp4,.mov,.avi,.mkv,.webm" onChange={e => e.target.files?.[0] && handleFileDrop(e.target.files[0])} />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setSelectedFile(null); setError(''); }}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileVideo className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Drop video here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">Supported: {SUPPORTED_VIDEO_FORMATS.join(', ')} — Max {MAX_FILE_SIZE_MB}MB</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Input */}
        {mode === 'text' && (
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Paste Transcript or Meeting Text</Label>
            <Textarea
              value={textInput} onChange={e => setTextInput(e.target.value)}
              placeholder="Paste your meeting transcript, notes, or any career-related text here..."
              rows={10} disabled={isProcessing}
              className="font-mono text-sm resize-none"
            />
            {textInput && (
              <p className="text-xs text-muted-foreground mt-1.5">{countWords(textInput)} words</p>
            )}
          </div>
        )}

        {/* File Upload */}
        {mode === 'file' && (
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Upload TXT or CSV File</Label>
            <div
              onClick={() => !isProcessing && txtRef.current?.click()}
              className={cn('border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
                'hover:border-primary/50 hover:bg-muted/30', isProcessing && 'pointer-events-none opacity-60')}
            >
              <input ref={txtRef} type="file" className="hidden" accept=".txt,.csv" onChange={onTxtUpload} />
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Click to upload .txt or .csv</p>
              {textInput && <p className="text-xs text-emerald-500 mt-2">✓ File loaded — {countWords(textInput)} words</p>}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Processing Stages */}
        {stage !== 'idle' && (
          <div className="section-card p-5">
            <h3 className="text-sm font-semibold mb-4">Processing Pipeline</h3>
            <ProcessingStages currentStage={stage} />
            {stage === 'done' && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Intelligence generated successfully! Redirecting...
              </div>
            )}
          </div>
        )}

        <Button
          onClick={process} disabled={!canProcess || isProcessing}
          className="w-full gradient-primary text-white border-0 h-11 text-sm font-semibold"
        >
          {isProcessing ? 'Processing...' : 'Start Processing'}
        </Button>
      </div>
    </div>
  );
}
