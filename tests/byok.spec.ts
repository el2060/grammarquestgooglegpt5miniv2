import { expect, test, type Page } from '@playwright/test';

const storageKey = 'grammarQuest.gemini.v1';
const fakeKey = 'browser-test-key-not-a-real-secret';
const question = { question: 'Yesterday I ___ to the MRT.', options: ['went', 'go', 'going', 'gone'], correctAnswer: 'went', topic: 'Tenses', explanation: 'Yesterday describes a past action, so use went.' };
const feedback = [{ errorType: 'Tenses', explanation: 'Use the past tense.', originalSentence: 'Yesterday I go to the MRT.', correctedSentence: 'Yesterday I went to the MRT.', learningTip: 'Use went for past actions.' }];

test.beforeEach(async ({ page }) => {
  // Font CDN latency must not decide whether an AI workflow test passes.
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
});

async function mockGemini(page: Page, requests: string[]) {
  await page.route('https://generativelanguage.googleapis.com/**', async route => {
    const request = route.request();
    expect(request.headers()['x-goog-api-key']).toBe(fakeKey);
    const payload = request.postDataJSON();
    const prompt = payload.contents[0].parts[0].text;
    requests.push(prompt);
    let result: unknown = { connected: true };
    if (prompt.includes('Analyze the following')) result = { feedback };
    else if (prompt.includes('Rewrite the following')) result = { rewrittenText: 'Yesterday I went to the MRT.', summaryOfChanges: ['Use the past tense.'] };
    else if (prompt.includes('5-question')) result = { questions: Array(5).fill(question) };
    else if (prompt.includes('3-question')) result = { questions: Array(3).fill(question) };
    await route.fulfill({ json: { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(result) }] } }] } });
  });
}

