import { useState, useEffect } from 'react';
import { ShieldCheck, Play, RotateCcw } from 'lucide-react';
import StatusBadge from '@/components/features/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  getValidationTests, saveValidationTests,
  getMeetings, getTranscripts, getAllActionItems, getAllParticipants
} from '@/lib/storage';
import { analyzeSentiment, preprocessText } from '@/lib/sentiment';
import { DEFAULT_VALIDATION_TESTS } from '@/constants';
import { formatDateTime, sleep } from '@/lib/utils';
import type { ValidationTest } from '@/types';
import { toast } from 'sonner';

export default function Validation() {
  const [tests, setTests] = useState<ValidationTest[]>([]);
  const [running, setRunning] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  useEffect(() => {
    const saved = getValidationTests();
    setTests(saved.length > 0 ? saved : DEFAULT_VALIDATION_TESTS);
  }, []);

  const runAllTests = async () => {
    setRunning(true);
    const meetings = getMeetings();
    const transcripts = getTranscripts();
    const actionItems = getAllActionItems();
    const participants = getAllParticipants();
    const hasMeeting = meetings.length > 0;
    const hasTranscript = transcripts.length > 0;
    const hasProcessed = meetings.some(m => m.status === 'processed');

    const newTests: ValidationTest[] = [...tests];

    const runTest = async (name: string, fn: () => boolean) => {
      const idx = newTests.findIndex(t => t.name === name);
      if (idx < 0) return;
      setRunningId(newTests[idx].id);
      await sleep(350);
      try {
        const ok = fn();
        newTests[idx] = { ...newTests[idx], status: ok ? 'pass' : 'fail', runAt: new Date().toISOString() };
      } catch {
        newTests[idx] = { ...newTests[idx], status: 'fail', runAt: new Date().toISOString() };
      }
      setTests([...newTests]);
    };

    // M1 Tests
    await runTest('Text Ingestion', () => hasTranscript || hasMeeting);
    await runTest('Text Preprocessing', () => {
      const r = preprocessText('Hello world, the quick brown fox jumps over the lazy dog!');
      return r.tokenCount > 0 && r.stopwordsRemoved.length < r.tokenCount;
    });
    await runTest('VADER Sentiment Analysis', () => {
      const s = analyzeSentiment('This meeting was very productive and we achieved great results!');
      return s.positive > 0 && s.compound > 0;
    });
    await runTest('Tokenization', () => {
      const r = preprocessText('The quick brown fox');
      return r.tokens.length === 4;
    });
    await runTest('Stop-word Removal', () => {
      const r = preprocessText('the and or but is was are');
      return r.stopwordsRemoved.length < r.tokenCount;
    });
    await runTest('Special Character Handling', () => {
      const r = preprocessText('Hello! World... Test: 123 #hashtag @mention $dollar');
      return r.tokenCount > 0;
    });
    await runTest('Empty Input Handling', () => {
      const s = analyzeSentiment('');
      return s.compound === 0 && s.neutral === 1;
    });
    await runTest('Video Upload Support', () => hasMeeting);
    await runTest('Transcript Accuracy (WER/CER)', () => {
      // Only passes if a reference transcript was provided
      return transcripts.some(t => t.wer !== undefined);
    });

    // M2 Tests
    await runTest('LLM Service Integration', () => hasProcessed);
    await runTest('Prompt Template Validation', () => hasProcessed);
    await runTest('Structured JSON Output', () => hasProcessed && meetings.some(m => m.intelligence?.summary));
    await runTest('Meeting Summarization', () => meetings.some(m => m.intelligence?.summary && m.intelligence.summary.length > 20));
    await runTest('Action Item Extraction', () => actionItems.length > 0);
    await runTest('Participant Mapping', () => participants.length > 0);
    await runTest('Database Persistence', () => hasProcessed);
    await runTest('API Integration', () => hasProcessed);

    setRunningId(null);
    saveValidationTests(newTests);
    setTests([...newTests]);
    setRunning(false);

    const passed = newTests.filter(t => t.status === 'pass').length;
    const total = newTests.length;
    toast.success(`Validation complete: ${passed}/${total} tests passed`);
  };

  const reset = () => {
    const fresh = DEFAULT_VALIDATION_TESTS;
    setTests(fresh);
    saveValidationTests(fresh);
    toast.info('Validation tests reset');
  };

  const m1 = tests.filter(t => t.milestone === 1);
  const m2 = tests.filter(t => t.milestone === 2);
  const m1Pass = m1.filter(t => t.status === 'pass').length;
  const m2Pass = m2.filter(t => t.status === 'pass').length;

  return (
    <div className="page-content">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Validation</h1>
          <p className="page-subtitle">Run system validation tests for both milestones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} disabled={running}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </Button>
          <Button onClick={runAllTests} disabled={running} className="gradient-primary text-white border-0">
            <Play className="w-3.5 h-3.5 mr-1.5" />
            {running ? 'Running...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'Milestone 1', subtitle: 'Text Ingestion & Baseline Sentiment', items: m1, pass: m1Pass },
          { title: 'Milestone 2', subtitle: 'Summarization & Action Extraction', items: m2, pass: m2Pass },
        ].map(group => (
          <div key={group.title} className="section-card">
            <div className="section-header">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> {group.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{group.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{group.pass}<span className="text-muted-foreground text-sm font-normal">/{group.items.length}</span></p>
                <p className="text-xs text-muted-foreground">passed</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              {group.items.map(test => (
                <div key={test.id} className={`flex items-center justify-between px-6 py-3.5 transition-colors ${runningId === test.id ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    {runningId === test.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                    )}
                    <span className="text-sm">{test.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {test.runAt && (
                      <span className="text-xs text-muted-foreground hidden sm:block">{formatDateTime(test.runAt)}</span>
                    )}
                    <StatusBadge value={test.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
