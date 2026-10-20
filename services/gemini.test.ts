import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_GEMINI_MODEL, GEMINI_STORAGE_KEY, getActiveGeminiConfig, loadGeminiConfig, removeGeminiConfig, requestGemini, saveGeminiConfig, testGeminiConnection } from './geminiConnection';
import { analyzeTextForFeedback, generateModelRewrite, generateQuiz, generateQuizFromFeedback } from './geminiService';

const config = { apiKey: 'test-key-not-a-real-secret', model: DEFAULT_GEMINI_MODEL };
const feedback = [{ errorType: 'Tenses', explanation: 'Use the past tense.', originalSentence: 'Yesterday I go to the MRT.', correctedSentence: 'Yesterday I went to the MRT.', learningTip: 'Use went for past actions.' }];
const question = { question: 'Yesterday I ___ to the MRT.', options: ['went', 'go', 'going', 'gone'], correctAnswer: 'went', topic: 'Tenses' };
const mockReply = (result: unknown, finishReason = 'STOP') => vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(result) }] } }] })));

beforeEach(() => {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) });
  removeGeminiConfig();
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('Gemini BYOK connection', () => {
  it('requires a verified connection for AI calls', async () => {
    await expect(generateQuiz('Tenses')).rejects.toThrow('Connect your Gemini');
  });
  it('handles missing, corrupt and invalid saved settings', () => {
    expect(loadGeminiConfig()).toBeNull();
    localStorage.setItem(GEMINI_STORAGE_KEY, '{');
    expect(loadGeminiConfig()).toBeNull();
    localStorage.setItem(GEMINI_STORAGE_KEY, JSON.stringify({ apiKey: config.apiKey, model: '../bad' }));
    expect(loadGeminiConfig()).toBeNull();
  });
  it('tests real generation using key headers and the same structured response mode', async () => {
    const fetch = mockReply({ connected: true });
    vi.stubGlobal('fetch', fetch);
    await testGeminiConnection(config);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain(`${DEFAULT_GEMINI_MODEL}:generateContent`);
    expect(url).not.toContain(config.apiKey);
    expect(options.headers['x-goog-api-key']).toBe(config.apiKey);
    expect(JSON.parse(options.body).generationConfig).toMatchObject({ responseMimeType: 'application/json', responseJsonSchema: { required: ['connected'] } });
    expect(loadGeminiConfig()).toBeNull();
    expect(() => getActiveGeminiConfig()).toThrow();
    expect(JSON.parse(options.body).generationConfig.maxOutputTokens).toBe(512);
  });
  it('saves and removes only Gemini settings while preserving learning progress', () => {
    localStorage.setItem('userXp', '50');
    saveGeminiConfig(config);
    expect(loadGeminiConfig()).toEqual(config);
    expect(getActiveGeminiConfig()).toEqual(config);
    removeGeminiConfig();
    expect(loadGeminiConfig()).toBeNull();
    expect(() => getActiveGeminiConfig()).toThrow();
    expect(localStorage.getItem('userXp')).toBe('50');
  });
  it('reports storage failure and preserves the previous active connection', () => {
    saveGeminiConfig(config);
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => saveGeminiConfig({ ...config, apiKey: 'replacement' })).toThrow('could not save');
    expect(getActiveGeminiConfig()).toEqual(config);
  });
  it('rejects unsuccessful connection probes', async () => {
    vi.stubGlobal('fetch', mockReply({ connected: false }));
    await expect(testGeminiConnection(config)).rejects.toThrow('did not pass');
  });
  it('verifies a working replacement when the old model is unavailable', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"connected":true}' }] }, finishReason: 'STOP' }] })));
    vi.stubGlobal('fetch', fetch);
    const verified = await testGeminiConnection({ ...config, model: 'gemini-3.8-flash' });
    expect(verified.model).toBe(DEFAULT_GEMINI_MODEL);
    expect(fetch.mock.calls[3][0]).toContain(DEFAULT_GEMINI_MODEL);
    expect(loadGeminiConfig()).toBeNull();
  });
  it('never switches models for authentication or quota failures', async () => {
    for (const status of [400, 401, 403, 429]) {
      const fetch = vi.fn().mockResolvedValue(new Response('{}', { status }));
      vi.stubGlobal('fetch', fetch);
      await expect(testGeminiConnection({ ...config, model: 'custom-model' })).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(1);
    }
  });
  it('recovers from a temporary Google server error without switching models', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"connected":true}' }] } }] })));
    vi.stubGlobal('fetch', fetch);
    expect((await testGeminiConnection(config)).model).toBe(DEFAULT_GEMINI_MODEL);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('distinguishes cancellation and does not try another model after cancelling', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))));
    const result = expect(testGeminiConnection({ ...config, model: 'custom-model' }, controller.signal)).rejects.toThrow('cancelled');
    controller.abort();
    await result;
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('tries a replacement after an old model times out', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn()
      .mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))))
      .mockResolvedValueOnce(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"connected":true}' }] } }] })));
    vi.stubGlobal('fetch', fetch);
    const result = testGeminiConnection({ ...config, model: 'old-model' });
    await vi.advanceTimersByTimeAsync(20_000);
    expect((await result).model).toBe(DEFAULT_GEMINI_MODEL);
  });
  it.each([[400, 'rejected'], [401, 'authenticate'], [403, 'authenticate'], [404, 'model is unavailable'], [429, 'quota'], [503, 'temporarily unavailable']])('reports HTTP %i without exposing response credentials', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(config.apiKey, { status: status as number })));
    await expect(testGeminiConnection(config)).rejects.toThrow(message as string);
  });
  it('reports network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(testGeminiConnection(config)).rejects.toThrow('internet connection');
  });
  it('times out without hanging the UI', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))));
    const result = expect(testGeminiConnection(config)).rejects.toThrow('timed out');
    await vi.advanceTimersByTimeAsync(60_000);
    await result;
  });
  it('rejects empty, blocked, truncated and malformed answers', async () => {
    for (const result of [{}, { promptFeedback: { blockReason: 'SAFETY' } }, { candidates: [{ finishReason: 'MAX_TOKENS' }] }, { candidates: [{ content: { parts: [{ text: 'invalid JSON' }] } }] }]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(result))));
      await expect(testGeminiConnection(config)).rejects.toThrow();
    }
  });
});

