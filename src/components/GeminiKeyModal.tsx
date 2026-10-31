import React, { useState, useEffect } from 'react';
import { safeStorage } from '../utils/storage';
import { GoogleGenAI } from '@google/genai';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Sparkles,
  X,
  Cpu,
  Zap,
} from 'lucide-react';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (hasKey: boolean) => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = safeStorage.getItem('hmhs_gemini_api_key') || '';
      const storedModel = safeStorage.getItem('hmhs_preferred_model') || 'gemini-2.5-flash';
      setApiKey(storedKey);
      setSelectedModel(storedModel);
      setHasExistingKey(!!storedKey);
      setStatus('idle');
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) {
      setStatus('error');
      setStatusMessage('Please enter an API key first.');
      return;
    }

    setStatus('testing');
    setStatusMessage('Connecting to Google Gemini API...');

    try {
      const testAi = new GoogleGenAI({
        apiKey: keyToTest,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const res = await testAi.models.generateContent({
        model: selectedModel,
        contents: [{ role: 'user', parts: [{ text: 'Ping: reply with "OK".' }] }],
      });

      if (res && res.text) {
        setStatus('success');
        setStatusMessage(`Connected successfully! Model ${selectedModel} responded.`);
        safeStorage.setItem('hmhs_gemini_api_key', keyToTest);
        safeStorage.setItem('hmhs_preferred_model', selectedModel);
        setHasExistingKey(true);
        if (onKeyUpdated) onKeyUpdated(true);
      } else {
        throw new Error('No response text returned.');
      }
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err?.message || 'Failed to authenticate API key. Check key validity.');
    }
  };

  const handleSaveKey = () => {
    const keyToSave = apiKey.trim();
    if (keyToSave) {
      safeStorage.setItem('hmhs_gemini_api_key', keyToSave);
      safeStorage.setItem('hmhs_preferred_model', selectedModel);
      setHasExistingKey(true);
      setStatus('success');
      setStatusMessage('API Key saved securely in your browser!');
      if (onKeyUpdated) onKeyUpdated(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      handleRemoveKey();
    }
  };

  const handleRemoveKey = () => {
    safeStorage.removeItem('hmhs_gemini_api_key');
    setApiKey('');
    setHasExistingKey(false);
    setStatus('idle');
    setStatusMessage('Key removed. System will use intelligent dynamic synthesis.');
    if (onKeyUpdated) onKeyUpdated(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Gemini AI Key Configuration</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400">
                  Free 3.8 / 2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supply your free Gemini API key for high-speed live reasoning & file generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Key Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              hasExistingKey
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {hasExistingKey ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>
                {hasExistingKey
                  ? 'Active Gemini API Key linked. Requests will execute live.'
                  : 'No custom key linked. System operates with intelligent synthesis.'}
              </span>
            </div>
            {hasExistingKey && (
              <button
                type="button"
                onClick={handleRemoveKey}
                className="text-xs text-red-400 hover:text-red-300 underline font-mono ml-2 shrink-0 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Preferred Gemini Model
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Free Tier Ready</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended: Ultra-fast & Free)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Latest Preview & File Synthesis)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy Stability)</option>
            </select>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
              <span>Saved locally in browser storage only. Never sent to third parties.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                status === 'testing'
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 animate-pulse'
                  : status === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {status === 'testing' && <Zap className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}
              {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {status === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Features Enabled by Key */}
          <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Direct Capabilities Unlocked:
            </div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li>100+ Specialized AI File Agents for native PPTX, XLSX, DOCX, and PDF generation</li>
              <li>Real-time reasoning without backend timeouts or server 404 status</li>
              <li>Autonomous Python, Bash, and full-stack software architecture synthesis</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleTestKey}
            disabled={status === 'testing' || !apiKey.trim()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Test Connection
          </button>

          <button
            type="button"
            onClick={handleSaveKey}
            disabled={status === 'testing'}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Save & Activate
          </button>
        </div>
      </div>
    </div>
  );
};
