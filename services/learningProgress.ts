import { ALL_BADGES, XP_PER_CORRECT_ANSWER } from '../constants';
import type { BadgeId } from '../types';

export interface LearningProgress {
  xp: number;
  unlockedBadges: BadgeId[];
  masteryProgress: Record<string, number>;
  diagnosticAnalysesCount: number;
}
const emptyProgress = (): LearningProgress => ({ xp: 0, unlockedBadges: [], masteryProgress: {}, diagnosticAnalysesCount: 0 });
const count = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;

export function loadLearningProgress(): LearningProgress {
  const read = (key: string, fallback: unknown) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
  };
  const badges = read('unlockedBadges', []);
  const mastery = read('masteryProgress', {});
  return {
    xp: count(read('userXp', 0)), diagnosticAnalysesCount: count(read('diagnosticAnalysesCount', 0)),
    unlockedBadges: ALL_BADGES.filter(b => Array.isArray(badges) && badges.includes(b.id)).map(b => b.id),
    masteryProgress: mastery && typeof mastery === 'object' && !Array.isArray(mastery)
      ? Object.fromEntries(Object.entries(mastery).map(([topic, value]) => [topic, count(value)])) : {},
  };
}

export function saveLearningProgress(progress: LearningProgress): boolean {
  try {
    localStorage.setItem('userXp', String(progress.xp));
    localStorage.setItem('unlockedBadges', JSON.stringify(progress.unlockedBadges));
    localStorage.setItem('masteryProgress', JSON.stringify(progress.masteryProgress));
    localStorage.setItem('diagnosticAnalysesCount', String(progress.diagnosticAnalysesCount));
    return true;
  } catch { return false; }
}

type Action = { type: 'reset' } | { type: 'analysis' } | { type: 'quiz'; score: number; correctAnswersByTopic: Record<string, number>; xpMultiplier: number };

// Award learning XP and badge bonuses together, without side effects inside React state updates.
export function learningReducer(state: LearningProgress, action: Action): LearningProgress {
  if (action.type === 'reset') return emptyProgress();
  const next = { ...state, masteryProgress: { ...state.masteryProgress }, unlockedBadges: [...state.unlockedBadges] };
  if (action.type === 'analysis') next.diagnosticAnalysesCount++;
  if (action.type === 'quiz') {
    next.xp += Math.round(count(action.score) * XP_PER_CORRECT_ANSWER * action.xpMultiplier);
    for (const [topic, correct] of Object.entries(action.correctAnswersByTopic)) next.masteryProgress[topic] = (next.masteryProgress[topic] || 0) + count(correct);
  }
  for (const badge of ALL_BADGES) {
    const eligible = badge.type === 'diagnostic' ? next.diagnosticAnalysesCount >= badge.analysisCount!
      : !!badge.topic && (next.masteryProgress[badge.topic] || 0) >= badge.masteryThreshold!;
    if (eligible && !next.unlockedBadges.includes(badge.id)) { next.unlockedBadges.push(badge.id); next.xp += badge.xp; }
  }
  return next;
}
