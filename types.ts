import React from 'react';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
  explanation?: string;
}

export interface FeedbackItem {
  errorType: string;
  explanation: string;
  originalSentence: string;
  correctedSentence: string;
  learningTip: string;
}

export interface ModelRewrite {
    rewrittenText: string;
    summaryOfChanges: string[];
}

export interface GrammarTopic {
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export interface GrammarCategory {
  id: string;
  categoryTitle: string;
  topics: GrammarTopic[];
  unlockThreshold: number;
  xpMultiplier: number;
}


// FIX: Add diagnostic badge IDs to support the new achievement type.
export type BadgeId = 
  // Mastery
  'modal-master' | 'tense-titan' | 'punctuation-pro' | 'sv-sovereign' | 'clause-commander' | 'structure-sentinel' |
  // Diagnostic
  'feedback-seeker-1' | 'feedback-seeker-2' | 'feedback-seeker-3';

// FIX: Update the Badge interface to support different badge types ('mastery' and 'diagnostic') and their respective criteria.
export interface Badge {
  id: BadgeId;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  xp: number;
  type: 'mastery' | 'diagnostic';
  topic?: string;
  masteryThreshold?: number;
  analysisCount?: number;
}

// Types for "Learn with Scenes" feature
export interface DialogueLine {
  character: string;
  line: string;
  annotation?: string;
}

export interface Panel {
  type: 'dialogue' | 'explanation' | 'summary';
  content: string | DialogueLine;
  explanation?: string;
  explanationAnnotation?: string;
  keyTakeaway?: string;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  panels: Panel[];
}
