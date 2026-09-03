import type { SentimentResult } from '@/types';

// VADER-inspired lexicon (simplified but functional)
const LEXICON: Record<string, number> = {
  // Positive
  excellent: 3.1, amazing: 3.0, great: 2.8, good: 2.0, wonderful: 3.2,
  fantastic: 3.3, outstanding: 3.1, superb: 3.2, perfect: 3.0, brilliant: 3.1,
  love: 2.8, happy: 2.5, joy: 2.7, success: 2.5, successful: 2.5,
  achieve: 2.2, accomplished: 2.4, progress: 1.8, improve: 1.9, innovative: 2.3,
  efficient: 2.0, effective: 1.9, positive: 2.0, agree: 1.6, approved: 2.0,
  completed: 1.8, resolved: 1.9, supported: 1.5, clear: 1.2, productive: 2.1,
  excited: 2.4, confident: 1.9, strong: 1.6, benefit: 1.8, opportunity: 1.7,
  recommend: 1.8, best: 2.3, pleased: 2.0, satisfied: 1.9, thankful: 2.2,
  thanks: 1.5, helpful: 1.8, useful: 1.5, valuable: 2.0, win: 2.2, won: 2.0,
  // Negative
  bad: -2.0, terrible: -3.1, awful: -3.0, poor: -2.0, fail: -2.5,
  failed: -2.5, failure: -2.8, problem: -1.8, issue: -1.5, difficult: -1.6,
  hard: -1.2, impossible: -2.8, wrong: -2.0, error: -2.2, mistake: -2.1,
  miss: -1.5, missing: -1.5, delay: -1.8, delayed: -1.8, blocked: -2.0,
  concern: -1.6, worried: -2.1, risk: -1.7, conflict: -2.3, disagree: -2.0,
  reject: -2.2, rejected: -2.2, cancel: -2.0, cancelled: -2.0, broken: -2.1,
  hurt: -2.3, angry: -2.8, frustrated: -2.5, disappointed: -2.4, unhappy: -2.2,
  slow: -1.4, unclear: -1.5, confused: -1.6, complicated: -1.5, worse: -2.2,
  worst: -3.0, never: -1.5, not: -0.7, no: -0.5, cannot: -1.8,
};

const NEGATIONS = new Set(['not', 'never', "n't", 'no', 'nobody', 'nothing', 'neither', 'nor', 'cannot']);
const INTENSIFIERS: Record<string, number> = {
  very: 1.3, extremely: 1.5, absolutely: 1.4, quite: 1.1, somewhat: 0.8,
  slightly: 0.7, really: 1.3, highly: 1.2, incredibly: 1.5, totally: 1.3,
  utterly: 1.4, deeply: 1.2, barely: 0.6, hardly: 0.5,
};

function preprocess(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function analyzeSentiment(text: string): SentimentResult {
  if (!text || !text.trim()) {
    return { positive: 0, negative: 0, neutral: 1, compound: 0, label: 'neutral' };
  }

  const tokens = preprocess(text);
  let posSum = 0;
  let negSum = 0;
  let neutralCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const score = LEXICON[token];

    if (score !== undefined) {
      let adjusted = score;
      // Check preceding intensifier
      if (i > 0 && INTENSIFIERS[tokens[i - 1]]) {
        adjusted *= INTENSIFIERS[tokens[i - 1]];
      }
      // Check negation in window of 3
      let negated = false;
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (NEGATIONS.has(tokens[j])) { negated = true; break; }
      }
      if (negated) adjusted = -adjusted * 0.7;

      if (adjusted > 0) posSum += adjusted;
      else if (adjusted < 0) negSum += Math.abs(adjusted);
      else neutralCount++;
    } else {
      neutralCount++;
    }
  }

  const total = posSum + negSum + neutralCount;
  if (total === 0) return { positive: 0, negative: 0, neutral: 1, compound: 0, label: 'neutral' };

  const pos = parseFloat((posSum / total).toFixed(3));
  const neg = parseFloat((negSum / total).toFixed(3));
  const neu = parseFloat((neutralCount / total).toFixed(3));

  // Compound: normalized weighted score (-1 to +1)
  const rawCompound = (posSum - negSum) / Math.sqrt(posSum * posSum + negSum * negSum + 15);
  const compound = parseFloat(Math.max(-1, Math.min(1, rawCompound)).toFixed(4));

  const label = compound >= 0.05 ? 'positive' : compound <= -0.05 ? 'negative' : 'neutral';

  return { positive: pos, negative: neg, neutral: neu, compound, label };
}

export function preprocessText(text: string): {
  tokens: string[];
  cleaned: string;
  stopwordsRemoved: string[];
  tokenCount: number;
  uniqueTokens: number;
} {
  const STOPWORDS = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'by','from','is','was','are','were','be','been','being','have','has',
    'had','do','does','did','will','would','could','should','may','might',
    'shall','can','this','that','these','those','i','you','he','she','it',
    'we','they','me','him','her','us','them','my','your','his','its','our',
    'their','what','which','who','when','where','why','how','all','each',
    'both','few','more','most','other','some','such','than','then','so',
    'as','if','no','nor','not','only','same','also','just','very','too',
  ]);

  const raw = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const withoutStop = raw.filter(t => !STOPWORDS.has(t) && t.length > 1);
  const cleaned = withoutStop.join(' ');

  return {
    tokens: raw,
    cleaned,
    stopwordsRemoved: withoutStop,
    tokenCount: raw.length,
    uniqueTokens: new Set(raw).size,
  };
}
