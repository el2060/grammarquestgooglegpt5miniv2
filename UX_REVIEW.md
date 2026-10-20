# Grammar Quest Coach: UX review and refinements

Reviewed and implemented on 20 October 2026. The goal was to make it easier for a student to connect Gemini, write a paragraph, understand a correction and practise the rule.

## Findings and changes

The starting setup screenshot showed a broken external logo and a large profile block taking most of the first screen. The key form and its action were pushed down. The new header uses a local application icon and a compact progress strip. A two-column setup explains the learning flow beside the key form; mobile uses a single column.

![Starting setup screen, captured during this review](C:/Users/limee/OneDrive/Desktop/ELE Oct26/grammarquestgooglegpt5miniv2/output/playwright/review/01-before-setup.png)

![Refined setup screen](C:/Users/limee/OneDrive/Desktop/ELE Oct26/grammarquestgooglegpt5miniv2/output/playwright/review/02-after-setup.png)

Code review also found that the previous category unlock message used a count that had already been overwritten with the current category's count. Badge XP was updated inside another state update, and boosted quizzes displayed base XP. These issues now have focused regression coverage. A pure learning reducer applies XP, mastery, analysis counts and badge bonuses together.

## Verified flow

1. **Connect Gemini — improved.** The key stays masked, verification is required before saving, saved keys are retested, a failed replacement preserves the old connection, and users can cancel a slow test. The setup explains local storage and data sent to Google.
2. **Write and choose focus — improved.** The writing area and focus controls sit side by side on desktop. Mobile collapses focus controls behind Change focus. The editor has a visible label, word count, minimum-word guidance and a sample action. Analysis is disabled if no topics are selected. Feedback, Practice and AI Polish labels remain visible on phones; polished text can be copied.
3. **Check and practise — improved.** A student selects an answer, checks it, reads the rule explanation and continues. Checked answers cannot be changed. The summary includes answer review and the correct XP multiplier. Category unlocks count mastery in the previous category, including topics without dedicated badges.
4. **Track progress — improved.** The header shows level progress, XP and badges. Badge reward calculations avoid state-updater side effects. Corrupted storage falls back safely; storage failures leave the current session usable. Reset opens a confirmation dialog and preserves Gemini settings.
5. **Learn with scenes — improved.** The scene library works without an AI key. Native modal dialogs contain focus, support Escape, lock background scrolling, and give close controls accessible names. Stories retain previous/next, explanation and replay controls.

![Refined writing workspace on desktop](C:/Users/limee/OneDrive/Desktop/ELE Oct26/grammarquestgooglegpt5miniv2/output/playwright/review/03-writing-desktop.png)

![Refined writing workspace on a 390-pixel phone](C:/Users/limee/OneDrive/Desktop/ELE Oct26/grammarquestgooglegpt5miniv2/output/playwright/review/03-writing-mobile.png)

![Topic quiz with an answer-check action](C:/Users/limee/OneDrive/Desktop/ELE Oct26/grammarquestgooglegpt5miniv2/output/playwright/review/04-topic-quiz.png)

![Badge collection and progress](C:/Users/limee/OneDrive/Desktop/ELE Oct26/grammarquestgooglegpt5miniv2/output/playwright/review/05-badges.png)

![Scene library before connecting Gemini](C:/Users/limee/OneDrive/Desktop/ELE Oct26/grammarquestgooglegpt5miniv2/output/playwright/review/06-scenes.png)

## Design and accessibility checks

The application uses a consistent blue accent, quieter borders and shadows, clearer action hierarchy and locally compiled CSS. Runtime styling no longer depends on the Tailwind CDN. External fonts are optional and have system fallbacks. The broken external logo dependency was removed.

Keyboard-visible focus, a skip link, selected-state semantics, labelled fields, readable mobile result tabs, native modal focus behavior, and reduced-motion styling were checked in implementation. Browser tests cover modal Escape, focus selection, mobile reflow and error recovery. This is not a full WCAG or screen-reader certification; detailed contrast measurements and assistive-technology testing remain outside this review.

## Verification and limits

- 25 service and learning-progress tests passed.
- 8 browser tests passed, including all four AI UI flows, persistence/removal, failed key replacement, offline scenes, reset, focus validation and boosted XP.
- TypeScript checking and production build passed.
- AI browser tests use controlled Gemini responses. They prove the app flows and response handling, not Google's live answer quality or availability. The preceding live attempt returned HTTP 503; no new live-generation claim is made here.
- Screenshots were captured during this review and inspected locally. Connected screens use test responses and a fake key in an isolated test browser. No supplied real API key is embedded in source or screenshots.
