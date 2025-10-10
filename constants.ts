import type { Badge, GrammarCategory } from './types';
import { KeyIcon } from './components/icons/KeyIcon';
import { TenseTitanIcon } from './components/icons/TenseTitanIcon';
import { PunctuationProIcon } from './components/icons/PunctuationProIcon';
import { ArrowsRightLeftIcon } from './components/icons/ArrowsRightLeftIcon';
import { ClauseCommanderIcon } from './components/icons/ClauseCommanderIcon';
import { StructureSentinelIcon } from './components/icons/StructureSentinelIcon';
import { PartsOfSpeechIcon } from './components/icons/PartsOfSpeechIcon';
import { ModifiersIcon } from './components/icons/ModifiersIcon';
import { ParallelIcon } from './components/icons/ParallelIcon';
import { LiteraryDevicesIcon } from './components/icons/LiteraryDevicesIcon';
import { SpeculationIcon } from './components/icons/SpeculationIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
// FIX: Import icon for new diagnostic badges.
import { PencilSquareIcon } from './components/icons/PencilSquareIcon';

export const XP_PER_CORRECT_ANSWER = 10;
// FIX: Remove MASTERY_THRESHOLD constant, as it's now defined per badge for more flexibility.

export const LEVELS = [
  { level: 1, title: 'Beginner', description: 'Starting your grammar journey', minXp: 0 },
  { level: 2, title: 'Explorer', description: 'Learning the basic rules', minXp: 100 },
  { level: 3, title: 'Apprentice', description: 'Building your core skills', minXp: 250 },
  { level: 4, title: 'Builder', description: 'Constructing solid sentences', minXp: 500 },
  { level: 5, title: 'Practitioner', description: 'Applying knowledge with consistency', minXp: 800 },
  { level: 6, title: 'Specialist', description: 'Honing your skills in specific areas', minXp: 1200 },
  { level: 7, title: 'Proficient', description: 'Writing with confidence and clarity', minXp: 1700 },
  { level: 8, title: 'Expert', description: 'Demonstrating advanced understanding', minXp: 2300 },
  { level: 9, title: 'Virtuoso', description: 'Showing exceptional command of the language', minXp: 3000 },
  { level: 10, title: 'Master', description: "You've achieved grammar mastery!", minXp: 4000 },
];

export const SAMPLE_TEXTS = [
    "Our CCA are planning a event for next month. Yesterday we has a meeting to brainstorm ideas. My job is to design the poster, it is quite fun but also challenging. I must makes sure all the informations is correct. I hope many people will come for the event, it will be very happening.",
    "My final year project is due next month, so me and my groupmates is very busy. Yesterday, we meet in the library to discuss about our progress. The library very quiet, so is a good place to concentrate. We decide to split the work, everyone have their own part to do. I am in charge of the research part, which is quite difficult but I try my best. I hope we can finish on time and get a good grade.",
    "Yesterday I went to the career fair at my poly. There is many company there, like from engineering, IT and business. I talk to some of the recruiters, they are very friendly and give me good advice. I submitted my resume to a few companies that I am interested in. One of them is a tech company that make mobile apps. I think it will be very cool to work there. The fair was very useful I learn a lot."
];

export const GRAMMAR_TOPIC_CATEGORIES: GrammarCategory[] = [
    {
        id: 'core',
        categoryTitle: "Core Grammar",
        topics: [
            { title: 'Parts of speech', description: "Nouns, verbs, adjectives, etc.", icon: PartsOfSpeechIcon },
            { title: 'Subject-verb agreement', description: "Matching subjects with verbs.", icon: ArrowsRightLeftIcon },
            { title: 'Tenses', description: "Past, present, and future verb forms.", icon: TenseTitanIcon },
            { title: 'Punctuation', description: "Commas, periods, and more.", icon: PunctuationProIcon },
            { title: 'Articles', description: "Using 'a', 'an', and 'the' correctly.", icon: DocumentTextIcon },
        ],
        unlockThreshold: 0,
        xpMultiplier: 1,
    },
    {
        id: 'structure',
        categoryTitle: "Sentence Structure",
        topics: [
            { title: 'Dependent and independent clauses', description: "Building complex sentences.", icon: ClauseCommanderIcon },
            { title: 'Run-on sentences', description: "Fixing overly long sentences.", icon: StructureSentinelIcon },
            { title: 'Misplaced and dangling modifiers', description: "Placing descriptive phrases correctly.", icon: ModifiersIcon },
            { title: 'Parallel structures', description: "Keeping lists and series consistent.", icon: ParallelIcon },
        ],
        unlockThreshold: 3,
        xpMultiplier: 1.5,
    },
    {
        id: 'advanced',
        categoryTitle: "Advanced Topics",
        topics: [
            { title: 'Modals', description: "Can, could, should, must, etc.", icon: KeyIcon },
            { title: 'Modals of speculation', description: "Might, may, could be, etc.", icon: SpeculationIcon },
            { title: 'Literary devices', description: "Metaphors, similes, and more.", icon: LiteraryDevicesIcon },
        ],
        unlockThreshold: 3,
        xpMultiplier: 2,
    }
];

