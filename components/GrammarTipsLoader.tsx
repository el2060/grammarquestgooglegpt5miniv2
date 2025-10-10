import React, { useState, useEffect } from 'react';
import { PartsOfSpeechIcon } from './icons/PartsOfSpeechIcon';
import { ArrowsRightLeftIcon } from './icons/ArrowsRightLeftIcon';
import { TenseTitanIcon } from './icons/TenseTitanIcon';
import { ClauseCommanderIcon } from './icons/ClauseCommanderIcon';
import { StructureSentinelIcon } from './icons/StructureSentinelIcon';
import { ModifiersIcon } from './icons/ModifiersIcon';
import { ParallelIcon } from './icons/ParallelIcon';
import { SpeculationIcon } from './icons/SpeculationIcon';
import { LiteraryDevicesIcon } from './icons/LiteraryDevicesIcon';

interface GrammarTip {
  id: string;
  title: string;
  tip: string;
  example: string;
  wrongExample?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
}

const GRAMMAR_TIPS: GrammarTip[] = [
  {
    id: 'parts-of-speech',
    title: 'Parts of Speech',
    tip: "Identify nouns, verbs, and adjectives in your sentences",
    example: "The busy hawker uncle serves delicious laksa.",
    wrongExample: "The busy hawker uncle serve delicious laksa.",
    icon: PartsOfSpeechIcon,
    color: 'text-purple-600',
    bgGradient: 'from-purple-100 to-pink-100'
  },
  {
    id: 'subject-verb',
    title: 'Subject-Verb Agreement',
    tip: "Singular subjects need singular verbs, plural subjects need plural verbs",
    example: "My NS buddy is studying at NUS. ✓",
    wrongExample: "My NS buddy are studying at NUS. ✗",
    icon: ArrowsRightLeftIcon,
    color: 'text-blue-600',
    bgGradient: 'from-blue-100 to-cyan-100'
  },
  {
    id: 'tenses',
    title: 'Verb Tenses',
    tip: "Match your verbs to when the action happened",
    example: "Yesterday, I ate bak kut teh at Chinatown. ✓",
    wrongExample: "Yesterday, I eat bak kut teh at Chinatown. ✗",
    icon: TenseTitanIcon,
    color: 'text-green-600',
    bgGradient: 'from-green-100 to-emerald-100'
  },
  {
    id: 'clauses',
    title: 'Independent & Dependent Clauses',
    tip: "Independent clauses can stand alone; dependent clauses need support",
    example: "I love durian, even though it smells pungent.",
    wrongExample: "Even though it smells pungent. (incomplete)",
    icon: ClauseCommanderIcon,
    color: 'text-orange-600',
    bgGradient: 'from-orange-100 to-red-100'
  },
  {
    id: 'run-on',
    title: 'Run-on Sentences',
    tip: "Break long sentences with proper punctuation",
    example: "The queue is long. However, the char kway teow is worth waiting for!",
    wrongExample: "The queue is long however the char kway teow is worth waiting for.",
    icon: StructureSentinelIcon,
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-100 to-purple-100'
  },
  {
    id: 'modifiers',
    title: 'Misplaced Modifiers',
    tip: "Place descriptive words close to what they describe",
    example: "Walking to the kopitiam, I bumped into my teacher. ✓",
    wrongExample: "I bumped into my teacher walking to the kopitiam. (unclear)",
    icon: ModifiersIcon,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-100 to-orange-100'
  },
  {
    id: 'parallel',
    title: 'Parallel Structure',
    tip: "Keep lists and series in the same grammatical format",
    example: "I enjoy eating, sleeping, and shopping at Orchard Road. ✓",
    wrongExample: "I enjoy eating, sleeping, and to shop at Orchard Road. ✗",
    icon: ParallelIcon,
    color: 'text-teal-600',
    bgGradient: 'from-teal-100 to-blue-100'
  },
  {
    id: 'modals',
    title: 'Modal Verbs & Speculation',
    tip: "Use modals to express possibility, necessity, or uncertainty",
    example: "You should try the chicken rice at Tian Tian. It might be crowded.",
    wrongExample: "You must should try the chicken rice. (double modal)",
    icon: SpeculationIcon,
    color: 'text-pink-600',
    bgGradient: 'from-pink-100 to-rose-100'
  },
  {
    id: 'literary',
    title: 'Literary Devices',
    tip: "Use metaphors and similes to make writing more vivid",
    example: "The Marina Bay skyline sparkles like scattered diamonds.",
    wrongExample: "The Marina Bay skyline is tall buildings. (too plain)",
    icon: LiteraryDevicesIcon,
    color: 'text-violet-600',
    bgGradient: 'from-violet-100 to-purple-100'
  }
];

interface GrammarTipsLoaderProps {
  text?: string;
  duration?: number; // How long to show each tip in milliseconds
}

