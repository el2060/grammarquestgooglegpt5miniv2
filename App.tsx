import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Diagnostics } from './components/Diagnostics';
import { TopicSelector } from './components/TopicSelector';
import { Badges } from './components/Badges';
import type { BadgeId, Scene, Badge } from './types';
import { ALL_BADGES, XP_PER_CORRECT_ANSWER, ALL_GRAMMAR_TOPICS, LEVELS } from './constants';
import { GrammarFocus } from './components/GrammarFocus';
import { TrashIcon } from './components/icons/TrashIcon';
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';
import { LearnWithScenes } from './components/scenes/LearnWithScenes';
import { SceneViewer } from './components/scenes/SceneViewer';
import { scenesData } from './components/scenes/scenesData';
import { PencilIcon } from './components/icons/PencilIcon';
import { Notification } from './components/Notification';

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

interface ProfileHeaderProps {
  levelInfo: ReturnType<typeof getCurrentLevelInfo>;
  totalXp: number;
  badgesEarnedCount: number;
  onResetAll: () => void;
}


const ProfileHeader: React.FC<ProfileHeaderProps> = ({ levelInfo, totalXp, badgesEarnedCount, onResetAll }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-gradient-to-br from-white via-white to-blue-50/30 p-4 sm:p-6 rounded-3xl shadow-xl border border-slate-200/60 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-shrink-0 order-2 sm:order-1">
           <img src="https://www.np.edu.sg/images/default-source/default-album/img-logo.png?sfvrsn=764583a6_19" alt="Ngee Ann Polytechnic Logo" className="h-8 sm:h-9 opacity-90" />
        </div>

        <div className="text-center sm:text-left order-1 sm:order-2 sm:flex-grow sm:ml-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Grammar Quest Coach</h1>
          <p className="text-sm sm:text-md text-slate-600 mt-1 font-medium">✨ AI Adaptive, Gamified Learning</p>
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-2">
            <span className="text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50 font-medium">Module: English Language Express (ELE)</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50 font-medium">School of HMIS</span>
          </div>
        </div>

        <div className="text-right text-sm flex-shrink-0 space-y-2 order-3 w-full sm:w-auto">
           <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            <p className="font-medium text-slate-600 text-xs sm:text-sm">{currentDate}</p>
             <button onClick={onResetAll} className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition-all hover:scale-105 border border-rose-200/50">
                <TrashIcon className="w-4 h-4"/>
                Reset All
             </button>
           </div>
          <div className="flex items-center justify-end gap-2 text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200/50">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0"/>
            <span className="text-left sm:text-right font-medium">Use with discretion. AI may make mistakes.</span>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200/60 pt-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="flex items-center bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 sm:p-5 rounded-2xl w-full md:flex-grow border border-slate-200/50 shadow-sm">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 sm:p-4 rounded-xl mr-4 sm:mr-5 flex-shrink-0 shadow-md">
              <PencilIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
          </div>
          <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{levelInfo.title}</h2>
                  <span className="font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm mt-1 sm:mt-0 shadow-md">Level {levelInfo.level} of {LEVELS.length}</span>
              </div>
              <p className="text-sm sm:text-md text-slate-600 mt-1 font-medium">{levelInfo.description}</p>
              <div className="mt-3 sm:mt-4">
                  <div className="flex justify-between text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                      <span>{levelInfo.progressLabel}</span>
                      {!levelInfo.isMaxLevel && <span><span className="font-bold text-blue-600">{levelInfo.currentLevelXp}</span> / {levelInfo.xpForNextLevel} XP</span>}
                  </div>
                  <div className="bg-slate-200 rounded-full h-3 shadow-inner">
                      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-md" style={{ width: `${levelInfo.progressPercentage}%` }}></div>
                  </div>
              </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full md:w-auto md:flex-shrink-0 md:w-64">
            <div className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200/70 text-center border border-blue-200/50 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-3xl sm:text-4xl font-bold text-blue-600">{totalXp}</p>
              <p className="text-xs sm:text-sm text-blue-800 font-medium">Total XP</p>
            </div>
            <div className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200/70 text-center border border-green-200/50 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-3xl sm:text-4xl font-bold text-green-600">{badgesEarnedCount}</p>
              <p className="text-xs sm:text-sm text-green-800 font-medium">Badges Earned</p>
            </div>
          </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [view, setView] = useState<View>('diagnostics');
  const [xp, setXp] = useState<number>(() => {
    const savedXp = localStorage.getItem('userXp');
    return savedXp ? parseInt(savedXp, 10) : 0;
  });
  const [unlockedBadges, setUnlockedBadges] = useState<Set<BadgeId>>(() => {
    const savedBadges = localStorage.getItem('unlockedBadges');
    return savedBadges ? new Set(JSON.parse(savedBadges)) : new Set();
  });
  const [masteryProgress, setMasteryProgress] = useState<Record<string, number>>(() => {
    const savedProgress = localStorage.getItem('masteryProgress');
    return savedProgress ? JSON.parse(savedProgress) : {};
  });
    // FIX: Add state to track diagnostic analyses count for new badge type.
    const [diagnosticAnalysesCount, setDiagnosticAnalysesCount] = useState<number>(() => {
    const savedCount = localStorage.getItem('diagnosticAnalysesCount');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(() => new Set(ALL_GRAMMAR_TOPICS));

  const [isScenesListVisible, setIsScenesListVisible] = useState(false);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [notification, setNotification] = useState<{title: string; xp: number} | null>(null);
  const [diagnosticsKey, setDiagnosticsKey] = useState(0);
  const [miniQuizKey, setMiniQuizKey] = useState(0);

  const levelInfo = getCurrentLevelInfo(xp);

  useEffect(() => {
    localStorage.setItem('userXp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('unlockedBadges', JSON.stringify(Array.from(unlockedBadges)));
  }, [unlockedBadges]);

  useEffect(() => {
    localStorage.setItem('masteryProgress', JSON.stringify(masteryProgress));
  }, [masteryProgress]);
  
    // FIX: Add useEffect to save diagnostic analyses count to local storage.
    useEffect(() => {
    localStorage.setItem('diagnosticAnalysesCount', diagnosticAnalysesCount.toString());
  }, [diagnosticAnalysesCount]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // Notification disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleResetAll = () => {
    // Clear persistent storage
    localStorage.removeItem('userXp');
    localStorage.removeItem('unlockedBadges');
    localStorage.removeItem('masteryProgress');
    localStorage.removeItem('diagnosticAnalysesCount');

    // Reload the page to ensure all state is cleared from memory
    window.location.reload();
  };

  const handleUnlockBadge = useCallback((badge: Badge) => {
    setUnlockedBadges(prev => {
      if (prev.has(badge.id)) {
        return prev;
      }
      const newBadges = new Set(prev);
      newBadges.add(badge.id);
      
      setXp(currentXp => currentXp + badge.xp);
      setNotification({ title: badge.title, xp: badge.xp });
      
      return newBadges;
    });
  }, []);
  
    // FIX: Add handler to be called when a diagnostic analysis is completed.
    const handleDiagnosticAnalysisComplete = () => {
    setDiagnosticAnalysesCount(prev => prev + 1);
  };

  const handleQuizComplete = useCallback((score: number, questionsAnswered: number, correctAnswersByTopic: Record<string, number>, xpMultiplier: number = 1) => {
    setXp(prevXp => prevXp + Math.round(score * XP_PER_CORRECT_ANSWER * xpMultiplier));

    setMasteryProgress(prevProgress => {
        const newProgress = { ...prevProgress };
        for (const topic in correctAnswersByTopic) {
            newProgress[topic] = (newProgress[topic] || 0) + correctAnswersByTopic[topic];
        }
        return newProgress;
    });
  }, []);
  
  // FIX: Update badge unlocking logic to handle both 'mastery' and 'diagnostic' badge types.
  useEffect(() => {
    ALL_BADGES.forEach(badge => {
        if (unlockedBadges.has(badge.id)) return;

        if (badge.type === 'mastery' && badge.topic) {
            if ((masteryProgress[badge.topic] || 0) >= badge.masteryThreshold!) {
                handleUnlockBadge(badge);
            }
        } else if (badge.type === 'diagnostic' && badge.analysisCount) {
            if (diagnosticAnalysesCount >= badge.analysisCount) {
                handleUnlockBadge(badge);
            }
        }
    });
  }, [masteryProgress, diagnosticAnalysesCount, unlockedBadges, handleUnlockBadge]);


  const handleSelectScene = (sceneId: string) => {
    const scene = scenesData.find(s => s.id === sceneId);
    if (scene) {
      setActiveScene(scene);
      setIsScenesListVisible(false);
    }
  };

  const handleBackToScenes = () => {
    setActiveScene(null);
    setIsScenesListVisible(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 text-slate-800 flex flex-col">
        <main className="flex-grow container mx-auto p-2 sm:p-4 md:p-6 max-w-7xl w-full">
          <ProfileHeader 
            levelInfo={levelInfo} 
            totalXp={xp} 
            badgesEarnedCount={unlockedBadges.size}
            onResetAll={handleResetAll} 
          />
          <Header currentView={view} setView={setView} />
          <div className="mt-6 sm:mt-8">
            <div style={{ display: view === 'diagnostics' ? 'block' : 'none' }}>
              <GrammarFocus selectedTopics={selectedTopics} onSelectionChange={setSelectedTopics} />
              <div className="mt-6 sm:mt-8">
                  <Diagnostics 
                    key={diagnosticsKey}
                    onQuizComplete={handleQuizComplete} 
                    selectedTopics={Array.from(selectedTopics)} 
                    onLearnWithScenesClick={() => setIsScenesListVisible(true)}
                    onAnalysisComplete={handleDiagnosticAnalysisComplete}
                  />
              </div>
            </div>
            <div style={{ display: view === 'quiz' ? 'block' : 'none' }}>
               <TopicSelector 
                  key={miniQuizKey} 
                  onQuizComplete={handleQuizComplete}
                  unlockedBadges={unlockedBadges}
                />
            </div>
            <div style={{ display: view === 'badges' ? 'block' : 'none' }}>
                <Badges 
                    allBadges={ALL_BADGES} 
                    unlockedBadges={ALL_BADGES.filter(b => unlockedBadges.has(b.id))} 
                    masteryProgress={masteryProgress}
                    diagnosticAnalysesCount={diagnosticAnalysesCount}
                />
            </div>
          </div>
        </main>
      </div>
      {notification && (
        <Notification
          title={notification.title}
          xp={notification.xp}
          onClose={() => setNotification(null)}
        />
      )}
      {isScenesListVisible && (
        <LearnWithScenes
          onClose={() => setIsScenesListVisible(false)}
          onSceneSelect={handleSelectScene}
        />
      )}
      {activeScene && (
        <SceneViewer
          scene={activeScene}
          onClose={() => setActiveScene(null)}
          onBackToScenes={handleBackToScenes}
        />
      )}
    </>
  );
};

export default App;