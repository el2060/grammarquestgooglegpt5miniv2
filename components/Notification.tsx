import React from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';

interface NotificationProps {
  title: string;
  xp: number;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ title, xp, onClose }) => {
  return (
    <div
      className="fixed top-4 left-4 right-4 sm:left-auto z-50 sm:w-full max-w-sm bg-white shadow-lg rounded-xl p-4 border border-slate-200 animate-slide-in-right"
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CheckBadgeIcon className="h-7 w-7 text-green-500" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-bold text-slate-800">Badge Unlocked!</p>
          <p className="mt-1 text-sm text-slate-600">
            You've earned the "{title}" badge.
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-700">
            +{xp} XP Bonus!
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-slate-400 rounded-md hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};


const styles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out forwards;
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);