export const GrammarTipsLoader: React.FC<GrammarTipsLoaderProps> = ({ 
  text = "Analyzing your text...", 
  duration = 4000 
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showExample, setShowExample] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % GRAMMAR_TIPS.length);
        setIsAnimating(true);
        setShowExample(true);
      }, 300); // Brief pause for transition
      
    }, duration);

    return () => clearInterval(interval);
  }, [duration]);

  // Toggle between correct and incorrect examples
  useEffect(() => {
    if (GRAMMAR_TIPS[currentTipIndex].wrongExample) {
      const exampleInterval = setInterval(() => {
        setShowExample(prev => !prev);
      }, duration / 2);
      return () => clearInterval(exampleInterval);
    }
  }, [currentTipIndex, duration]);

  const currentTip = GRAMMAR_TIPS[currentTipIndex];
  const IconComponent = currentTip.icon;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 rounded-2xl min-h-[500px] border border-slate-200/60 shadow-xl">
      {/* Enhanced loading spinner with floating particles */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full animate-spin border-4 border-solid border-blue-500 border-t-transparent shadow-lg"></div>
        <div className="absolute inset-0 w-20 h-20 rounded-full animate-pulse bg-gradient-to-br from-blue-100 to-indigo-100 opacity-60"></div>
        
        {/* Floating particles */}
        <div className="absolute -top-2 -left-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
        </div>
        <div className="absolute -top-1 -right-3">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
        </div>
        <div className="absolute -bottom-2 -left-3">
          <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-500"></div>
        </div>
        <div className="absolute -bottom-1 -right-2">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-700"></div>
        </div>
      </div>
      
      {/* Enhanced loading text with typing animation */}
      <div className="text-center space-y-2">
        <p className="text-xl font-bold text-slate-700 animate-pulse">{text}</p>
        <p className="text-sm text-slate-500 animate-pulse delay-100">
          🧠 Learning grammar tips while GPT-5 mini works its magic...
        </p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>

      {/* Enhanced animated grammar tip card */}
      <div className={`transition-all duration-500 transform ${
        isAnimating 
          ? 'opacity-100 translate-y-0 scale-100 rotate-0' 
          : 'opacity-0 translate-y-8 scale-95 rotate-1'
      }`}>
        <div className={`bg-gradient-to-br ${currentTip.bgGradient} rounded-3xl p-8 shadow-2xl border border-white/60 max-w-lg mx-auto backdrop-blur-sm relative overflow-hidden`}>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          {/* Tip header with enhanced icon */}
          <div className="flex items-center space-x-4 mb-6 relative z-10">
            <div className={`p-4 rounded-2xl bg-white shadow-lg border border-white/60 group hover:scale-110 transition-transform duration-300`}>
              <IconComponent className={`w-8 h-8 ${currentTip.color} group-hover:animate-pulse`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-800 mb-1">{currentTip.title}</h3>
              <div className="flex space-x-1">
                {GRAMMAR_TIPS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === currentTipIndex 
                        ? 'w-8 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md' 
                        : 'w-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced tip content */}
          <div className="space-y-4 relative z-10">
            <div className="bg-white/80 rounded-2xl p-4 shadow-md border border-white/40 backdrop-blur-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">💡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Grammar Tip:</p>
                  <p className="text-blue-700 text-sm leading-relaxed">{currentTip.tip}</p>
                </div>
              </div>
            </div>

            {/* Dynamic example display */}
            <div className={`rounded-2xl p-4 shadow-md border backdrop-blur-sm transition-all duration-500 ${
              showExample || !currentTip.wrongExample
                ? 'bg-green-50/90 border-green-200/60' 
                : 'bg-red-50/90 border-red-200/60'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  showExample || !currentTip.wrongExample
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}>
                  <span className="text-white text-xs font-bold">
                    {showExample || !currentTip.wrongExample ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-1 ${
                    showExample || !currentTip.wrongExample
                      ? 'text-green-800' 
                      : 'text-red-800'
                  }`}>
                    Singapore Example:
                  </p>
                  <p className={`text-sm italic leading-relaxed transition-all duration-300 ${
                    showExample || !currentTip.wrongExample
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    "{showExample || !currentTip.wrongExample ? currentTip.example : currentTip.wrongExample}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced progress indicator */}
          <div className="mt-6 relative z-10">
            <div className="bg-white/60 rounded-full h-2 shadow-inner">
              <div 
                className={`bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-700 shadow-md relative overflow-hidden`}
                style={{ width: `${((currentTipIndex + 1) / GRAMMAR_TIPS.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-600">
                Tip {currentTipIndex + 1} of {GRAMMAR_TIPS.length}
              </p>
              <p className="text-xs text-gray-600">
                🇸🇬 Made for Singapore
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced footer with rotating messages */}
      <div className="text-center animate-pulse">
        <p className="text-sm text-slate-500 max-w-md leading-relaxed">
          ✨ <strong>Did you know?</strong> Good grammar makes your writing 3x more professional and easier to understand!
        </p>
      </div>
    </div>
  );
};
