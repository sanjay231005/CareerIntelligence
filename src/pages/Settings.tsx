import { useState } from 'react';
import { Settings as SettingsIcon, Database, Cpu, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { getStats } from '@/lib/storage';
import { toast } from 'sonner';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [confirmClear, setConfirmClear] = useState(false);
  const stats = getStats();

  const clearAllData = () => {
    const keys = ['acp_meetings','acp_action_items','acp_participants','acp_transcripts','acp_validation'];
    keys.forEach(k => localStorage.removeItem(k));
    setConfirmClear(false);
    toast.success('All data cleared. Reload the page to see empty state.');
  };

  return (
    <div className="page-content max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your AI Career Intelligence Platform</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="section-card">
          <div className="section-header"><h2 className="section-title flex items-center gap-2"><SettingsIcon className="w-4 h-4 text-primary" />Appearance</h2></div>
          <div className="section-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground mt-0.5">Switch between dark and light mode</p>
              </div>
              <div className="flex gap-2">
                {(['dark', 'light'] as const).map(t => (
                  <button key={t} onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize
                      ${theme === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LLM Configuration */}
        <div className="section-card">
          <div className="section-header"><h2 className="section-title flex items-center gap-2"><Cpu className="w-4 h-4 text-primary" />LLM Configuration</h2></div>
          <div className="section-body space-y-4">
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              Backend LLM integration requires server-side configuration. Set environment variables LLM_PROVIDER, LLM_MODEL, and LLM_API_KEY on the backend.
            </div>
            {[
              { label: 'LLM Provider', placeholder: 'e.g. openai, anthropic, ollama', env: 'LLM_PROVIDER' },
              { label: 'LLM Model', placeholder: 'e.g. gpt-4o, claude-3-sonnet', env: 'LLM_MODEL' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">{f.label}</label>
                <input disabled placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-lg border bg-muted/50 text-sm text-muted-foreground cursor-not-allowed" />
                <p className="text-xs text-muted-foreground mt-1">Configure via env: <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">{f.env}</code></p>
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">API Key</label>
              <input disabled type="password" placeholder="••••••••••••••••"
                className="w-full px-3 py-2.5 rounded-lg border bg-muted/50 text-sm text-muted-foreground cursor-not-allowed" />
              <p className="text-xs text-muted-foreground mt-1">Configure via env: <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">LLM_API_KEY</code> — never exposed to frontend</p>
            </div>
          </div>
        </div>

        {/* Data Overview */}
        <div className="section-card">
          <div className="section-header"><h2 className="section-title flex items-center gap-2"><Database className="w-4 h-4 text-primary" />Data Overview</h2></div>
          <div className="section-body">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Meetings', stats.totalMeetings],
                ['Transcripts', stats.totalTranscripts],
                ['Action Items', stats.totalActionItems],
                ['Participants', stats.totalParticipants],
              ].map(([l, v]) => (
                <div key={String(l)} className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xl font-bold">{v}</p>
                  <p className="text-xs text-muted-foreground mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="section-card border-destructive/30">
          <div className="section-header border-b border-destructive/20">
            <h2 className="section-title flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h2>
          </div>
          <div className="section-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Clear All Data</p>
                <p className="text-xs text-muted-foreground mt-0.5">Permanently delete all meetings, transcripts, and intelligence data</p>
              </div>
              {!confirmClear ? (
                <Button variant="destructive" size="sm" onClick={() => setConfirmClear(true)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Data
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>Cancel</Button>
                  <Button variant="destructive" size="sm" onClick={clearAllData}>Confirm Delete</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
