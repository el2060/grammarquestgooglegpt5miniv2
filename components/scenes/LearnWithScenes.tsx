import { Modal } from '../Modal';
import React from 'react';
import { scenesData } from './scenesData';
import { XMarkIcon } from '../icons/XMarkIcon';
import { InformationCircleIcon } from '../icons/InformationCircleIcon';
import { PlayIcon } from '../icons/PlayIcon';

interface LearnWithScenesProps {
  onClose: () => void;
  onSceneSelect: (sceneId: string) => void;
}

const SceneCard: React.FC<{ scene: typeof scenesData[0]; onSelect: () => void }> = ({ scene, onSelect }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col h-full transition-all hover:shadow-md hover:border-blue-300">
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
        <scene.icon className="w-7 h-7 text-slate-600" />
      </div>
      <InformationCircleIcon className="w-5 h-5 text-slate-400" />
    </div>
    <div className="mt-3 flex-grow">
      <h3 className="font-bold text-slate-800">{scene.title}</h3>
      <p className="text-sm text-slate-600 mt-1">{scene.description}</p>
    </div>
    <div className="mt-4 flex justify-between items-center">
      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
        {scene.panels.length} panels
      </span>
      <button onClick={onSelect} className="text-sm font-semibold text-blue-600 hover:underline">
        Start scene &gt;
      </button>
    </div>
  </div>
);

export const LearnWithScenes: React.FC<LearnWithScenesProps> = ({ onClose, onSceneSelect }) => {
  return (
    <Modal label="Learn with Scenes" onClose={onClose}>
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <PlayIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Learn with Scenes</h2>
              <p className="text-sm text-slate-600">Explore grammar through bite-sized, interactive stories</p>
            </div>
          </div>
          <button aria-label="Close scenes" onClick={onClose} className="p-2 rounded-full hover:bg-slate-200">
            <XMarkIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
          <p className="text-sm text-slate-700 mb-6">
            Master grammar concepts through relatable Singapore campus moments. Each scene teaches a key grammar skill with clear examples and friendly explanations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {scenesData.map(scene => (
              <SceneCard key={scene.id} scene={scene} onSelect={() => onSceneSelect(scene.id)} />
            ))}
          </div>
        </div>
        <div className="p-5 sm:p-6 border-t border-slate-200 bg-white/50 rounded-b-2xl">
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Take your time:</span> These scenes are self-paced with no scoring or timers. Click through at your own speed, replay as needed, and focus on understanding each concept.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};