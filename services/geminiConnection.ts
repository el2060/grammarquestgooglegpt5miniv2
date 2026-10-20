export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export const GEMINI_STORAGE_KEY = 'grammarQuest.gemini.v1';
export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';
let activeConfig: GeminiConfig | null = null;

export function loadGeminiConfig(): GeminiConfig | null {
  try {
    const saved = JSON.parse(localStorage.getItem(GEMINI_STORAGE_KEY) || 'null');
    return saved && typeof saved.apiKey === 'string' && saved.apiKey.trim() &&
      typeof saved.model === 'string' && /^[a-zA-Z0-9._-]+$/.test(saved.model) ? saved : null;
  } catch {
    return null;
  }
}

// Called only after a successful generation test. Failed replacements leave the old key intact.
export function saveGeminiConfig(config: GeminiConfig): void {
  try {
    localStorage.setItem(GEMINI_STORAGE_KEY, JSON.stringify(config));
  } catch {
    throw new Error('Your browser could not save the key. Allow site storage and try again.');
  }
  activeConfig = { ...config };
}

export function removeGeminiConfig(): void {
  try {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  } catch {
    throw new Error('Your browser could not remove the saved key. Clear this site’s data in browser settings.');
  }
  activeConfig = null;
}

export function getActiveGeminiConfig(): GeminiConfig {
  if (!activeConfig) throw new Error('Connect your Gemini API key before using the AI coach.');
  return { ...activeConfig };
}

interface GeminiResponse {
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string; thought?: boolean }[] };
  }[];
  promptFeedback?: { blockReason?: string };
}

class GeminiAvailabilityError extends Error {}

function waitForRetry(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, ms);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}

export async function requestGemini<T>(
  config: GeminiConfig, systemPrompt: string, prompt: string, schema: object,
  signal?: AbortSignal,
  options: { timeoutMs?: number; maxOutputTokens?: number } = {},
): Promise<T> {
  if (!config.apiKey.trim()) throw new Error('Enter your Gemini API key.');
  if (!/^[a-zA-Z0-9._-]+$/.test(config.model)) throw new Error('Enter a valid Gemini model ID.');
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timeoutMs = options.timeoutMs ?? 60_000;
  const timeout = setTimeout(cancel, timeoutMs);
  try {
    let response: Response;
    for (let attempt = 0; ; attempt++) {
      response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey.trim() },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json', responseJsonSchema: schema,
            maxOutputTokens: options.maxOutputTokens ?? 4096,
            ...(/^gemini-3\.(5|6)-flash(?:$|-)/.test(config.model) ? { thinkingConfig: { thinkingLevel: 'minimal' } } : {}),
          },
        }),
        signal: controller.signal,
      },
      );
      if (![500, 502, 503, 504].includes(response.status) || attempt === 2) break;
      // Only retry temporary server failures, with a small bounded backoff.
      await waitForRetry(600 * (attempt + 1), controller.signal);
    }
    if (!response.ok) {
      // Do not echo Google's response: it can contain credentials or submitted writing.
      switch (response.status) {
        case 400: throw new Error('Gemini rejected the request. Check your API key and model in Gemini settings.');
        case 401: case 403: throw new Error('Gemini could not authenticate your key. Check that it is valid and allowed to use the Gemini API on this website.');
        case 404: throw new GeminiAvailabilityError('This Gemini model is unavailable. Choose an available model in Gemini settings and test again.');
        case 429: throw new Error('Gemini quota or rate limit reached. Check your AI Studio quota or billing, or wait and try again.');
        default:
          if (response.status >= 500) throw new GeminiAvailabilityError(`Gemini is temporarily unavailable (HTTP ${response.status}). Please try again shortly.`);
          throw new Error(`Gemini request failed (${response.status}). Please try again.`);
      }
    }
    const data: GeminiResponse = await response.json();
    const candidate = data.candidates?.[0];
    if (data.promptFeedback?.blockReason || (candidate?.finishReason && candidate.finishReason !== 'STOP')) {
      throw new Error(candidate?.finishReason === 'MAX_TOKENS'
        ? 'Gemini’s answer was cut short. Try a shorter text or try again.'
        : 'Gemini could not complete this request. Try different text.');
    }
    const content = candidate?.content?.parts?.filter(part => !part.thought).map(part => part.text || '').join('');
    if (!content) throw new Error('Gemini returned an empty answer. Please try again.');
    try {
      const result = JSON.parse(content);
      if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error();
      return result as T;
    } catch {
      throw new Error('Gemini returned an invalid answer format. Please try again.');
    }
  } catch (error) {
    if (signal?.aborted) throw new Error('The Gemini request was cancelled.');
    if (controller.signal.aborted) throw new GeminiAvailabilityError(`Gemini timed out after ${Math.round(timeoutMs / 1000)} seconds. Please retry or select another model.`);
    if (error instanceof TypeError) throw new Error('Could not reach Gemini. Check your internet connection and API key website restrictions.');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

export async function testGeminiConnection(config: GeminiConfig, signal?: AbortSignal): Promise<GeminiConfig> {
  const verify = async (candidate: GeminiConfig) => {
    const result = await requestGemini<{ connected: boolean }>(candidate,
      'You are Grammar Quest Coach. Follow the requested JSON schema.',
      'Connection test: return {"connected":true}.',
      { type: 'object', properties: { connected: { type: 'boolean' } }, required: ['connected'], additionalProperties: false },
      signal, { timeoutMs: 20_000, maxOutputTokens: 512 });
    if (result.connected !== true) throw new Error('Gemini did not pass the connection test. Please try again.');
    return candidate;
  };
  try {
    return await verify(config);
  } catch (error) {
    // Old saved defaults and custom models may be retired, overloaded or unresponsive.
    // Verify a working replacement before saving it; never retry invalid keys or quota failures.
    if (signal?.aborted || !(error instanceof GeminiAvailabilityError) || config.model === DEFAULT_GEMINI_MODEL) throw error;
    return verify({ ...config, model: DEFAULT_GEMINI_MODEL });
  }
}
