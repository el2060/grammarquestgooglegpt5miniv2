# Grammar Quest Coach — Gemini BYOK

An AI grammar coach with writing feedback, topic quizzes, practice quizzes based on feedback, and AI Polish. All four AI features use the learner's own Gemini API key.

## Run locally

1. Install Node.js (22.12+ recommended) and run `npm install`.
2. Run `npm run dev` and open http://localhost:3000.
3. Create a key in [Google AI Studio](https://aistudio.google.com/apikey) ([getting started](https://aistudio.google.com/docs/get-started)).
4. Choose **Get started** on the homepage, paste the key into **Bring your own Gemini API key**, then choose **Test & save key**.
5. A real structured generation request must succeed before the key is saved and the learning features open. Setup tests use a 20-second limit and a small response budget. Unavailable models are retried with bounded backoff, then the default model is verified as a fallback; the actual selected model is saved and shown in the connection status. Saved keys are retested on reload.

No `.env.local`, Azure deployment, or shared API key is required. The default model is `gemini-3.6-flash`; a different text model supporting structured JSON output can be entered under Advanced and tested. See [Gemini model documentation](https://ai.google.dev/gemini-api/docs/models).

## Key storage and privacy

The key and model are stored only in this browser's localStorage under `grammarQuest.gemini.v1`. Requests go directly to `generativelanguage.googleapis.com` with the key in the `x-goog-api-key` header (never the URL), along with the submitted writing. Browser storage is not encrypted; anyone with access to the browser or scripts on the same origin can access it. Use **Gemini settings → Remove saved key** on shared devices. Changing a key/model requires another successful test; a failed replacement preserves the previous connection. **Reset All** resets learning progress, independently of the Gemini key.

Google quota, billing, API enablement and browser website restrictions apply to the user's project. The app reports authentication, quota, model, network, timeout and malformed response failures without logging credentials or submitted writing.

Previously committed Azure credentials were removed from the current documentation. Revoke/rotate those credentials in Azure, because removing them from current files does not remove Git history.

## Verification

- `npm run typecheck`
- `npm test` — deterministic service tests with mocked Google responses, including all four AI operations and failure paths.
- `npm run test:e2e` — browser tests (uses Microsoft Edge on Windows; install Playwright Chromium on other platforms).
- `npm run build`

A genuine Google connection cannot be certified without a valid user-supplied key and available quota. The in-app connection test performs that check using the same endpoint, model, authentication and JSON response mode as the coach.

To repeat live browser tests, set `GEMINI_TEST_KEY` only in your current process environment and run `npm run test:e2e -- tests/live.spec.ts`. The test is skipped when no key is provided. It checks the connection and all four AI flows, then removes the key from its isolated browser. Never commit keys or store them in fixtures.

Verification during this migration: 20 service tests and 4 browser tests passed; TypeScript checking and production build passed. Live requests with the supplied replacement key returned HTTP 503 from Google before connection verification, so live content generation could not be certified.

## Learning experience refinements

The app now includes a compact progress header, a desktop focus sidebar and collapsible mobile focus controls, visible result tabs, answer checks with grammar explanations, and AI Polish copying. Interactive scenes are available before connecting Gemini. Resetting progress requires confirmation and keeps the Gemini key. XP and badge rewards are calculated together in a pure reducer; damaged browser progress is recovered safely. Styles are compiled locally with Tailwind/PostCSS.

The UI refinement was verified with 25 service/progress tests, 8 browser tests, TypeScript checking and a production build. Browser AI responses are mocked. Live Google generation remains subject to the connection status described above. See [UX_REVIEW.md](UX_REVIEW.md) for the review and screen evidence.

## Homepage

The first screen uses a small original avatar, centred introduction and simple feature summaries. **Get started** and **Connect my coach** open Gemini setup in a dismissible dialog; the key form is not shown on the homepage. **Explore scenes** works without a key. Saved keys are still verified automatically on return. The homepage was checked at 390, 768, 1024 and 1440 pixels, including avatar loading, horizontal overflow, dialog Escape and focus restoration. All 9 browser regression tests passed.

## Gemini connection reliability

The default is the explicit `gemini-3.6-flash` model. For supported 3.5/3.6 Flash models, requests use minimal thinking for these short grammar tasks. Normal output is capped at 4096 tokens; the connection probe is capped at 512. Temporary HTTP 500/502/503/504 responses receive up to two retries within the overall deadline. Invalid-key and quota errors are not retried or bypassed. User cancellation and server timeout are reported separately. A failed selected-model probe falls back only on availability errors, verifies the default with a real generation, and returns the verified model to setup before saving.

For low-rate live verification, `GEMINI_LIVE_DELAY_MS=15000` spaces the feature checks. Credentials remain process-only and are removed from isolated browser storage after the test. Google quota and service capacity still apply.

Live verification of the connection fix: a supplied key successfully connected in both the isolated browser test and the user's open app, using `gemini-3.6-flash`. Live writing feedback also succeeded. The full live feature sequence did not pass: subsequent AI Polish requests encountered Google HTTP 503/high demand and HTTP 429/quota responses. Do not confuse these provider errors with an invalid key or claim all live features passed. The key itself is not included in project files.
