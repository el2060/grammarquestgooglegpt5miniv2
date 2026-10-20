import React, { useState, useCallback, useEffect, useReducer, useRef } from 'react';
import { Header } from './components/Header';
import { Diagnostics } from './components/Diagnostics';
import { TopicSelector } from './components/TopicSelector';
import { Badges } from './components/Badges';
import type { BadgeId, Scene } from './types';
import { ALL_BADGES, ALL_GRAMMAR_TOPICS, LEVELS } from './constants';
import { GrammarFocus } from './components/GrammarFocus';
import { LearnWithScenes } from './components/scenes/LearnWithScenes';
import { SceneViewer } from './components/scenes/SceneViewer';
import { scenesData } from './components/scenes/scenesData';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { Notification } from './components/Notification';
import { GeminiSetup } from './components/GeminiSetup';
import { HomePage } from './components/HomePage';
import { Modal } from './components/Modal';
import { learningReducer, loadLearningProgress, saveLearningProgress } from './services/learningProgress';

type View = 'diagnostics' | 'quiz' | 'badges';

const getCurrentLevelInfo = (xp: number) => {
    let currentLevelInfo = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXp) {
            currentLevelInfo = LEVELS[i];
            break;
        }
    }

    const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevelInfo.level);
    const nextLevelInfo = currentLevelIndex < LEVELS.length - 1 ? LEVELS[currentLevelIndex + 1] : null;

    if (!nextLevelInfo) { // Max level
        return {
            level: currentLevelInfo.level,
            title: currentLevelInfo.title,
            description: currentLevelInfo.description,
            progressLabel: "Max Level Reached!",
            currentLevelXp: xp - currentLevelInfo.minXp,
            xpForNextLevel: 0,
            progressPercentage: 100,
            isMaxLevel: true
        };
    }

    const levelBaseXp = currentLevelInfo.minXp;
    const xpForNextLevel = nextLevelInfo.minXp - levelBaseXp;
    const currentLevelXp = xp - levelBaseXp;
    const progressPercentage = Math.min((currentLevelXp / xpForNextLevel) * 100, 100);

    return {
        level: currentLevelInfo.level,
        title: currentLevelInfo.title,
        description: currentLevelInfo.description,
        progressLabel: `Progress to ${nextLevelInfo.title}`,
        currentLevelXp: currentLevelXp,
        xpForNextLevel: xpForNextLevel,
        progressPercentage: progressPercentage,
        isMaxLevel: false
    };
};

