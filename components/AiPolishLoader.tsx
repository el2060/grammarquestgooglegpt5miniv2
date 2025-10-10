import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

const POLISH_STEPS = [
  "🔍 Scanning for improvements...",
  "✨ Enhancing clarity and flow...", 
  "📝 Refining word choices...",
  "🎯 Perfecting sentence structure...",
  "🌟 Adding that final polish..."
];

const WRITING_POLISH_TIPS = [
  "Great writing is rewriting - AI helps polish your draft to perfection!",
  "Clear communication is the goal - good polish removes unnecessary complexity.",
  "The best writing sounds natural and flows smoothly from sentence to sentence.",
  "Every revision makes your message stronger and more professional.",
  "Polish reveals the brilliance already hidden in your writing.",
  "AI polish maintains your unique voice while improving readability.",
  "Good editing removes clutter and highlights your best ideas.",
  "Professional writing comes from thoughtful revision and careful polishing."
];

interface AiPolishLoaderProps {
  text?: string;
}

export const AiPolishLoader: React.FC<AiPolishLoaderProps> = ({ 
  text = "AI is polishing your text..." 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % POLISH_STEPS.length);
    }, 1000);

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % WRITING_POLISH_TIPS.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-gradient-to-br from-violet-50 via-white to-pink-50/30 rounded-2xl min-h-[400px] border border-violet-200/60 shadow-lg">
      
      {/* Polish animation */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 animate-pulse shadow-lg flex items-center justify-center">
          <SparklesIcon className="w-10 h-10 text-white animate-bounce" />
        </div>
        
        {/* Orbiting elements */}
        <div className="absolute inset-0 animate-spin" style={{animationDuration: '8s'}}>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <PencilSquareIcon className="w-4 h-4 text-violet-500" />
          </div>
          <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
            <ArrowPathIcon className="w-4 h-4 text-pink-500" />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <SparklesIcon className="w-4 h-4 text-purple-500" />
          </div>
          <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
            <PencilSquareIcon className="w-4 h-4 text-violet-500" />
          </div>
        </div>
      </div>

      {/* Main text */}
      <div className="text-center space-y-3">
        <p className="text-xl font-bold text-slate-700">{text}</p>
        <p className="text-violet-600 font-medium animate-pulse">
          {POLISH_STEPS[currentStepIndex]}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex space-x-2">
        {POLISH_STEPS.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStepIndex 
                ? 'bg-violet-500 scale-125' 
                : index < currentStepIndex 
                  ? 'bg-pink-400' 
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Writing tip */}
      <div className="bg-white/80 rounded-xl p-4 border border-violet-200/50 max-w-md mx-auto shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">💡</span>
          </div>
          <div>
            <p className="text-sm font-medium text-violet-800 mb-1">Writing Polish Tip:</p>
            <p className="text-violet-700 text-sm leading-relaxed animate-pulse">
              {WRITING_POLISH_TIPS[currentTipIndex]}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-500 text-center">
        ✨ AI is crafting the perfect version of your text
      </p>
    </div>
  );
};