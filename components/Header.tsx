import React from 'react';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { BoltIcon } from './icons/BoltIcon';

type View = 'diagnostics' | 'quiz' | 'badges';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const navItems: { view: View; label: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'diagnostics', label: 'Diagnostic', icon: MagnifyingGlassIcon },
    { view: 'quiz', label: 'Mini Quiz', icon: BoltIcon },
    { view: 'badges', label: 'Badges', icon: TrophyIcon },
];

const NavItem: React.FC<{
    item: typeof navItems[0];
    isActive: boolean;
    onClick: (view: View) => void;
}> = ({ item, isActive, onClick }) => {
    return (
        <button
            onClick={() => onClick(item.view)}
            className={`relative z-10 flex-1 px-3 py-4 text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:scale-105'}`}
        >
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.label.split(' ')[0]}</span>
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const activeIndex = navItems.findIndex(item => item.view === currentView);
    const indicatorStyle = {
        transform: `translateX(${activeIndex * 100}%)`,
    };

    return (
        <nav className="flex justify-center">
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 p-1.5 rounded-2xl flex items-center justify-center w-full max-w-md shadow-lg border border-slate-200/50">
                <div
                    className="absolute top-1.5 left-1.5 h-[calc(100%-12px)] w-1/3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg transition-transform duration-300 ease-in-out"
                    style={indicatorStyle}
                ></div>
                {navItems.map((item) => (
                    <NavItem
                        key={item.view}
                        item={item}
                        isActive={currentView === item.view}
                        onClick={setView}
                    />
                ))}
            </div>
        </nav>
    );
};