const App: React.FC = () => {
  const [aiConnected, setAiConnected] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const handleAiConnected = useCallback(() => { setAiConnected(true); setSetupOpen(false); }, []);
  const handleAiDisconnected = useCallback(() => setAiConnected(false), []);
  const [view, setView] = useState<View>('diagnostics');
  const [progress, dispatch] = useReducer(learningReducer, undefined, loadLearningProgress);
  const { xp, masteryProgress, diagnosticAnalysesCount } = progress;
  const unlockedBadges = new Set<BadgeId>(progress.unlockedBadges);
  const [storageError, setStorageError] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(() => new Set(ALL_GRAMMAR_TOPICS));
  const [isScenesListVisible, setIsScenesListVisible] = useState(false);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [resetVisible, setResetVisible] = useState(false);
  const [practiceVersion, setPracticeVersion] = useState(0);
  const [notification, setNotification] = useState<{ title: string; xp: number } | null>(null);
  const seenBadges = useRef(new Set(progress.unlockedBadges));
  const levelInfo = getCurrentLevelInfo(xp);

  useEffect(() => {
    if (aiConnected) document.getElementById('learning-workspace')?.focus({ preventScroll: true });
  }, [aiConnected]);

  useEffect(() => { setStorageError(!saveLearningProgress(progress)); }, [progress]);
  useEffect(() => {
    const earned = ALL_BADGES.filter(b => progress.unlockedBadges.includes(b.id) && !seenBadges.current.has(b.id));
    seenBadges.current = new Set(progress.unlockedBadges);
    if (earned.length) setNotification({ title: earned.map(b => b.title).join(', '), xp: earned.reduce((sum, b) => sum + b.xp, 0) });
  }, [progress.unlockedBadges]);
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleQuizComplete = useCallback((score: number, _questions: number, correctAnswersByTopic: Record<string, number>, xpMultiplier = 1) => {
    dispatch({ type: 'quiz', score, correctAnswersByTopic, xpMultiplier });
  }, []);
  const handleAnalysisComplete = useCallback(() => dispatch({ type: 'analysis' }), []);
  const handleReset = () => {
    dispatch({ type: 'reset' });
    seenBadges.current = new Set();
    setNotification(null);
    setPracticeVersion(version => version + 1);
    setResetVisible(false);
  };

  return (
    <div className={`app-shell${!aiConnected ? ' is-home' : ''}`}>
      <a className="skip-link" href="#learning-workspace">Skip to learning</a>
      <header className="app-header">
        <div className="brand"><img className="brand-logo" src="/np-logo.png" alt="Ngee Ann Polytechnic" width={430} height={110} /><div><h1>Grammar Quest Coach</h1><p>English Language Express <span aria-hidden="true">/</span> School of HMIS</p></div></div>
        <div className="header-actions">{!aiConnected && <a className="quiet-button home-how-link" href="#how-it-works">How it works</a>}<button className="quiet-button" onClick={() => setIsScenesListVisible(true)}><BookOpenIcon className="w-4 h-4" /> Learn with Scenes</button>{aiConnected ? <button className="quiet-button" onClick={() => setResetVisible(true)}>Reset progress</button> : <button className="home-header-start" onClick={() => setSetupOpen(true)}>Connect my coach</button>}</div>
      </header>
      <main id="learning-workspace" className="app-main" tabIndex={-1}>
        {aiConnected && <div className="progress-strip">
          <div className="level-summary"><span className="level-number">{levelInfo.level}</span><div><strong>{levelInfo.title}</strong><span>Level {levelInfo.level} of {LEVELS.length}</span></div></div>
          <div className="level-progress"><div><span>{levelInfo.progressLabel}</span><strong>{levelInfo.isMaxLevel ? 'Complete' : `${levelInfo.currentLevelXp} / ${levelInfo.xpForNextLevel} XP`}</strong></div><div role="progressbar" aria-label="Level progress" aria-valuenow={Math.round(levelInfo.progressPercentage)} aria-valuemin={0} aria-valuemax={100} className="progress-track"><div style={{ width: `${levelInfo.progressPercentage}%` }} /></div></div>
          <div className="progress-stat"><strong>{xp}</strong><span>Total XP</span></div><div className="progress-stat"><strong>{unlockedBadges.size}<small> / {ALL_BADGES.length}</small></strong><span>Badges earned</span></div>
        </div>}
        {storageError && <p role="status" className="notice-error">Progress is available for this session. Allow browser storage to keep it after closing the app.</p>}
        <GeminiSetup connected={aiConnected} onConnected={handleAiConnected} onDisconnected={handleAiDisconnected} open={setupOpen} onClose={() => setSetupOpen(false)} />
        {!aiConnected && <HomePage onGetStarted={() => setSetupOpen(true)} onExploreScenes={() => setIsScenesListVisible(true)} />}
        {aiConnected && <>
          <Header currentView={view} setView={setView} />
          <div className="workspace-content">
            <div hidden={view !== 'diagnostics'}>
              <div className="writing-layout">
                <aside><GrammarFocus selectedTopics={selectedTopics} onSelectionChange={setSelectedTopics} /><div className="study-note"><BookOpenIcon className="w-5 h-5" /><p>Practise a little, often.<br />Start with a sample or a paragraph from your day.</p></div></aside>
                <Diagnostics key={practiceVersion} onQuizComplete={handleQuizComplete} selectedTopics={Array.from(selectedTopics)} onLearnWithScenesClick={() => setIsScenesListVisible(true)} onAnalysisComplete={handleAnalysisComplete} />
              </div>
            </div>
            <div hidden={view !== 'quiz'}><TopicSelector key={practiceVersion} onQuizComplete={handleQuizComplete} unlockedBadges={unlockedBadges} masteryProgress={masteryProgress} /></div>
            <div hidden={view !== 'badges'}><Badges allBadges={ALL_BADGES} unlockedBadges={ALL_BADGES.filter(b => unlockedBadges.has(b.id))} masteryProgress={masteryProgress} diagnosticAnalysesCount={diagnosticAnalysesCount} /></div>
          </div>
        </>}
        <footer className="app-footer"><span>Small steps. Stronger sentences.</span><span>AI can make mistakes. Review its suggestions.</span></footer>
      </main>
      {notification && <Notification title={notification.title} xp={notification.xp} onClose={() => setNotification(null)} />}
      {resetVisible && <Modal label="Reset learning progress" onClose={() => setResetVisible(false)}><div className="p-6 max-w-md"><p className="eyebrow">A fresh start</p><h2 className="text-2xl font-bold mt-2">Reset learning progress?</h2><p className="text-slate-600 my-4">This clears your XP, badges, mastery and current practice. Your Gemini key stays saved. This cannot be undone.</p><div className="flex gap-3 justify-end"><button className="secondary-button" autoFocus onClick={() => setResetVisible(false)}>Keep my progress</button><button className="danger-button" onClick={handleReset}>Reset progress</button></div></div></Modal>}
      {isScenesListVisible && <LearnWithScenes onClose={() => setIsScenesListVisible(false)} onSceneSelect={id => { const scene = scenesData.find(s => s.id === id); if (scene) { setActiveScene(scene); setIsScenesListVisible(false); } }} />}
      {activeScene && <SceneViewer scene={activeScene} onClose={() => setActiveScene(null)} onBackToScenes={() => { setActiveScene(null); setIsScenesListVisible(true); }} />}
    </div>
  );
};
export default App;
