import type { ValidationTest } from '@/types';
import { generateId } from '@/lib/utils';

export const DEFAULT_VALIDATION_TESTS: ValidationTest[] = [
  // Milestone 1
  { id: generateId(), name: 'Text Ingestion', milestone: 1, status: 'not_run' },
  { id: generateId(), name: 'Text Preprocessing', milestone: 1, status: 'not_run' },
  { id: generateId(), name: 'VADER Sentiment Analysis', milestone: 1, status: 'not_run' },
  { id: generateId(), name: 'Tokenization', milestone: 1, status: 'not_run' },
  { id: generateId(), name: 'Stop-word Removal', milestone: 1, status: 'not_run' },
  { id: generateId(), name: 'Special Character Handling', milestone: 1, status: 'not_run' },
  { id: generateId(), name: 'Empty Input Handling', milestone: 1, status: 'not_run' },
  { id: generateId(), name: 'Video Upload Support', milestone: 1, status: 'not_run' },
  { id: generateId(), name: 'Transcript Accuracy (WER/CER)', milestone: 1, status: 'not_run' },
  // Milestone 2
  { id: generateId(), name: 'LLM Service Integration', milestone: 2, status: 'not_run' },
  { id: generateId(), name: 'Prompt Template Validation', milestone: 2, status: 'not_run' },
  { id: generateId(), name: 'Structured JSON Output', milestone: 2, status: 'not_run' },
  { id: generateId(), name: 'Meeting Summarization', milestone: 2, status: 'not_run' },
  { id: generateId(), name: 'Action Item Extraction', milestone: 2, status: 'not_run' },
  { id: generateId(), name: 'Participant Mapping', milestone: 2, status: 'not_run' },
  { id: generateId(), name: 'Database Persistence', milestone: 2, status: 'not_run' },
  { id: generateId(), name: 'API Integration', milestone: 2, status: 'not_run' },
];

export const SUPPORTED_VIDEO_FORMATS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
export const MAX_FILE_SIZE_MB = 500;

export const PROCESSING_STAGES = [
  { key: 'uploading', label: 'Uploading file', description: 'Securely uploading your meeting file' },
  { key: 'extracting_audio', label: 'Extracting audio', description: 'Extracting audio track from video' },
  { key: 'transcribing', label: 'Transcribing', description: 'Converting speech to text with Whisper' },
  { key: 'validating', label: 'Validating transcript', description: 'Validating transcript quality and completeness' },
  { key: 'processing_ai', label: 'Processing with AI', description: 'Analyzing transcript with LLM pipeline' },
  { key: 'extracting_actions', label: 'Extracting action items', description: 'Identifying tasks, owners and deadlines' },
  { key: 'mapping_participants', label: 'Mapping participants', description: 'Identifying and mapping meeting participants' },
  { key: 'saving', label: 'Saving to database', description: 'Persisting intelligence to database' },
];
