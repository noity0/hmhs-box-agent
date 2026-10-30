import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Inbox,
  User as UserIcon,
  Shield,
  Key,
  LogOut,
  ExternalLink,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  googleSignIn,
  getAccessToken,
  setManualAccessToken,
  logoutGoogle,
  initAuth,
  auth,
} from '../utils/googleAuth';
import {
  sendGmailEmail,
  fetchRecentEmails,
  fetchGmailProfile,
  GmailEmailSummary,
  GmailProfile,
} from '../utils/gmailApi';
import { safeStorage } from '../utils/storage';
import { getMasterUser, getMasterToken } from '../utils/masterAuth';
import { User } from 'firebase/auth';

interface GmailActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledTo?: string;
  prefilledSubject?: string;
  prefilledBody?: string;
  onEmailSent?: (details: { to: string; subject: string; id: string }) => void;
}

// Clean all conversational prompt text, trailing dividers, and action footers out of email body
function cleanEmailBodyText(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();

  // Strip leading blockquotes or prefixes
  cleaned = cleaned.replace(/^[>\s]+/, '');

  // Strip trailing dividers and action prompts
  cleaned = cleaned
    .replace(/\s*(\*{3,}|_{3,}|-{3,})\s*$/g, '')
    .replace(/\s*\*\*Ready to send\??\*\*[\s\S]*$/i, '')
    .replace(/\s*Ready to send\??[\s\S]*$/i, '')
    .replace(/\s*Just say ["'].*?["'][\s\S]*$/i, '')
    .replace(/\s*Action requires explicit confirmation[\s\S]*$/i, '')
    .replace(/\s*Open in Gmail Action Center[\s\S]*$/i, '')
    .replace(/\s*Review & Send Email[\s\S]*$/i, '')
    .replace(/\s*(\*{3,}|_{3,}|-{3,})\s*$/g, '')
    .trim();

  return cleaned;
}

export const GmailActionModal: React.FC<GmailActionModalProps> = ({
  isOpen,
  onClose,
  prefilledTo = '',
  prefilledSubject = '',
  prefilledBody = '',
  onEmailSent,
}) => {
  // Synchronously initialize auth from persistent storage so it NEVER re-prompts
  const [currentUser, setCurrentUser] = useState<User | any>(() => {
    if (auth.currentUser) return auth.currentUser;
    const master = getMasterUser();
    if (master) return master;
    const stored = safeStorage.getItem('hmhs_google_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return getMasterToken();
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'inbox'>('compose');

  // Manual token input state
  const [showManualTokenInput, setShowManualTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState('');

  // Compose State
  const [recipient, setRecipient] = useState(prefilledTo);
  const [subject, setSubject] = useState(prefilledSubject);
  const [body, setBody] = useState(() => cleanEmailBodyText(prefilledBody));
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  // Inbox State
  const [emails, setEmails] = useState<GmailEmailSummary[]>([]);
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [inboxError, setInboxError] = useState<string | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        // Only clear if no master session in safeStorage
        const master = getMasterUser();
        const masterToken = getMasterToken();
        if (master && masterToken) {
          setCurrentUser(master);
          setAccessToken(masterToken);
        } else {
          setCurrentUser(null);
          setAccessToken(null);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // Update fields when prefilled props change (with automatic body cleaning)
  useEffect(() => {
    if (prefilledTo) setRecipient(prefilledTo);
    if (prefilledSubject) setSubject(prefilledSubject);
    if (prefilledBody) setBody(cleanEmailBodyText(prefilledBody));
  }, [prefilledTo, prefilledSubject, prefilledBody]);

  // Load Profile and Inbox when access token is present
  const loadGmailData = async () => {
    const token = accessToken || (await getAccessToken()) || getMasterToken();
    if (!token) return;

    setIsLoadingInbox(true);
    setInboxError(null);
    try {
      const [userProfile, recentList] = await Promise.all([
        fetchGmailProfile(token).catch(() => null),
        fetchRecentEmails(token, 8).catch((err) => {
          setInboxError(err.message || 'Could not fetch inbox.');
          return [];
        }),
      ]);
      if (userProfile) setProfile(userProfile);
      setEmails(recentList);
    } catch (e: any) {
      setInboxError(e.message || 'Error communicating with Gmail API.');
    } finally {
      setIsLoadingInbox(false);
    }
  };

  useEffect(() => {
    if (isOpen && accessToken) {
      loadGmailData();
    }
  }, [isOpen, accessToken]);

  if (!isOpen) return null;

  const handleGoogleSignInClick = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setSendResult(null);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setManualAccessToken(manualToken.trim());
    setAccessToken(manualToken.trim());
    setShowManualTokenInput(false);
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    safeStorage.removeItem('hmhs_master_auth_user');
    safeStorage.removeItem('hmhs_master_token');
    setCurrentUser(null);
    setAccessToken(null);
    setEmails([]);
    setProfile(null);
  };

  // Dispatch real email with confirmation
  const handleExecuteSend = async () => {
    const token = accessToken || (await getAccessToken()) || getMasterToken();
    if (!token) {
      setSendResult({
        id: '',
        success: false,
        message: 'No authorization token available. Please sign in with Google once.',
      });
      return;
    }

    const cleanBody = cleanEmailBodyText(body);
    if (!recipient.trim() || !subject.trim() || !cleanBody.trim()) {
      setSendResult({
        id: '',
        success: false,
        message: 'Please provide Recipient (To), Subject, and Body text.',
      });
      return;
    }

    setIsSending(true);
    setShowConfirmSend(false);
    setSendResult(null);

    try {
      const response = await sendGmailEmail(token, recipient.trim(), subject.trim(), cleanBody.trim());
      setSendResult({
        id: response.id,
        success: true,
        message: `Email successfully delivered via Gmail API! Message ID: ${response.id}`,
      });

      if (onEmailSent) {
        onEmailSent({ to: recipient.trim(), subject: subject.trim(), id: response.id });
      }

      // Reset fields
      setBody('');
      setSubject('');
    } catch (err: any) {
      setSendResult({
        id: '',
        success: false,
        message: err.message || 'Failed to send email via Gmail API.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const hasAuth = Boolean(currentUser || accessToken);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-red-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 via-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-sans flex items-center gap-2">
                  Gmail Live Dispatch & Inbox Center
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-300 text-[10px] font-mono font-bold">
                  REAL GMAIL API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authorize once to send verified emails and read messages on your behalf
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

        {/* Live Agent Oversight Badges ("Scene wala") */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Agent 7 (Dr. Vespera Cruz): OAuth & Security Verified
            </span>
            <span className="text-cyan-400 hidden sm:flex items-center gap-1 font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Agent 8 (Prof. Silas Drake): Pipeline Active
            </span>
          </div>
          <span className="text-slate-400 font-sans">
            One-Time Permanent Auth
          </span>
        </div>

        {/* Auth Banner & Sign In with Google */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 shrink-0">
          {hasAuth ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-10 h-10 rounded-full border border-emerald-500/50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-sans">
                      {currentUser?.displayName || 'Authorized Google Account'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      AUTHENTICATED & LINKED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {profile?.emailAddress || currentUser?.email || 'OAuth Token Session Active'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadGmailData}
                  disabled={isLoadingInbox}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition flex items-center gap-1.5"
                  title="Refresh inbox & profile"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInbox ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-rose-300 text-xs font-sans transition flex items-center gap-1.5"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">
                    One-Time Google Sign-In Required to Link Gmail
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authenticate your account once to grant permanent send/read permission for all future sessions.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  disabled={isLoggingIn}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs font-sans transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
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
                  <span>Sign In with Google (One-Time)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualTokenInput(!showManualTokenInput)}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition"
                  title="Enter manual token"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Manual Token Fallback */}
          {showManualTokenInput && (
            <form onSubmit={handleManualTokenSubmit} className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs text-slate-300 font-mono block">
                Manual Google OAuth Bearer Token (Permanent Cache):
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="ya29.a0AfH6SM..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-mono font-bold"
                >
                  Save Token
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`flex-1 py-2.5 text-xs font-bold font-mono transition flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'compose'
                ? 'border-red-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-red-400" />
            <span>✉️ Compose & Send Email</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-2.5 text-xs font-bold font-mono transition flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'inbox'
                ? 'border-red-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-red-400" />
            <span>📥 Recent Inbox Messages ({emails.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'compose' && (
            <div className="space-y-4">
              {sendResult && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in ${
                    sendResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-semibold font-sans">
                      {sendResult.message}
                    </p>
                    {sendResult.id && (
                      <p className="text-[11px] font-mono text-emerald-400/80">
                        Gmail Message ID: {sendResult.id} • Monitored by HMHS Agent 8
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Recipient */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                  To (Recipient Email Address):
                </label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                  Subject:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Executive brief or topic..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    Email Body:
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {body.length} characters • Letter Content Only
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Dear colleague,\n\nI am writing to share..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-red-500 font-sans leading-relaxed resize-y"
                />
              </div>

              {/* Confirmation Step */}
              {showConfirmSend ? (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/50 space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-mono">
                        Confirm Live Email Dispatch
                      </h4>
                      <p className="text-xs text-amber-300/90 mt-1 font-sans">
                        You are about to dispatch this real email to{' '}
                        <span className="font-bold underline text-white">{recipient}</span> through your authenticated Google account.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleExecuteSend}
                      disabled={isSending}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-sans transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                    >
                      {isSending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Yes, Dispatch Email Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowConfirmSend(false)}
                      disabled={isSending}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-sans transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-sans">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Real-time OAuth verification • Zero conversational text injected</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!recipient.trim() || !subject.trim() || !body.trim()) {
                        setSendResult({
                          id: '',
                          success: false,
                          message: 'Please fill out recipient, subject, and body first.',
                        });
                        return;
                      }
                      setShowConfirmSend(true);
                    }}
                    disabled={isSending}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs font-sans transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Email via Gmail API</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="space-y-3">
              {inboxError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{inboxError}</span>
                </div>
              )}

              {isLoadingInbox ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-red-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">
                    Querying Gmail API Inbox...
                  </p>
                </div>
              ) : emails.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-400 font-sans">
                    No recent messages retrieved or Gmail scope restricted.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emails.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-xs font-sans">
                          {msg.from || 'Unknown Sender'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-semibold truncate font-sans">
                        {msg.subject || '(No subject)'}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                        {msg.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
