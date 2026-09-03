import type {
  Meeting, ActionItem, Participant, Transcript, ValidationTest, AppStats
} from '@/types';

const KEYS = {
  MEETINGS: 'acp_meetings',
  ACTION_ITEMS: 'acp_action_items',
  PARTICIPANTS: 'acp_participants',
  TRANSCRIPTS: 'acp_transcripts',
  VALIDATION: 'acp_validation',
  THEME: 'acp_theme',
};

function get<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch { return []; }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Meetings
export const getMeetings = (): Meeting[] => get<Meeting>(KEYS.MEETINGS);
export const saveMeeting = (m: Meeting): void => {
  const all = getMeetings().filter(x => x.id !== m.id);
  set(KEYS.MEETINGS, [...all, m]);
};
export const getMeeting = (id: string): Meeting | undefined =>
  getMeetings().find(m => m.id === id);
export const deleteMeeting = (id: string): void =>
  set(KEYS.MEETINGS, getMeetings().filter(m => m.id !== id));

// Action Items
export const getAllActionItems = (): ActionItem[] => get<ActionItem>(KEYS.ACTION_ITEMS);
export const getActionItems = (meetingId: string): ActionItem[] =>
  getAllActionItems().filter(a => a.meetingId === meetingId);
export const saveActionItem = (item: ActionItem): void => {
  const all = getAllActionItems().filter(x => x.id !== item.id);
  set(KEYS.ACTION_ITEMS, [...all, item]);
};
export const saveActionItems = (items: ActionItem[]): void => {
  const existing = getAllActionItems().filter(x => !items.find(i => i.id === x.id));
  set(KEYS.ACTION_ITEMS, [...existing, ...items]);
};
export const updateActionItemStatus = (id: string, status: ActionItem['status']): void => {
  const all = getAllActionItems().map(a => a.id === id ? { ...a, status } : a);
  set(KEYS.ACTION_ITEMS, all);
};

// Participants
export const getAllParticipants = (): Participant[] => get<Participant>(KEYS.PARTICIPANTS);
export const getParticipants = (meetingId: string): Participant[] =>
  getAllParticipants().filter(p => p.meetingId === meetingId);
export const saveParticipants = (items: Participant[]): void => {
  const existing = getAllParticipants().filter(x => !items.find(i => i.id === x.id));
  set(KEYS.PARTICIPANTS, [...existing, ...items]);
};

// Transcripts
export const getTranscripts = (): Transcript[] => get<Transcript>(KEYS.TRANSCRIPTS);
export const getTranscript = (meetingId: string): Transcript | undefined =>
  getTranscripts().find(t => t.meetingId === meetingId);
export const saveTranscript = (t: Transcript): void => {
  const all = getTranscripts().filter(x => x.id !== t.id);
  set(KEYS.TRANSCRIPTS, [...all, t]);
};
export const updateTranscript = (id: string, content: string): void => {
  const all = getTranscripts().map(t =>
    t.id === id ? { ...t, content, wordCount: content.trim().split(/\s+/).filter(Boolean).length } : t
  );
  set(KEYS.TRANSCRIPTS, all);
};

// Validation
export const getValidationTests = (): ValidationTest[] => get<ValidationTest>(KEYS.VALIDATION);
export const saveValidationTests = (tests: ValidationTest[]): void =>
  set(KEYS.VALIDATION, tests);

// Stats
export const getStats = (): AppStats => {
  const meetings = getMeetings();
  const actionItems = getAllActionItems();
  const participants = getAllParticipants();
  const transcripts = getTranscripts();

  let pos = 0, neg = 0, neu = 0;
  meetings.forEach(m => {
    if (m.intelligence?.sentiment) {
      const s = m.intelligence.sentiment;
      if (s.label === 'positive') pos++;
      else if (s.label === 'negative') neg++;
      else neu++;
    }
  });

  return {
    totalMeetings: meetings.length,
    totalTranscripts: transcripts.length,
    totalActionItems: actionItems.length,
    totalParticipants: new Set(participants.map(p => p.name.toLowerCase())).size,
    sentimentPositive: pos,
    sentimentNegative: neg,
    sentimentNeutral: neu,
  };
};

// Theme
export const getTheme = (): 'dark' | 'light' =>
  (localStorage.getItem(KEYS.THEME) as 'dark' | 'light') || 'dark';
export const setTheme = (theme: 'dark' | 'light'): void =>
  localStorage.setItem(KEYS.THEME, theme);
