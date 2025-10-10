import React from 'react';
import type { Badge } from '../types';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrophyIcon } from './icons/TrophyIcon';

interface BadgeCardProps {
    badge: Badge;
    isUnlocked: boolean;
    progressCount: number;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isUnlocked, progressCount }) => {
    // FIX: Dynamically determine the completion threshold based on the badge type.
    const threshold = badge.type === 'diagnostic' ? badge.analysisCount! : badge.masteryThreshold!;
    const progressPercentage = Math.min((progressCount / threshold) * 100, 100);

    return (
        <div className={`p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 ${isUnlocked ? 'bg-white shadow-sm border border-amber-200' : 'bg-slate-100/80 border border-transparent'}`}>
            <div className={`w-24 h-24 mb-4 flex items-center justify-center transition-all duration-500 ${isUnlocked ? 'scale-110' : ''}`}>
                {isUnlocked ? (
                    <div className="relative">
                        <badge.icon className="w-full h-full text-amber-500" />
                        <CheckBadgeIcon className="absolute -top-2 -right-2 h-9 w-9 text-green-500 bg-white rounded-full" />
                    </div>
                ) : (
                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center">
                        <badge.icon className="w-12 h-12 text-slate-400" />
                    </div>
                )}
            </div>
            <h3 className={`font-bold text-lg ${isUnlocked ? 'text-slate-800' : 'text-slate-600'}`}>{badge.title}</h3>
            <p className={`text-sm mt-1 flex-grow ${isUnlocked ? 'text-slate-600' : 'text-slate-500'}`}>{badge.description}</p>
            {!isUnlocked && (
                <div className="w-full mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1">
                        <span>Progress</span>
                        {/* FIX: Use the dynamically determined threshold for display. */}
                        <span>{progressCount}/{threshold}</span>
                    </div>
                    <div className="bg-slate-300 rounded-full h-1.5 w-full">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface BadgesProps {
  allBadges: Badge[];
  unlockedBadges: Badge[];
  masteryProgress: Record<string, number>;
  // FIX: Add prop to receive the count of diagnostic analyses performed.
  diagnosticAnalysesCount: number;
}

export const Badges: React.FC<BadgesProps> = ({ allBadges, unlockedBadges, masteryProgress, diagnosticAnalysesCount }) => {
  const unlockedIds = new Set(unlockedBadges.map(b => b.id));
  const progress = allBadges.length > 0 ? (unlockedBadges.length / allBadges.length) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                    <TrophyIcon className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Your Badges</h2>
                {/* FIX: Update descriptive text to include the new way of earning badges. */}
                <p className="text-base sm:text-lg text-slate-600 mt-3">
                    Earn badges by mastering grammar topics in quizzes or by analyzing your writing in the Diagnostic Tool. Each achievement unlocks valuable bonus XP!
                </p>
            </div>

            <div className="my-8 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-2 text-sm font-medium text-slate-600">
                    <span>Collection Progress</span>
                    <span>{unlockedBadges.length} / {allBadges.length}</span>
                </div>
                <div className="bg-slate-200 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-center text-sm text-slate-500 mt-2">{Math.round(progress)}% Complete</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {allBadges.map(badge => {
                    const isUnlocked = unlockedIds.has(badge.id);
                    // FIX: Dynamically calculate the progress count based on the badge type.
                    let progressCount = 0;
                    if (badge.type === 'mastery' && badge.topic) {
                        progressCount = Math.min(masteryProgress[badge.topic] || 0, badge.masteryThreshold!);
                    } else if (badge.type === 'diagnostic') {
                        progressCount = Math.min(diagnosticAnalysesCount, badge.analysisCount!);
                    }
                    
                    return (
                        <BadgeCard 
                            key={badge.id} 
                            badge={badge} 
                            isUnlocked={isUnlocked}
                            progressCount={progressCount}
                        />
                    );
                })}
            </div>
        </div>

        <div className="mt-8 bg-slate-100/80 p-8 rounded-2xl text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                <SparklesIcon className="w-7 h-7 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Start Your Journey!</h3>
            <p className="text-slate-600 mt-2 max-w-md">
                Complete quizzes and diagnostic exercises to earn your first badges. Each achievement unlocks valuable XP!
            </p>
            <p className="text-sm text-slate-500 mt-4">
                Try the Diagnostic Tool or Mini Quiz to get started.
            </p>
        </div>
    </div>
  );
};