test('clean homepage loads its avatar and opens setup only when requested', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Meet your Grammar Coach.' })).toBeVisible();
  await expect(page.getByLabel('Gemini API key', { exact: true })).toHaveCount(0);
  const avatar = page.getByRole('img', { name: 'A friendly blue book character winking hello' });
  await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Get started', exact: true })).toBeInViewport();
    const header = await page.locator('.app-header').boundingBox();
    expect(header!.x + header!.width).toBeLessThanOrEqual(width);
    if (width === 1440 || width === 390) await page.screenshot({ path: `output/playwright/homepage-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Connect your AI coach' })).toBeVisible();
  await expect(page.getByLabel('Gemini API key', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'output/playwright/homepage-setup-mobile.png' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Get started', exact: true })).toBeFocused();
});

test('onboards, saves, retests after reload, and removes a key without losing progress', async ({ page }) => {
  const requests: string[] = [];
  await mockGemini(page, requests);
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bring your own Gemini API key' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analyse My Writing' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Test & save key' })).toBeDisabled();
  await page.getByLabel('Gemini API key', { exact: true }).fill(` ${fakeKey} `);
  await expect(page.getByLabel('Gemini API key', { exact: true })).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Show API key' }).click();
  await expect(page.getByLabel('Gemini API key', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await expect(page.getByRole('heading', { name: 'Gemini AI connected' })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).apiKey, storageKey)).toBe(fakeKey);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Gemini AI connected' })).toBeVisible();
  expect(requests.filter(prompt => prompt.includes('Connection test')).length).toBeGreaterThanOrEqual(2);
  await page.evaluate(() => localStorage.setItem('userXp', '50'));
  await page.getByRole('button', { name: 'Gemini settings' }).click();
  await page.getByRole('button', { name: 'Remove saved key' }).click();
  await expect(page.getByRole('heading', { name: 'Meet your Grammar Coach.' })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('userXp'))).toBe('50');
});

test('failed keys and replacements do not unlock or overwrite a verified connection', async ({ page }) => {
  await page.route('https://generativelanguage.googleapis.com/**', route => route.fulfill({ status: 403, json: { error: { message: 'No access' } } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.getByLabel('Gemini API key', { exact: true }).fill(fakeKey);
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await expect(page.getByRole('alert')).toContainText('authenticate');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  await page.unroute('https://generativelanguage.googleapis.com/**');
  await mockGemini(page, []);
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await expect(page.getByRole('heading', { name: 'Gemini AI connected' })).toBeVisible();
  await page.getByRole('button', { name: 'Gemini settings' }).click();
  await page.getByLabel('Gemini API key', { exact: true }).fill('invalid-replacement');
  await page.unroute('https://generativelanguage.googleapis.com/**');
  await page.route('https://generativelanguage.googleapis.com/**', route => route.fulfill({ status: 429, json: {} }));
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await expect(page.getByRole('alert')).toContainText('quota');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).apiKey, storageKey)).toBe(fakeKey);
  await expect(page.getByRole('button', { name: 'Analyse My Writing' })).toBeVisible();
});

test('an unavailable old model falls back to a verified working model before saving', async ({ page }) => {
  await mockGemini(page, []);
  await page.route('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', route => route.fulfill({ status: 503, json: {} }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.getByLabel('Gemini API key', { exact: true }).fill(fakeKey);
  await page.getByText('Advanced: Gemini model', { exact: true }).click();
  await page.getByLabel('Model ID', { exact: true }).fill('gemini-3.8-flash');
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await expect(page.getByRole('heading', { name: 'Gemini AI connected' })).toBeVisible({ timeout: 10_000 });
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).model, storageKey)).toBe('gemini-3.6-flash');
  await expect(page.getByText('Your key powers all AI features · gemini-3.6-flash')).toBeVisible();
});

test('all AI learning flows render results and quizzes award XP', async ({ page }) => {
  const requests: string[] = [];
  await mockGemini(page, requests);
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.getByLabel('Gemini API key', { exact: true }).fill(fakeKey);
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await page.getByRole('textbox', { name: 'Your writing', exact: true }).fill('Yesterday I go to the MRT with my friends after class.');
  await page.getByRole('button', { name: 'Analyse My Writing' }).click();
  await expect(page.getByText('Use went for past actions.')).toBeVisible();
  await page.getByRole('button', { name: 'AI Polish', exact: true }).click();
  await page.getByRole('button', { name: 'Generate AI Polish' }).click();
  await expect(page.getByText('Polished Version:')).toBeVisible();
  await page.getByRole('button', { name: 'Practice Questions', exact: true }).click();
  await page.getByRole('button', { name: 'Generate Quiz', exact: true }).click();
  for (let index = 0; index < 5; index++) {
    await page.getByRole('button', { name: 'went', exact: true }).click();
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await page.getByRole('button', { name: index === 4 ? 'Finish' : 'Next', exact: true }).click();
  }
  await expect(page.getByText('Quiz Complete!', { exact: true })).toBeVisible();
  expect(Number(await page.evaluate(() => localStorage.getItem('userXp')))).toBeGreaterThan(0);
  await page.getByRole('button', { name: /Mini Quiz/ }).click();
  await page.getByRole('button', { name: 'Tenses', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mini Quiz: Tenses' })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'output/playwright/review/04-topic-quiz.png', fullPage: true });
  await page.getByRole('button', { name: 'Badges', exact: true }).click();
  await page.screenshot({ path: 'output/playwright/review/05-badges.png', fullPage: true });
  expect(requests.some(prompt => prompt.includes('3-question'))).toBe(true);
  expect(requests.some(prompt => prompt.includes('5-question'))).toBe(true);
  expect(requests.some(prompt => prompt.includes('Analyze the following'))).toBe(true);
  expect(requests.some(prompt => prompt.includes('Rewrite the following'))).toBe(true);
});

test('mobile setup fits the screen and analysis failures stay retryable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockGemini(page, []);
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.getByLabel('Gemini API key', { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'output/playwright/gemini-setup-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel('Gemini API key', { exact: true }).fill(fakeKey);
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await expect(page.getByRole('heading', { name: 'Gemini AI connected' })).toBeVisible();
  await page.screenshot({ path: 'output/playwright/review/03-writing-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'output/playwright/review/03-writing-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.unroute('https://generativelanguage.googleapis.com/**');
  await page.route('https://generativelanguage.googleapis.com/**', route => route.fulfill({ status: 429, json: {} }));
  await page.getByRole('textbox', { name: 'Your writing', exact: true }).fill('Yesterday I go to the MRT with my friends after class.');
  await page.getByRole('button', { name: 'Analyse My Writing' }).click();
  await expect(page.getByRole('alert')).toContainText('quota');
  await expect(page.getByRole('button', { name: 'Analyse My Writing' })).toBeEnabled();
  await expect(page.getByText('Great job!', { exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Gemini settings' }).click();
  await page.screenshot({ path: 'output/playwright/gemini-settings-desktop.png', fullPage: true });
});

test('scenes work before key setup and dialogs support Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore scenes', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Learn with Scenes', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start scene >', exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'Grammar scene' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Next', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Meet your Grammar Coach.' })).toBeVisible();
});

test('reset asks first, preserves the key and resets learning without reloading', async ({ page }) => {
  await mockGemini(page, []);
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.evaluate(() => localStorage.setItem('userXp', '120'));
  await page.reload();
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.getByLabel('Gemini API key', { exact: true }).fill(fakeKey);
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await expect(page.getByRole('heading', { name: 'Gemini AI connected' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my progress' }).click();
  expect(await page.evaluate(() => localStorage.getItem('userXp'))).toBe('120');
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset progress', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('userXp'))).toBe('0');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).apiKey, storageKey)).toBe(fakeKey);
  await expect(page.getByRole('heading', { name: 'Gemini AI connected' })).toBeVisible();
});

test('focus selection prevents analysis without selected topics', async ({ page }) => {
  await mockGemini(page, []);
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.getByLabel('Gemini API key', { exact: true }).fill(fakeKey);
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await page.getByRole('button', { name: 'Use a sample text' }).click();
  await page.getByText('Choose individual topics', { exact: true }).click();
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Analyse My Writing' })).toBeDisabled();
  await page.getByRole('button', { name: 'Core Essentials', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Core Essentials', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Analyse My Writing' })).toBeEnabled();
});

test('mastered topics unlock the next category and boosted quiz XP is displayed correctly', async ({ page }) => {
  await mockGemini(page, []);
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.evaluate(() => localStorage.setItem('masteryProgress', JSON.stringify({ 'Parts of speech': 5, Tenses: 5, Articles: 5 })));
  await page.reload();
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.getByLabel('Gemini API key', { exact: true }).fill(fakeKey);
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await page.getByRole('button', { name: 'Mini Quiz', exact: true }).click();
  await page.getByRole('button', { name: 'Run-on sentences', exact: true }).click();
  for (let index = 0; index < 3; index++) {
    await page.getByRole('button', { name: 'went', exact: true }).click();
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await expect(page.getByText('Yesterday describes a past action, so use went.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'went', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: index === 2 ? 'Finish' : 'Next', exact: true }).click();
  }
  await expect(page.getByText(/\+\s*45 XP Earned/)).toBeVisible();
  await expect(page.getByText('Quiz Complete!', { exact: true })).toBeVisible();
});

