import { beforeEach, describe, expect, it, vi } from 'vitest';
import { learningReducer, loadLearningProgress, saveLearningProgress } from './learningProgress';
import { ALL_BADGES } from '../constants';

beforeEach(() => {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) });
});

describe('learning progress', () => {
  it('restores existing learning progress and tolerates damaged data', () => {
    localStorage.setItem('userXp', '120');
    localStorage.setItem('unlockedBadges', '{broken');
    localStorage.setItem('masteryProgress', '{"Tenses":5,"Articles":-1}');
    const state = loadLearningProgress();
    expect(state.xp).toBe(120);
    expect(state.unlockedBadges).toEqual([]);
    expect(state.masteryProgress).toEqual({ Tenses: 5, Articles: 0 });
  });
  it('awards a badge bonus once and does not mutate the old state', () => {
    const state = loadLearningProgress();
    const badge = ALL_BADGES.find(b => b.topic === 'Tenses')!;
    const action = { type: 'quiz' as const, score: 5, correctAnswersByTopic: { Tenses: 5 }, xpMultiplier: 2 };
    const next = learningReducer(state, action);
    expect(next.xp).toBe(100 + badge.xp);
    expect(state.xp).toBe(0);
    expect(state.masteryProgress).toEqual({});
    expect(learningReducer(state, action)).toEqual(next);
    const repeat = learningReducer(next, action);
    expect(repeat.xp).toBe(next.xp + 100);
    expect(repeat.unlockedBadges.filter(id => id === badge.id)).toHaveLength(1);
  });
  it('tracks analyses and earns diagnostic badges', () => {
    const badge = ALL_BADGES.find(b => b.type === 'diagnostic')!;
    let state = loadLearningProgress();
    for (let i = 0; i < badge.analysisCount!; i++) state = learningReducer(state, { type: 'analysis' });
    expect(state.unlockedBadges).toContain(badge.id);
    expect(state.diagnosticAnalysesCount).toBe(badge.analysisCount);
  });
  it('resets learning while preserving independent Gemini settings', () => {
    localStorage.setItem('grammarQuest.gemini.v1', 'test-settings');
    const state = learningReducer({ xp: 500, unlockedBadges: [], masteryProgress: { Tenses: 6 }, diagnosticAnalysesCount: 3 }, { type: 'reset' });
    expect(saveLearningProgress(state)).toBe(true);
    expect(loadLearningProgress()).toEqual({ xp: 0, unlockedBadges: [], masteryProgress: {}, diagnosticAnalysesCount: 0 });
    expect(localStorage.getItem('grammarQuest.gemini.v1')).toBe('test-settings');
  });
  it('works when browser storage is unavailable', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    expect(loadLearningProgress().xp).toBe(0);
    expect(saveLearningProgress(loadLearningProgress())).toBe(false);
  });
});