describe('all four AI coach features', () => {
  beforeEach(() => saveGeminiConfig(config));
  it('generates topic quizzes using the saved key and topic', async () => {
    const fetch = mockReply({ questions: [question, question, question] });
    vi.stubGlobal('fetch', fetch);
    expect(await generateQuiz('Tenses')).toHaveLength(3);
    expect(fetch.mock.calls[0][1].headers['x-goog-api-key']).toBe(config.apiKey);
    expect(fetch.mock.calls[0][1].body).toContain('Tenses');
  });
  it('analyses writing and allows valid error-free feedback', async () => {
    vi.stubGlobal('fetch', mockReply({ feedback }));
    expect(await analyzeTextForFeedback('Yesterday I go to the MRT.', ['Tenses'])).toEqual(feedback);
    vi.stubGlobal('fetch', mockReply({ feedback: [] }));
    expect(await analyzeTextForFeedback('I went home.', ['Tenses'])).toEqual([]);
  });
  it('generates a practice quiz from feedback', async () => {
    vi.stubGlobal('fetch', mockReply({ questions: Array(5).fill(question) }));
    expect(await generateQuizFromFeedback(feedback)).toHaveLength(5);
  });
  it('generates AI Polish', async () => {
    const rewrite = { rewrittenText: 'Yesterday I went to the MRT.', summaryOfChanges: ['Changed go to went for past tense.'] };
    vi.stubGlobal('fetch', mockReply(rewrite));
    expect(await generateModelRewrite('Yesterday I go to the MRT.', feedback)).toEqual(rewrite);
  });
  it('rejects structurally invalid feature outputs before they reach the UI', async () => {
    vi.stubGlobal('fetch', mockReply({ questions: [{ ...question, correctAnswer: 'not an option' }] }));
    await expect(generateQuiz('Tenses')).rejects.toThrow('incomplete quiz');
    vi.stubGlobal('fetch', mockReply({ feedback: [{}] }));
    await expect(analyzeTextForFeedback('Some text', [])).rejects.toThrow('incomplete feedback');
    vi.stubGlobal('fetch', mockReply({ rewrittenText: '', summaryOfChanges: [] }));
    await expect(generateModelRewrite('Some text', [])).rejects.toThrow('incomplete rewrite');
  });
});
