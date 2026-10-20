import React, { useState, useCallback, useMemo } from 'react';
import { generateQuiz } from '../services/geminiService';
import type { QuizQuestion, BadgeId } from '../types';
import { GRAMMAR_TOPIC_CATEGORIES, ALL_BADGES } from '../constants';
import { Quiz } from './Quiz';
import { Loader } from './Loader';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface TopicSelectorProps {
  onQuizComplete: (score: number, questionsAnswered: number, correctAnswersByTopic: Record<string, number>, xpMultiplier: number) => void;
  unlockedBadges: Set<BadgeId>;
  masteryProgress: Record<string, number>;
}

const TopicCard: React.FC<{ title: string; onSelect: () => void; icon: React.FC<{className?: string}> }> = ({ title, onSelect, icon: Icon }) => (
    <button
      onClick={onSelect}
      className="bg-gradient-to-br from-white to-blue-50/20 p-4 rounded-2xl text-slate-700 font-semibold text-center h-28 flex flex-col items-center justify-center gap-2 transition-all border border-slate-200/60 hover:border-blue-500 hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-sm  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
    >
      <Icon className="w-8 h-8 transition-transform group-hover:scale-110" />
      <span className="text-sm">{title}</span>
    </button>
);

export const TopicSelector: React.FC<TopicSelectorProps> = ({ onQuizComplete, unlockedBadges, masteryProgress }) => {
  const [selectedTopic, setSelectedTopic] = useState<{title: string; xpMultiplier: number} | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const masteredTopics = useMemo(() => {
    const topics = new Set<string>();
    unlockedBadges.forEach(badgeId => {
        const badge = ALL_BADGES.find(b => b.id === badgeId);
        if (badge?.topic) {
            topics.add(badge.topic);
        }
    });
    return topics;
  }, [unlockedBadges]);

  const handleSelectTopic = useCallback(async (topic: {title: string; xpMultiplier: number}) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const generatedQuiz = await generateQuiz(topic.title);
      setQuiz(generatedQuiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleQuizCompletion = useCallback((score: number, questionsAnswered: number, correctAnswersByTopic: Record<string, number>) => {
    onQuizComplete(score, questionsAnswered, correctAnswersByTopic, selectedTopic?.xpMultiplier || 1);
  }, [onQuizComplete, selectedTopic]);

  const handlePracticeAgain = useCallback(async () => {
    if (!selectedTopic) return;
    
    setIsLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const newQuiz = await generateQuiz(selectedTopic.title);
      setQuiz(newQuiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopic]);


  const reset = () => {
    setSelectedTopic(null);
    setQuiz(null);
    setError(null);
    setIsLoading(false);
  }

  if (isLoading) {
    return <div className="py-10"><Loader text={`Generating a quiz on ${selectedTopic?.title}...`} /></div>;
  }

  if (error) {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm text-center">
            <h3 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h3>
            <p role="alert" className="text-slate-600 mb-6">{error}</p>
            <button onClick={handlePracticeAgain} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Try Again
            </button>
            <button className="quiet-button ml-3" onClick={reset}>Choose another topic</button>
        </div>
    )
  }

  if (quiz && selectedTopic) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Mini Quiz: {selectedTopic.title}</h2>
                    <p className="text-slate-600 mt-1 text-sm sm:text-base font-medium">Test your knowledge with these contextual questions.</p>
                </div>
                <button onClick={reset} className="text-sm font-semibold text-blue-600 hover:text-blue-700  transition-all flex-shrink-0 ml-4">
                    Choose another topic
                </button>
            </div>
            <Quiz questions={quiz} onQuizComplete={handleQuizCompletion} quizId={selectedTopic.title} onPracticeAgain={handlePracticeAgain} xpMultiplier={selectedTopic.xpMultiplier} />
        </div>
    );
  }



  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Your practice path</h2>
        <p className="text-slate-600 mb-8 sm:mb-10 text-base sm:text-lg font-medium">Choose a grammar area you want to focus on. We'll generate a personalized quiz with relatable Singaporean contexts.</p>
      </div>
      <div className="space-y-10">
        {GRAMMAR_TOPIC_CATEGORIES.map((category, index) => {
            const previousTopics = index > 0 ? GRAMMAR_TOPIC_CATEGORIES[index - 1].topics : [];
            const masteredInPreviousCategory = previousTopics.filter(topic => masteredTopics.has(topic.title) || (masteryProgress[topic.title] || 0) >= 5).length;
            const isLocked = index > 0 && masteredInPreviousCategory < category.unlockThreshold;
            const remaining = Math.max(0, category.unlockThreshold - masteredInPreviousCategory);
            const progress = index > 0 ? Math.min((masteredInPreviousCategory / category.unlockThreshold) * 100, 100) : 100;

            return (
                <div key={category.id}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 border-b border-slate-200 pb-3">
                        <h3 className="text-2xl font-bold text-slate-800">{category.categoryTitle}</h3>
                        {category.xpMultiplier > 1 && (
                            <span className="font-semibold text-amber-800 bg-amber-200 px-3 py-1 rounded-full text-sm mt-2 sm:mt-0">
                                {category.xpMultiplier}x XP Boost
                            </span>
                        )}
                    </div>
                    {isLocked ? (
                         <div className="text-center p-8 bg-slate-100/80 rounded-xl border-2 border-dashed border-slate-300">
                             <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                                 <LockClosedIcon className="w-7 h-7 text-slate-500" />
                             </div>
                             <h4 className="mt-4 text-xl font-bold text-slate-700">Category Locked</h4>
                             <p className="text-slate-500 mt-2">
                                 Master {remaining} more topic{remaining !== 1 ? 's' : ''} from the previous category to unlock. A topic is mastered after 5 correct answers.
                             </p>
                              <div className="w-full max-w-xs mx-auto mt-4">
                                  <div className="bg-slate-300 rounded-full h-2 w-full">
                                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%`}}></div>
                                  </div>
                              </div>
                         </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {category.topics.map(topic => (
                              <TopicCard 
                                key={topic.title}
                                title={topic.title}
                                icon={topic.icon}
                                onSelect={() => handleSelectTopic({ title: topic.title, xpMultiplier: category.xpMultiplier })}
                              />
                            ))}
                        </div>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
};