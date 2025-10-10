# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grammar Quest Coach** is a gamified grammar learning application for polytechnic students in Singapore. It uses Azure OpenAI GPT-5 mini to generate contextual quiz questions, analyze student writing, and provide personalized feedback with Singaporean contexts.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Create `.env.local` with Azure OpenAI credentials:
```env
AZURE_OPENAI_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

Environment variables are injected via Vite's `define` config in `vite.config.ts`.

## Architecture Overview

### Core State Management

**App.tsx** is the single source of truth for application state:
- `xp` - Total experience points earned
- `unlockedBadges` - Set of earned badge IDs
- `masteryProgress` - Record tracking correct answers per grammar topic
- `diagnosticAnalysesCount` - Count of completed text analyses
- `selectedTopics` - Set of grammar topics to focus on

All state is persisted to `localStorage` and restored on mount.

### Badge System

Two badge types defined in `constants.ts`:
1. **Mastery badges** - Unlock after answering N questions correctly on a specific topic
2. **Diagnostic badges** - Unlock after analyzing N pieces of writing

Badge unlocking logic in `App.tsx` uses `useEffect` to monitor `masteryProgress` and `diagnosticAnalysesCount`, calling `handleUnlockBadge()` which triggers XP gain and notification display.

### AI Service Layer

`services/azureOpenAIService.ts` provides four AI-powered functions:
1. `generateQuiz(topic)` - Creates 3-question quiz for a grammar topic
2. `analyzeTextForFeedback(text, topics)` - Identifies up to 4 grammar errors
3. `generateQuizFromFeedback(feedback)` - Creates 5-question quiz from identified errors
4. `generateModelRewrite(text, feedback)` - Rewrites text with corrections

**GPT-5 mini constraints:**
- Use `max_completion_tokens` (not `max_tokens`)
- Temperature must default to 1
- Top-p not supported
- All responses use strict JSON schemas with `response_format: { type: "json_schema" }`

### View Architecture

Three main views controlled by `view` state in App.tsx:
- **Diagnostics** - Text analysis with feedback, practice questions, and AI polish
- **Mini Quiz** - Topic-based quiz generation with locked categories
- **Badges** - Achievement display with progress tracking

### Grammar Topic Categories

Defined in `constants.ts` as `GRAMMAR_TOPIC_CATEGORIES`:
- **Core Grammar** (unlockThreshold: 0, xpMultiplier: 1)
- **Sentence Structure** (unlockThreshold: 3, xpMultiplier: 1.5)
- **Advanced Topics** (unlockThreshold: 3, xpMultiplier: 2)

Categories unlock progressively based on number of mastered topics in previous category.

### Component Communication Pattern

**Props-down pattern:**
- Parent (App.tsx) passes callbacks to children
- `onQuizComplete(score, questionsAnswered, correctAnswersByTopic, xpMultiplier)` - Updates XP and mastery progress
- `onAnalysisComplete()` - Increments diagnostic analysis counter

**Key component flows:**
- `TopicSelector` → calls `generateQuiz()` → renders `Quiz` → calls `onQuizComplete`
- `Diagnostics` → calls `analyzeTextForFeedback()` → renders feedback tabs → can generate quiz or rewrite

### Level System

10 levels defined in `constants.ts` with progressive XP thresholds:
- Level 1 (Beginner): 0 XP
- Level 10 (Master): 4000 XP
- Each correct answer: +10 XP (modified by category xpMultiplier)

Level calculation in `getCurrentLevelInfo()` determines current level, progress to next level, and progress bar percentage.

## Key Files

- `App.tsx` - Root component with all state management
- `types.ts` - TypeScript interfaces for Quiz, Feedback, Badges, Scenes
- `constants.ts` - Grammar topics, badges, levels, sample texts
- `services/azureOpenAIService.ts` - AI integration layer
- `components/Quiz.tsx` - Reusable quiz component with answer review
- `components/Diagnostics.tsx` - Text analysis with 3-tab interface
- `components/TopicSelector.tsx` - Categorized topic selection with unlock logic
- `components/GrammarFocus.tsx` - Topic filter for diagnostics
- `components/Badges.tsx` - Badge display and progress tracking

## Important Implementation Details

### Quiz Component Reusability
`Quiz.tsx` accepts optional callbacks:
- `onPracticeAgain` - Generates new questions (used in Diagnostics)
- `onReset` - Returns to parent view (used in Diagnostics)
- If neither provided, shows "Retake Quiz" to reset current questions

### JSON Schema Pattern
All AI service functions wrap schemas in an object with a single top-level property:
```typescript
{
  type: "object",
  properties: {
    questions: { type: "array", items: { ... } }
  },
  required: ["questions"],
  additionalProperties: false
}
```
This ensures strict validation and consistent parsing.

### Scene-Based Learning
`components/scenes/` contains an interactive learning feature with dialogue panels and explanations. Scene data lives in `scenesData.ts`. Scenes are modal overlays triggered from Diagnostics view.

### Local Storage Keys
- `userXp` - Total XP
- `unlockedBadges` - JSON array of badge IDs
- `masteryProgress` - JSON object of topic → correct answer count
- `diagnosticAnalysesCount` - Number of completed analyses

Reset all progress via "Reset All" button which clears localStorage and reloads page.

## Visual Design System

Recent UI refresh applied consistent patterns:
- Gradients: `from-blue-600 to-indigo-600` for primary actions
- Backgrounds: `from-white to-blue-50/30` for cards
- Borders: `rounded-3xl` for main containers, `rounded-xl` for buttons
- Shadows: `shadow-xl` for containers, `shadow-lg` for cards
- Hover: `scale-105` with shadow enhancement
- All styling via Tailwind CSS utility classes

## Azure OpenAI Integration Notes

The app uses client-side Azure OpenAI calls with `dangerouslyAllowBrowser: true`. This is acceptable for an educational tool but production deployments should proxy through a backend to secure credentials.

All prompts include context that the audience is polytechnic students in Singapore, with instructions to use relatable local contexts (e.g., MRT, kopi, hawker centers).

## Adding New Features

**To add a new grammar topic:**
1. Add icon component to `components/icons/`
2. Add topic to appropriate category in `constants.ts` GRAMMAR_TOPIC_CATEGORIES
3. Add mastery badge to MASTERY_BADGES array with topic name matching exactly
4. Badge will auto-unlock when masteryProgress reaches threshold

**To add a new badge type:**
1. Extend Badge interface in `types.ts` with new type
2. Add badge IDs to BadgeId union type
3. Create badge array in `constants.ts`
4. Add unlocking logic in App.tsx useEffect that monitors relevant state
5. Update Badges component to display new badge type

**To modify AI behavior:**
1. Edit system/user prompts in `azureOpenAIService.ts`
2. Adjust JSON schemas if response structure changes
3. Update TypeScript interfaces in `types.ts` to match
4. Remember GPT-5 mini constraints on parameters
