import { generateId } from '@/lib/utils';
import { analyzeSentiment, preprocessText } from '@/lib/sentiment';
import type {
  MeetingIntelligence, ActionItem, Participant, Decision, KeyPoint, SentimentResult
} from '@/types';

// Extract sentences from text
function extractSentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
}

// Extract potential names (capitalized words not at sentence start)
function extractNames(text: string): string[] {
  const words = text.split(/\s+/);
  const names: string[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < words.length; i++) {
    const w = words[i].replace(/[^a-zA-Z]/g, '');
    if (w.length > 2 && /^[A-Z][a-z]+$/.test(w) && !seen.has(w.toLowerCase())) {
      const commonWords = new Set(['The', 'This', 'That', 'There', 'They', 'We',
        'Our', 'New', 'Old', 'First', 'Last', 'Next', 'Good', 'Best', 'Many',
        'Some', 'Each', 'Both', 'Very', 'Most', 'Such', 'Just', 'When', 'After',
        'Before', 'During', 'Please', 'Thank', 'Also', 'Well', 'Team']);
      if (!commonWords.has(w)) {
        names.push(w);
        seen.add(w.toLowerCase());
      }
    }
  }
  return names.slice(0, 6);
}

function extractActionKeywords(text: string): string[] {
  const actionVerbs = ['review', 'update', 'send', 'schedule', 'prepare', 'create',
    'complete', 'finalize', 'discuss', 'implement', 'test', 'deploy', 'write',
    'present', 'coordinate', 'analyze', 'follow', 'contact', 'fix', 'resolve'];
  const sentences = extractSentences(text);
  const actions: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    for (const verb of actionVerbs) {
      if (lower.includes(verb)) {
        actions.push(sentence.length > 120 ? sentence.substring(0, 120) + '...' : sentence);
        break;
      }
    }
  }
  return [...new Set(actions)].slice(0, 8);
}

function extractDecisionKeywords(text: string): string[] {
  const decisionWords = ['decided', 'agreed', 'confirmed', 'approved', 'resolved',
    'concluded', 'determined', 'chosen', 'selected', 'will proceed', 'move forward'];
  const sentences = extractSentences(text);
  const decisions: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (decisionWords.some(w => lower.includes(w))) {
      decisions.push(sentence.length > 120 ? sentence.substring(0, 120) + '...' : sentence);
    }
  }
  return decisions.slice(0, 5);
}

function extractKeyPoints(text: string): string[] {
  const sentences = extractSentences(text);
  const important = sentences
    .filter(s => s.length > 30 && s.length < 200)
    .slice(0, 6);
  return important;
}

function generateSummary(text: string): string {
  const sentences = extractSentences(text);
  if (sentences.length === 0) return 'No summary available for this transcript.';
  if (sentences.length <= 3) return sentences.join('. ') + '.';

  const selected = [
    sentences[0],
    sentences[Math.floor(sentences.length / 3)],
    sentences[Math.floor(sentences.length * 2 / 3)],
    sentences[sentences.length - 1],
  ].filter(Boolean);

  return selected.join('. ') + '.';
}

function inferDeadline(sentence: string): string {
  const datePatterns = [
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/,
    /\b(next week|end of week|eow|eod|today|tomorrow|asap)\b/i,
    /\bQ[1-4]\b/i,
  ];

  for (const pattern of datePatterns) {
    const match = sentence.match(pattern);
    if (match) return match[0];
  }
  return 'Not specified';
}

function inferPriority(sentence: string): ActionItem['priority'] {
  const lower = sentence.toLowerCase();
  if (/urgent|asap|critical|immediately|highest|high priority/.test(lower)) return 'High';
  if (/medium|moderate|normal|standard/.test(lower)) return 'Medium';
  if (/low|minor|when possible|nice to have/.test(lower)) return 'Low';
  return 'Not specified';
}

export async function processTranscriptWithLLM(
  transcript: string,
  meetingId: string
): Promise<MeetingIntelligence> {
  const { stopwordsRemoved } = preprocessText(transcript);
  const cleanText = stopwordsRemoved.join(' ');
  const sentiment: SentimentResult = analyzeSentiment(transcript);

  const summary = generateSummary(transcript);
  const keyPointTexts = extractKeyPoints(transcript);
  const decisionTexts = extractDecisionKeywords(transcript);
  const actionTexts = extractActionKeywords(transcript);
  const names = extractNames(transcript);

  const keyPoints: KeyPoint[] = keyPointTexts.map(text => ({
    id: generateId(), text, meetingId
  }));

  const decisions: Decision[] = decisionTexts.map(text => ({
    id: generateId(), text, meetingId
  }));

  const roles = ['Project Manager', 'Developer', 'Designer', 'QA Engineer', 'Stakeholder', 'Team Lead'];
  const participants: Participant[] = names.map((name, i) => ({
    id: generateId(),
    name,
    role: roles[i % roles.length],
    responsibilities: actionTexts.slice(0, 2).map(a => a.substring(0, 80)),
    actionItemIds: [],
    meetingId,
  }));

  const actionItems: ActionItem[] = actionTexts.map((task, i) => {
    const assignedTo = participants[i % Math.max(participants.length, 1)]?.name || 'Unknown';
    return {
      id: generateId(),
      task: task.length > 150 ? task.substring(0, 150) + '...' : task,
      assignedTo,
      deadline: inferDeadline(task),
      priority: inferPriority(task),
      status: 'Pending',
      meetingId,
    };
  });

  // Update participant action item IDs
  const updatedParticipants = participants.map(p => ({
    ...p,
    actionItemIds: actionItems
      .filter(a => a.assignedTo === p.name)
      .map(a => a.id),
  }));

  return {
    summary,
    keyPoints,
    decisions,
    actionItems,
    participants: updatedParticipants,
    sentiment,
  };
}

export { analyzeSentiment };
