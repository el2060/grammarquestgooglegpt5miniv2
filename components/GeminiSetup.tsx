import React, { useEffect, useRef, useState } from 'react';
import { Modal } from './Modal';
import { DEFAULT_GEMINI_MODEL, loadGeminiConfig, removeGeminiConfig, saveGeminiConfig, testGeminiConnection } from '../services/geminiConnection';

interface Props {
  connected: boolean;
  onConnected: () => void;
  onDisconnected: () => void;
  open: boolean;
  onClose: () => void;
}

export function GeminiSetup({ connected, onConnected, onDisconnected, open, onClose }: Props) {
  const [saved, setSaved] = useState(loadGeminiConfig);
  const [apiKey, setApiKey] = useState(saved?.apiKey || '');
  const [model, setModel] = useState(saved?.model || DEFAULT_GEMINI_MODEL);
  const [editing, setEditing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [testing, setTesting] = useState(Boolean(saved));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const pending = useRef<AbortController | null>(null);

  // Re-test saved credentials on every page load; never trust a persisted success flag.
  useEffect(() => {
    const config = loadGeminiConfig();
    if (!config) return;
    const controller = new AbortController();
    pending.current = controller;
    setTesting(true);
    testGeminiConnection(config, controller.signal).then(verified => {
      if (controller.signal.aborted) return;
      saveGeminiConfig(verified);
      setSaved(verified);
      setModel(verified.model);
      setNotice('Connection verified. Your AI coach is ready.');
      onConnected();
    }).catch(err => {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Connection test failed.');
    }).finally(() => {
      if (!controller.signal.aborted) setTesting(false);
    });
    return () => controller.abort();
  }, [onConnected]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (testing) return;
    setError('');
    setNotice('');
    setTesting(true);
    const config = { apiKey: apiKey.trim(), model: model.trim() };
    const controller = new AbortController();
    pending.current = controller;
    try {
      const verified = await testGeminiConnection(config, controller.signal);
      if (controller.signal.aborted) return;
      saveGeminiConfig(verified);
      setSaved(verified);
      setApiKey(verified.apiKey);
      setModel(verified.model);
      setVisible(false);
      setEditing(false);
      setNotice('Connection verified and key saved. Your AI coach is ready.');
      onConnected();
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Connection test failed.');
    } finally {
      if (!controller.signal.aborted) setTesting(false);
    }
  }

  function handleRemove() {
    pending.current?.abort();
    try {
      removeGeminiConfig();
      setSaved(null);
      setApiKey('');
      setModel(DEFAULT_GEMINI_MODEL);
      setVisible(false);
      setEditing(false);
      setTesting(false);
      setError('');
      setNotice('Your saved Gemini key has been removed.');
      onDisconnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove the key.');
    }
  }

  const closeSetup = () => {
    pending.current?.abort();
    setTesting(false);
    setVisible(false);
    onClose();
  };
  const content = (
    <section aria-labelledby="gemini-heading" className={connected ? "connection-bar" : "setup-layout"}>
      {!connected && <div className="setup-intro"><p className="eyebrow">Let's meet your coach</p><h2 id="gemini-heading">Bring your own Gemini API key</h2><p>Your next small win is almost here. Connect your key once, and we'll check that everything works.</p><ol className="setup-steps"><li><span>1</span><div><strong>Get your Gemini key</strong>Create one in Google AI Studio.</div></li><li><span>2</span><div><strong>Test and save</strong>We verify the connection before you start.</div></li><li><span>3</span><div><strong>Make yourself at home</strong>Feedback, practice and AI Polish are ready.</div></li></ol></div>}
      {connected && <div className="connection-summary"><div><h2 id="gemini-heading"><span className="connection-dot" />Gemini AI connected</h2><p>Your key powers all AI features · {saved?.model}</p></div><button type="button" onClick={() => { setEditing(!editing); setApiKey(saved?.apiKey || ''); setModel(saved?.model || DEFAULT_GEMINI_MODEL); setError(''); setVisible(false); }} disabled={testing} className="quiet-button">{editing ? 'Close settings' : 'Gemini settings'}</button></div>}
      {(!connected || editing) && (
        <form onSubmit={handleSubmit} className="setup-form space-y-4">
          {!connected && <div><p className="eyebrow">One-time setup</p><h3 className="font-bold text-lg mt-2">Connect to start learning</h3></div>}
          <p className="text-xs leading-relaxed text-slate-600">1. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-700 underline">Get a Gemini API key in Google AI Studio</a>. 2. Paste it below. 3. Test and save to start learning. <a href="https://aistudio.google.com/docs/get-started" target="_blank" rel="noreferrer" className="text-blue-700 underline">Setup guide</a></p>
          <div>
            <label htmlFor="gemini-key" className="block text-sm font-semibold mb-2">Gemini API key</label>
            <div className="flex gap-2">
              <input id="gemini-key" type={visible ? 'text' : 'password'} value={apiKey} onChange={event => { setApiKey(event.target.value); setError(''); }} required autoComplete="off" spellCheck={false} disabled={testing} placeholder="Paste your Gemini API key" aria-describedby="gemini-privacy" className="min-w-0 flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              <button type="button" aria-label={visible ? 'Hide API key' : 'Show API key'} aria-pressed={visible} onClick={() => setVisible(!visible)} className="text-blue-700 px-3 py-2 border rounded-lg">{visible ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <details>
            <summary className="text-sm text-slate-600 cursor-pointer">Advanced: Gemini model</summary>
            <label htmlFor="gemini-model" className="block text-sm font-semibold mt-3 mb-2">Model ID</label>
            <input id="gemini-model" value={model} onChange={event => setModel(event.target.value)} required disabled={testing} pattern="[a-zA-Z0-9._\-]+" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            <p className="text-xs text-slate-500 mt-1">Default: Gemini 3.6 Flash. If another model is unavailable, we'll test this default before connecting. Your working model appears in the connection status.</p>
          </details>
          <p id="gemini-privacy" className="text-xs text-slate-600">Your key is saved in this browser on this device. It is sent directly to Google with your writing for AI requests. Anyone with access to this browser can retrieve the saved key; remove it when using a shared device. Google API usage limits and charges may apply. The connection test makes a small AI request.</p>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={testing || !apiKey.trim() || !model.trim()} className="primary-button">{testing ? 'Testing Gemini connection…' : 'Test & save key'}</button>
            {saved && <button type="button" onClick={handleRemove} disabled={testing} className="text-rose-700 border border-rose-200 rounded-lg px-4 py-2 disabled:opacity-50">Remove saved key</button>}
          </div>
        </form>
      )}
      {(testing || error || notice) && <div className={connected ? "" : "px-6 pb-4 sm:col-span-2"}>
      {testing && <div className="flex items-center justify-between gap-3"><p role="status" className="text-sm text-blue-700 mt-3">Sending a test request to Gemini…</p><button type="button" className="quiet-button" onClick={() => { pending.current?.abort(); setTesting(false); setNotice('Connection test cancelled. You can try again.'); }}>Cancel test</button></div>}
      {error && <p role="alert" className="text-sm text-rose-700 bg-rose-50 p-3 rounded-lg mt-3">{error}</p>}
      {notice && (!connected || editing) && <p role="status" className="text-sm text-emerald-700 mt-3">{notice}</p>}
      </div>}
    </section>
  );
  if (connected) return content;
  if (!open) return null;
  return <Modal label="Connect your AI coach" onClose={closeSetup}><div className="setup-dialog"><button className="setup-dialog-close" type="button" aria-label="Close Gemini setup" onClick={closeSetup}>×</button>{content}</div></Modal>;
}
