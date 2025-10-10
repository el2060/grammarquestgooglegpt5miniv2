import React, { useState, useEffect } from 'react';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';

interface GrammarInsight {
  id: string;
  type: 'fact' | 'myth' | 'tip' | 'challenge' | 'thought';
  content: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const GRAMMAR_INSIGHTS: GrammarInsight[] = [
  {
    id: 'fact-1',
    type: 'fact',
    content: "Singapore Grammar Fact:",
    detail: "In Singapore English, 'can' is often used alone: 'Can you help?' 'Can!' This is perfectly acceptable locally!",
    icon: LightBulbIcon,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    id: 'myth-1',
    type: 'myth',
    content: "Grammar Myth Buster:",
    detail: "You CAN end a sentence with a preposition if it sounds natural! 'Where are you from?' is perfectly fine.",
    icon: SparklesIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'tip-1',
    type: 'tip',
    content: "Pro Quiz Tip:",
    detail: "Read each option aloud - your ear often catches subject-verb agreement errors that your eye misses.",
    icon: BeakerIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'challenge-1',
    type: 'challenge',
    content: "Grammar Brain Teaser:",
    detail: "Which is correct: 'The data is' or 'The data are'? Both can be right depending on context!",
    icon: RocketLaunchIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'thought-1',
    type: 'thought',
    content: "Think About It:",
    detail: "Why do Singaporeans say 'I go first' instead of 'I'll go first'? It's actually more direct and efficient!",
    icon: QuestionMarkCircleIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    id: 'fact-2',
    type: 'fact',
    content: "Grammar Fact:",
    detail: "The word 'set' has over 430 different meanings in English - the most polysemous word!",
    icon: LightBulbIcon,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    id: 'myth-2',
    type: 'myth',
    content: "Myth Busted:",
    detail: "Split infinitives (like 'to boldly go') are perfectly acceptable in modern English grammar!",
    icon: SparklesIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'tip-2',
    type: 'tip',
    content: "Quiz Strategy:",
    detail: "For grammar questions, eliminate options with obvious subject-verb disagreement first!",
    icon: BeakerIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'challenge-2',
    type: 'challenge',
    content: "Singapore Grammar:",
    detail: "Why do we say 'I am very the excited'? It's influence from Chinese grammar structure!",
    icon: RocketLaunchIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'thought-2',
    type: 'thought',
    content: "Grammar Philosophy:",
    detail: "Is 'different than' wrong? American English says no, British English prefers 'different from'!",
    icon: QuestionMarkCircleIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

const QUIZ_GENERATION_STEPS = [
  "Analyzing your grammar mistakes...",
  "Identifying key learning areas...",
  "Crafting personalized questions...",
  "Adding Singapore context...",
  "Fine-tuning difficulty levels...",
  "Almost ready to challenge you!"
];

interface QuizGenerationLoaderProps {
  text?: string;
  duration?: number;
}

export const QuizGenerationLoader: React.FC<QuizGenerationLoaderProps> = ({ 
  text = "Generating your personalized quiz...", 
  duration = 3500 
}) => {
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  // Rotate insights
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentInsightIndex((prev) => (prev + 1) % GRAMMAR_INSIGHTS.length);
        setIsVisible(true);
        setShowAnswer(false);
      }, 300);
    }, duration);

    return () => clearInterval(interval);
  }, [duration]);

  // Rotate generation steps faster
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % QUIZ_GENERATION_STEPS.length);
    }, 1200);

    return () => clearInterval(stepInterval);
  }, []);

  // Show answer for brain teasers
  useEffect(() => {
    const currentInsight = GRAMMAR_INSIGHTS[currentInsightIndex];
    if (currentInsight.type === 'challenge') {
      const timer = setTimeout(() => {
        setShowAnswer(true);
      }, duration - 1000);
      return () => clearTimeout(timer);
    }
  }, [currentInsightIndex, duration]);

  const currentInsight = GRAMMAR_INSIGHTS[currentInsightIndex];
  const IconComponent = currentInsight.icon;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl min-h-[500px] border border-slate-200/60 shadow-xl relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-100/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-16 h-16 bg-purple-100/30 rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-green-100/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-amber-100/30 rounded-full animate-bounce delay-500"></div>
      </div>

      {/* Main quiz generation spinner */}
      <div className="relative z-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-dashed border-blue-500 animate-spin"></div>
          <div className="absolute inset-2 w-20 h-20 rounded-full border-4 border-solid border-purple-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
          <div className="absolute inset-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-pulse flex items-center justify-center">
            <QuestionMarkCircleIcon className="w-8 h-8 text-white animate-bounce" />
          </div>
        </div>
      </div>

      {/* Dynamic generation steps */}
      <div className="text-center space-y-3 z-10 relative">
        <p className="text-xl font-bold text-slate-700">{text}</p>
        <p className="text-sm text-blue-600 font-medium animate-pulse">
          {QUIZ_GENERATION_STEPS[currentStepIndex]}
        </p>
        <div className="flex justify-center space-x-1">
          {QUIZ_GENERATION_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStepIndex 
                  ? 'bg-blue-500 scale-125' 
                  : index < currentStepIndex 
                    ? 'bg-green-400' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Interactive grammar insight card */}
      <div className={`transition-all duration-500 transform z-10 ${
        isVisible 
          ? 'opacity-100 scale-100 rotate-0' 
          : 'opacity-0 scale-90 rotate-2'
      }`}>
        <div className={`${currentInsight.bgColor} rounded-2xl p-6 shadow-lg border border-white/60 max-w-md mx-auto relative overflow-hidden`}>
          
          {/* Insight header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-xl bg-white shadow-md border border-gray-100 ${currentInsight.color}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${currentInsight.color.replace('text-', 'text-')} mb-1`}>
                {currentInsight.content}
              </h3>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                {currentInsight.type.replace('-', ' ')}
              </div>
            </div>
          </div>

          {/* Insight content */}
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed">
              {currentInsight.detail}
            </p>

            {/* Special handling for brain teasers */}
            {currentInsight.type === 'challenge' && (
              <div className={`mt-4 p-3 rounded-lg border-2 border-dashed transition-all duration-500 ${
                showAnswer 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}>
                {showAnswer ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-green-700 mb-1">Answer:</p>
                    {currentInsight.id === 'challenge-1' && (
                      <p className="text-green-600 italic">Both are correct! 'Data' can be singular (modern usage) or plural (traditional).</p>
                    )}
                    {currentInsight.id === 'challenge-2' && (
                      <p className="text-green-600 italic">Chinese grammar allows intensifiers before adjectives, creating this pattern!</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 animate-pulse">Think about it... Answer coming soon! 🤔</p>
                  </div>
                )}
              </div>
            )}

            {/* Interactive elements for different types */}
            {currentInsight.type === 'myth' && (
              <div className="flex items-center justify-center space-x-2 mt-3">
                <span className="text-2xl">🚫</span>
                <span className="text-sm font-medium text-purple-700">Myth Busted!</span>
                <span className="text-2xl">✨</span>
              </div>
            )}

            {currentInsight.type === 'tip' && (
              <div className="flex items-center justify-center space-x-2 mt-3">
                <span className="text-2xl">🎯</span>
                <span className="text-sm font-medium text-blue-700">Try this in your quiz!</span>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mt-4 flex justify-center space-x-1">
            {GRAMMAR_INSIGHTS.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentInsightIndex 
                    ? 'bg-gray-600 scale-125' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Encouraging footer */}
      <div className="text-center z-10 relative">
        <p className="text-sm text-slate-500 animate-pulse">
          🧠 <strong>Get ready!</strong> Your personalized quiz will test exactly what you need to improve.
        </p>
      </div>
    </div>
  );
};