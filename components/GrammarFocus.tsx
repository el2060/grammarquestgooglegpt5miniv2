import React, { useState } from 'react';
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

interface GrammarFocusProps {
  selectedTopics: Set<string>;
  onSelectionChange: (topics: Set<string>) => void;
}
export function GrammarFocus({ selectedTopics, onSelectionChange }: GrammarFocusProps) {
  const [expanded, setExpanded] = useState(false);
  function toggle(topic: string) {
    const next = new Set(selectedTopics);
    next.has(topic) ? next.delete(topic) : next.add(topic);
    onSelectionChange(next);
  }
  return <section className="focus-panel" aria-labelledby="focus-heading">
    <div className="flex items-center justify-between gap-3"><div><h2 id="focus-heading">Grammar focus</h2><p className="mt-1">{selectedTopics.size} of {ALL_GRAMMAR_TOPICS.length} topics selected</p></div><button className="focus-toggle" aria-expanded={expanded} aria-controls="focus-options" onClick={() => setExpanded(!expanded)}>{expanded ? 'Done' : 'Change focus'}</button></div>
    <div id="focus-options" className="focus-options" data-open={expanded}>
    <div className="focus-presets" aria-label="Focus presets">
      {Object.entries(PRESETS).map(([name, topics]) => <button key={name} aria-pressed={selectedTopics.size === topics.length && topics.every(topic => selectedTopics.has(topic))} onClick={() => onSelectionChange(new Set(topics))}>{name}</button>)}
    </div>
    <details>
      <summary>Choose individual topics</summary>
      <div className="flex justify-between gap-2 border-b border-slate-100 my-2"><button className="quiet-button" onClick={() => onSelectionChange(new Set(ALL_GRAMMAR_TOPICS))}>Select all</button><button className="quiet-button" onClick={() => onSelectionChange(new Set())}>Clear all</button></div>
      {ALL_GRAMMAR_TOPICS.map(topic => <label key={topic} className="focus-topic"><input type="checkbox" checked={selectedTopics.has(topic)} onChange={() => toggle(topic)} /><span>{topic}</span></label>)}
    </details>
    </div>
    {selectedTopics.size === 0 && <p role="status" className="mt-3 text-rose-700">Select at least one topic to analyse your writing.</p>}
  </section>;
}
