import React, { useState, useMemo } from 'react';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { WrenchIcon } from './icons/WrenchIcon';
import { Squares2X2Icon } from './icons/Squares2X2Icon';
import { StarIcon } from './icons/StarIcon';
import { BuildingLibraryIcon } from './icons/BuildingLibraryIcon';
import { CursorArrowRippleIcon } from './icons/CursorArrowRippleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ALL_GRAMMAR_TOPICS } from '../constants';


const PRESETS: Record<string, string[]> = {
  'All Topics': ALL_GRAMMAR_TOPICS,
  'Core Essentials': [
    'Parts of speech',
    'Subject-verb agreement',
    'Tenses',
    'Dependent and independent clauses',
    'Punctuation',
  ],
  'Sentence Structure': [
    'Run-on sentences',
    'Misplaced and dangling modifiers',
    'Parallel structures',
    'Dependent and independent clauses',
  ],
  'Advanced Grammar': [
    'Literary devices',
    'Modals',
    'Modals of speculation',
    'Articles',
  ],
};

const PRESET_CONFIG = [
    { id: 'All Topics', title: 'All Topics', description: 'Comprehensive analysis of all grammar areas', icon: Squares2X2Icon },
    { id: 'Core Essentials', title: 'Core Essentials', description: 'Essential grammar fundamentals for clear writing', icon: StarIcon },
    { id: 'Sentence Structure', title: 'Sentence Structure', description: 'Focus on sentence construction and clarity', icon: BuildingLibraryIcon },
    { id: 'Advanced Grammar', title: 'Advanced Grammar', description: 'Complex grammar concepts and style', icon: CursorArrowRippleIcon },
]

interface GrammarFocusProps {
  selectedTopics: Set<string>;
  onSelectionChange: (newSelection: Set<string>) => void;
}

export const GrammarFocus: React.FC<GrammarFocusProps> = ({ selectedTopics, onSelectionChange }) => {
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);

  const handlePresetSelect = (presetId: string) => {
    onSelectionChange(new Set(PRESETS[presetId]));
  };

  const handleTopicToggle = (topic: string) => {
    const newSelection = new Set(selectedTopics);
    if (newSelection.has(topic)) {
      newSelection.delete(topic);
    } else {
      newSelection.add(topic);
    }
    onSelectionChange(newSelection);
  };
  
  const selectedSummary = useMemo(() => {
    if (selectedTopics.size === 0) return "No topics selected.";
    if (selectedTopics.size === ALL_GRAMMAR_TOPICS.length) return "All topics selected.";
    const firstFew = Array.from(selectedTopics).slice(0,3).join(', ');
    const remaining = selectedTopics.size - 3;
    return `Selected ${selectedTopics.size} topics: ${firstFew}${remaining > 0 ? ` and ${remaining} more` : ''}`;

  }, [selectedTopics]);

  return (
    <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start">
        <div className="flex items-start">
          <div className="bg-blue-600 text-white p-3 rounded-lg mr-4 flex-shrink-0">
            <BookOpenIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Grammar Focus</h2>
            <div className="flex items-center mt-1">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
              <p className="text-sm font-medium text-slate-600">{selectedTopics.size} topics selected</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}
          className="flex items-center text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-100 transition-colors mt-4 sm:mt-0 w-full sm:w-auto justify-center"
        >
          {isAdvancedVisible ? 'Close Advanced' : 'Advanced Options'}
          {isAdvancedVisible ? <ChevronUpIcon className="w-4 h-4 ml-2" /> : <ChevronDownIcon className="w-4 h-4 ml-2" />}
        </button>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-6">
         <div className="flex items-center mb-4">
            <SparklesIcon className="w-5 h-5 text-amber-500 mr-2" />
            <h3 className="text-md font-semibold text-slate-700">Quick Selection:</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRESET_CONFIG.map(({ id, title, description, icon: Icon }) => (
                 <button key={id} onClick={() => handlePresetSelect(id)} className="bg-white p-4 rounded-lg border border-slate-200 text-left hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all">
                    <div className="flex items-center">
                        <div className="bg-slate-100 p-2 rounded-md mr-3">
                            <Icon className="w-5 h-5 text-slate-600" />
                        </div>
                        <h4 className="font-bold text-slate-800">{title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{description}</p>
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{PRESETS[id].length} topics</span>
                        <span className="text-xs font-semibold text-slate-500">Click to select →</span>
                    </div>
                 </button>
            ))}
        </div>
      </div>
      
      {!isAdvancedVisible && (
       <p className="text-center text-sm text-slate-500 mt-6">
        Need more control? Use <button onClick={() => setIsAdvancedVisible(true)} className="font-semibold text-blue-600 hover:underline">Advanced Options</button> above for individual topic selection.
       </p>
      )}


      {isAdvancedVisible && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3 sm:gap-0">
            <div className="flex items-center">
                <WrenchIcon className="w-5 h-5 text-slate-500 mr-2" />
                <h3 className="text-md font-semibold text-slate-700">Advanced Customization:</h3>
            </div>
            <div className="flex items-center space-x-3">
                 <button onClick={() => onSelectionChange(new Set(ALL_GRAMMAR_TOPICS))} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/70 px-3 py-1.5 rounded-md hover:bg-blue-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                    Select All
                </button>
                 <button onClick={() => onSelectionChange(new Set())} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50/70 px-3 py-1.5 rounded-md hover:bg-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path></svg>
                    Clear All
                </button>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-4">Select individual topics for precise control over your grammar analysis focus.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_GRAMMAR_TOPICS.map(topic => (
              <label key={topic} className="flex items-center p-3 bg-white border-2 border-slate-200 rounded-lg transition-colors cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 hover:border-slate-300">
                <input
                  type="checkbox"
                  checked={selectedTopics.has(topic)}
                  onChange={() => handleTopicToggle(topic)}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-700">{topic}</span>
              </label>
            ))}
          </div>

          <div className="mt-6 bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 flex items-start">
             <CheckCircleIcon className="w-8 h-8 text-emerald-500 mr-3 flex-shrink-0" />
             <div>
                <h4 className="font-bold text-emerald-800">Custom Focus Active</h4>
                <p className="text-sm text-emerald-700 mt-1">{selectedSummary}</p>
                <p className="text-xs text-emerald-600 mt-1 italic">Analysis will prioritize these areas while maintaining comprehensive coverage.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};