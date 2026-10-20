import React from 'react';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { BoltIcon } from './icons/BoltIcon';
type View = 'diagnostics' | 'quiz' | 'badges';
const items = [
  { view: 'diagnostics' as const, label: 'Writing Coach', icon: MagnifyingGlassIcon },
  { view: 'quiz' as const, label: 'Mini Quiz', icon: BoltIcon },
  { view: 'badges' as const, label: 'Badges', icon: TrophyIcon },
];
export function Header({ currentView, setView }: { currentView: View; setView: (view: View) => void }) {
  return <nav className="workspace-nav" aria-label="Learning activities">
    {items.map(({ view, label, icon: Icon }) => <button key={view} aria-current={currentView === view ? 'page' : undefined} onClick={() => setView(view)}><Icon className="w-4 h-4" />{label}</button>)}
  </nav>;
}
