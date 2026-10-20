import { expect, test } from '@playwright/test';

test.afterEach(async ({ page }) => {
  // Keep real keys out of failure snapshots and test browser storage.
  await page.evaluate(() => localStorage.removeItem('grammarQuest.gemini.v1')).catch(() => {});
  const input = page.getByLabel('Gemini API key', { exact: true });
  if (await input.count()) await input.fill('').catch(() => {});
});

test('live Gemini connection and four coach features', async ({ page }) => {
  test.skip(!process.env.GEMINI_TEST_KEY, 'Set GEMINI_TEST_KEY to run paid live API requests.');
  test.setTimeout(240_000);
  const pace = async () => {
    const delay = Number(process.env.GEMINI_LIVE_DELAY_MS || 0);
    if (delay > 0) await new Promise(resolve => setTimeout(resolve, Math.min(delay, 30_000)));
  };
  const waitForResult = async (result: ReturnType<typeof page.getByText>) => {
    const error = page.locator('.notice-error');
    await result.or(error).first().waitFor({ state: 'visible', timeout: 70_000 });
    if (!(await result.isVisible())) throw new Error(await error.innerText());
  };
  page.on('response', response => {
    if (response.url().startsWith('https://generativelanguage.googleapis.com/v1beta/models/')) {
      console.log(`Google ${response.status()}: ${response.url().split('/models/')[1]}`);
    }
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await page.getByLabel('Gemini API key', { exact: true }).fill(process.env.GEMINI_TEST_KEY!);
  await page.getByRole('button', { name: 'Test & save key' }).click();
  await page.getByRole('heading', { name: 'Gemini AI connected' }).or(page.getByRole('alert')).waitFor({ timeout: 70_000 });
  if (await page.getByRole('alert').count()) throw new Error(await page.getByRole('alert').innerText());
  console.log('PASS: browser connected to live Gemini');
  await pace();
  await page.getByRole('textbox', { name: 'Your writing', exact: true }).fill('Yesterday my friends and I goes to the library. We was studying for our exam and everyone have a useful book.');
  await page.getByRole('button', { name: 'Analyse My Writing' }).click();
  await waitForResult(page.getByRole('heading', { name: 'Your Analysis Results' }));
  await expect(page.getByText('Learning Tip:', { exact: true }).first()).toBeVisible();
  console.log('PASS: live writing feedback');
  await pace();
  await page.getByRole('button', { name: 'AI Polish', exact: true }).click();
  await page.getByRole('button', { name: 'Generate AI Polish' }).click();
  await waitForResult(page.getByText('Polished Version:'));
  console.log('PASS: live AI Polish');
  await pace();
  await page.getByRole('button', { name: 'Practice Questions', exact: true }).click();
  await page.getByRole('button', { name: 'Generate Quiz', exact: true }).click();
  await waitForResult(page.getByText('Question 1 of 5', { exact: true }));
  console.log('PASS: live feedback quiz');
  await pace();
  await page.getByRole('button', { name: /Mini Quiz/ }).click();
  await page.getByRole('button', { name: 'Tenses', exact: true }).click();
  await waitForResult(page.getByText('Question 1 of 3', { exact: true }));
  console.log('PASS: live topic quiz');
  await page.getByRole('button', { name: 'Gemini settings' }).click();
  await page.getByRole('button', { name: 'Remove saved key' }).click();
});
