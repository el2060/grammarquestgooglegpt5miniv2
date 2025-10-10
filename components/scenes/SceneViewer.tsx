import React, { useState } from 'react';
import type { Scene, Panel, DialogueLine } from '../../types';
import { XMarkIcon } from '../icons/XMarkIcon';
import { InformationCircleIcon } from '../icons/InformationCircleIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';

interface SceneViewerProps {
  scene: Scene;
  onClose: () => void;
  onBackToScenes: () => void;
}

const renderWithHighlight = (text: string) => {
  const parts = text.split(/<b>(.*?)<\/b>/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? <span key={index} className="bg-yellow-200 text-yellow-900 font-semibold px-1 py-0.5 rounded-md">{part}</span> : part
  );
};

const DialoguePanel: React.FC<{ panel: Panel }> = ({ panel }) => {
  const { character, line, annotation } = panel.content as DialogueLine;
  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl border border-slate-200">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-3">
          {character.charAt(0)}
        </div>
        <span className="font-semibold text-slate-800">{character}</span>
      </div>
      <p className="text-base sm:text-lg text-slate-700">"{renderWithHighlight(line)}"</p>
      {annotation && <p className="text-sm text-slate-500 mt-3">💡 {annotation}</p>}
    </div>
  );
};

const ExplanationPanel: React.FC<{ panel: Panel, showExplanation: boolean, onToggle: () => void }> = ({ panel, showExplanation, onToggle }) => (
  <div className="space-y-4">
    <div className="p-4 sm:p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
      <p className="text-base sm:text-lg text-slate-800">{renderWithHighlight(panel.content as string)}</p>
      <button onClick={onToggle} className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
        <InformationCircleIcon className="w-5 h-5" />
        {showExplanation ? 'Hide explanation' : 'Show explanation'}
      </button>
    </div>
    {showExplanation && (
      <div className="p-4 sm:p-6 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
        <p className="text-base sm:text-lg text-emerald-800 font-medium">{panel.explanation}</p>
        {panel.explanationAnnotation && (
          <p className="text-sm text-emerald-700 mt-3">💡 {panel.explanationAnnotation}</p>
        )}
      </div>
    )}
  </div>
);

const SummaryPanel: React.FC<{ panel: Panel }> = ({ panel }) => (
    <div className="space-y-4">
        <div className="p-4 sm:p-6 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-base sm:text-lg text-purple-800 italic">{panel.content as string}</p>
             {panel.explanationAnnotation && (
                <p className="text-sm text-purple-700 mt-3">💡 {panel.explanationAnnotation}</p>
            )}
        </div>
         <div className="p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-xl flex items-start">
            <InformationCircleIcon className="w-10 h-10 text-blue-600 mr-4 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-blue-800">Key Takeaway</h4>
                <p className="text-blue-700 mt-1">{panel.keyTakeaway}</p>
            </div>
        </div>
    </div>
);


export const SceneViewer: React.FC<SceneViewerProps> = ({ scene, onClose, onBackToScenes }) => {
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const currentPanel = scene.panels[currentPanelIndex];

  const handleNext = () => {
    setShowExplanation(false);
    if (currentPanelIndex < scene.panels.length - 1) {
      setCurrentPanelIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setShowExplanation(false);
    if (currentPanelIndex > 0) {
      setCurrentPanelIndex(prev => prev - 1);
    }
  };
  
  const handleReplay = () => {
    setShowExplanation(false);
    setCurrentPanelIndex(0);
  };

  const isLastPanel = currentPanelIndex === scene.panels.length - 1;

  const renderPanel = () => {
    switch (currentPanel.type) {
      case 'dialogue':
        return <DialoguePanel panel={currentPanel} />;
      case 'explanation':
        return <ExplanationPanel panel={currentPanel} showExplanation={showExplanation} onToggle={() => setShowExplanation(p => !p)} />;
      case 'summary':
        return <SummaryPanel panel={currentPanel} />;
      default:
        return null;
    }
  };
  
  const progressPercentage = ((currentPanelIndex + 1) / scene.panels.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white/70">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <scene.icon className="w-7 h-7 text-slate-700" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800">{scene.title}</h2>
                        <p className="text-sm text-slate-600">{scene.description}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 ml-2">
                    <XMarkIcon className="w-6 h-6 text-slate-500" />
                </button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{width: `${progressPercentage}%`}}></div>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto min-h-[300px]">
          {renderPanel()}
        </div>
        
        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white/70 border-t border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <button onClick={handleBack} disabled={currentPanelIndex === 0} className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 flex items-center gap-2 transition-colors hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeftIcon className="w-5 h-5"/> Back
            </button>
            <span className="text-sm font-medium text-slate-500 hidden sm:block">
                Panel {currentPanelIndex + 1} of {scene.panels.length}
            </span>
            {isLastPanel ? (
                <div className="flex items-center gap-3">
                    <button onClick={handleReplay} className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 flex items-center gap-2 transition-colors hover:bg-slate-100">
                        <ArrowPathIcon className="w-5 h-5"/> Replay
                    </button>
                    <button onClick={onBackToScenes} className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors hover:bg-green-700">
                        All Scenes
                    </button>
                </div>
            ) : (
                <button onClick={handleNext} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors hover:bg-blue-700">
                    Next <ChevronRightIcon className="w-5 h-5"/>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};