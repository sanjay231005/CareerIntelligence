export type SentimentLabel = 'positive' | 'negative' | 'neutral';
export type Priority = 'High' | 'Medium' | 'Low' | 'Not specified';
export type ActionStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
export type ProcessingStage =
  | 'idle'
  | 'uploading'
  | 'extracting_audio'
  | 'transcribing'
  | 'validating'
  | 'processing_ai'
  | 'extracting_actions'
  | 'mapping_participants'
  | 'saving'
  | 'done'
  | 'error';

export interface SentimentResult {
  positive: number;
  negative: number;
  neutral: number;
  compound: number;
  label: SentimentLabel;
}

export interface ActionItem {
  id: string;
  task: string;
  assignedTo: string;
  deadline: string;
  priority: Priority;
  status: ActionStatus;
  meetingId: string;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  actionItemIds: string[];
  meetingId: string;
}

export interface Decision {
  id: string;
  text: string;
  meetingId: string;
}

export interface KeyPoint {
  id: string;
  text: string;
  meetingId: string;
}

export interface Transcript {
  id: string;
  meetingId: string;
  content: string;
  language: string;
  wordCount: number;
  processingTime: number;
  createdAt: string;
  source: 'text' | 'file' | 'video';
  sourceFileName?: string;
  wer?: number;
  cer?: number;
}

export interface MeetingIntelligence {
  summary: string;
  keyPoints: KeyPoint[];
  decisions: Decision[];
  actionItems: ActionItem[];
  participants: Participant[];
  sentiment: SentimentResult;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: 'uploaded' | 'transcribed' | 'processed' | 'error';
  transcript?: Transcript;
  intelligence?: MeetingIntelligence;
  createdAt: string;
  fileType?: string;
  fileName?: string;
}

export interface ValidationTest {
  id: string;
  name: string;
  milestone: 1 | 2;
  status: 'not_run' | 'pass' | 'fail';
  message?: string;
  runAt?: string;
}

export interface AppStats {
  totalMeetings: number;
  totalTranscripts: number;
  totalActionItems: number;
  totalParticipants: number;
  sentimentPositive: number;
  sentimentNegative: number;
  sentimentNeutral: number;
}
