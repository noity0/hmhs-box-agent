import React, { useState } from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  Lock,
  Sparkles,
  Mail,
  Zap,
  Cpu,
  User,
  Key,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import {
  MasterUser,
  masterSignInWithGoogle,
  masterSignInWithHMHS,
  masterSignOut,
  HMHS_AGENTS_METRIC,
} from '../utils/masterAuth';

interface MasterAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: MasterUser | null;
  onAuthChange: (user: MasterUser | null) => void;
  onOpenConnectors: () => void;
}

export const MasterAuthModal: React.FC<MasterAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthChange,
  onOpenConnectors,
}) => {
  const [authMode, setAuthMode] = useState<'options' | 'hmhs_manual'>('options');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const user = await masterSignInWithGoogle();
      onAuthChange(user);
    } catch (err: any) {
      console.warn('Google Auth popup closed/failed:', err);
      setErrorMessage(
        err.message || 'Google Sign-In failed or popup was closed. You can also sign in via HMHS Master Agent.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHMHSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMessage('Please enter your operator email or username.');
      return;
    }
    setIsProcessing(true);
    try {
      const user = masterSignInWithHMHS(emailInput.trim(), nameInput.trim(), tokenInput.trim());
      onAuthChange(user);
      setAuthMode('options');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOutClick = async () => {
    await masterSignOut();
    onAuthChange(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-indigo-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-purple-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                  HMHS Master Agent Sign-In
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold">
                  ONE-TIME AUTH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sign in once to unlock the 10 HMHS Box Agents and permanently authorize all 24+ Connectors
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Already Signed In Status */}
          {currentUser ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/50 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="w-12 h-12 rounded-full border-2 border-emerald-400 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-950 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-300 font-bold text-lg">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base font-sans">
                        {currentUser.displayName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ACTIVE
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono block">
                      {currentUser.email}
                    </span>
                    <span className="text-[11px] text-cyan-400 font-sans mt-0.5 block">
                      Authentication Provider: {currentUser.authProvider.toUpperCase()} • All 24+ Connectors Unlocked
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOutClick}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-xs text-slate-300 hover:text-rose-300 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <span>Permanent Session Cached</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenConnectors();
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 font-mono"
                >
                  <Zap className="w-3 h-3" />
                  <span>Configure 24+ App Connectors &rarr;</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Not Signed In: Auth Options */}
              {authMode === 'options' ? (
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <h4 className="text-base font-bold text-white">
                      Authorize Once • Never Sign In Again
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Choose your preferred sign-in method. Your credentials are securely cached in safe memory and synchronized with the 10 HMHS Box Agents.
                    </p>
                  </div>

                  {/* Primary Option: Google OAuth */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-red-500/50 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">
                            Sign in with Google (OAuth 2.0)
                          </span>
                          <span className="text-xs text-slate-400">
                            Automatic authorization for Gmail (Send/Read), Google Drive & Calendar
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs font-sans transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      <span>Authorize with Google Account (One-Time)</span>
                    </button>
                  </div>

                  {/* Secondary Option: HMHS Bot Master Agent Account */}
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-cyan-400">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">
                          HMHS Bot Master Agent Account
                        </span>
                        <span className="text-xs text-slate-400">
                          Sign in with your email or operator username to bind the 10 HMHS Box Agents
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAuthMode('hmhs_manual')}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs font-sans transition flex items-center justify-center gap-2 border border-cyan-500/30"
                    >
                      <User className="w-4 h-4" />
                      <span>Sign in with HMHS Bot Agent / Custom Credentials</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* HMHS Manual Credential Form */
                <form onSubmit={handleHMHSSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      HMHS Operator Credentials
                    </h4>
                    <button
                      type="button"
                      onClick={() => setAuthMode('options')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      &larr; Back to Options
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">
                        Operator Email / Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="e.g. operator@hmhs.internal or user@gmail.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">
                        Display Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="e.g. Lead Commander"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">
                        Custom API Token / Session Key (Optional)
                      </label>
                      <input
                        type="password"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="Enter custom JWT or leave blank for auto-generated session"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs font-sans transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Save Permanent Session</span>
                  </button>
                </form>
              )}
            </>
          )}

          {/* 10 HMHS Box Agents Live Status Grid */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 font-sans flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                10 HMHS Box Agents Super-Cluster
              </span>
              <span className="font-mono text-emerald-400 font-bold">10/10 SYNCHRONIZED</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {HMHS_AGENTS_METRIC.map((agent) => (
                <div
                  key={agent.id}
                  className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-cyan-300 font-bold">A-{agent.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-[11px] font-bold text-white truncate block mt-0.5">
                    {agent.name.split(' ')[1] || agent.name}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate block">
                    {agent.role.split('&')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