export const ALL_GRAMMAR_TOPICS = GRAMMAR_TOPIC_CATEGORIES.flatMap(cat => cat.topics.map(t => t.title));

// FIX: Update mastery badges to use new Badge type properties and hardcode the threshold in description.
const MASTERY_BADGES: Badge[] = [
  {
    id: 'sv-sovereign',
    title: 'S-V Sovereign',
    description: `Correctly answer 5 questions about subject-verb agreement.`,
    icon: ArrowsRightLeftIcon,
    topic: 'Subject-verb agreement',
    xp: 50,
    type: 'mastery',
    masteryThreshold: 5,
  },
  {
    id: 'tense-titan',
    title: 'Tense Titan',
    description: `Correctly answer 5 questions about verb tenses.`,
    icon: TenseTitanIcon,
    topic: 'Tenses',
    xp: 50,
    type: 'mastery',
    masteryThreshold: 5,
  },
  {
    id: 'punctuation-pro',
    title: 'Punctuation Pro',
    description: `Correctly answer 5 questions about punctuation.`,
    icon: PunctuationProIcon,
    topic: 'Punctuation',
    xp: 50,
    type: 'mastery',
    masteryThreshold: 5,
  },
  {
    id: 'clause-commander',
    title: 'Clause Commander',
    description: `Correctly answer 5 questions about clauses.`,
    icon: ClauseCommanderIcon,
    topic: 'Dependent and independent clauses',
    xp: 50,
    type: 'mastery',
    masteryThreshold: 5,
  },
  {
    id: 'structure-sentinel',
    title: 'Structure Sentinel',
    description: `Correctly answer 5 questions about run-on sentences.`,
    icon: StructureSentinelIcon,
    topic: 'Run-on sentences',
    xp: 50,
    type: 'mastery',
    masteryThreshold: 5,
  },
  {
    id: 'modal-master',
    title: 'Modal Master',
    description: `Correctly answer 5 questions about modals.`,
    icon: KeyIcon,
    topic: 'Modals',
    xp: 50,
    type: 'mastery',
    masteryThreshold: 5,
  },
];

// FIX: Add a new array for diagnostic-related badges.
const DIAGNOSTIC_BADGES: Badge[] = [
    {
        id: 'feedback-seeker-1',
        title: 'Feedback Seeker',
        description: 'Analyse your first piece of writing.',
        icon: PencilSquareIcon,
        xp: 20,
        type: 'diagnostic',
        analysisCount: 1,
    },
    {
        id: 'feedback-seeker-2',
        title: 'Insight Explorer',
        description: 'Analyse 5 pieces of writing.',
        icon: PencilSquareIcon,
        xp: 50,
        type: 'diagnostic',
        analysisCount: 5,
    },
    {
        id: 'feedback-seeker-3',
        title: 'Analysis Adept',
        description: 'Analyse 10 pieces of writing.',
        icon: PencilSquareIcon,
        xp: 100,
        type: 'diagnostic',
        analysisCount: 10,
    },
];


// FIX: Combine both mastery and diagnostic badges into one export for use throughout the app.
export const ALL_BADGES: Badge[] = [...MASTERY_BADGES, ...DIAGNOSTIC_BADGES];
