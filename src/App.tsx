import React, { useState, useEffect, useRef } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { Sidebar } from './components/Sidebar';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { CouncilVisualizer } from './components/CouncilVisualizer';
import { CloudComputerModal } from './components/CloudComputerModal';
import { AppConnectorsModal } from './components/AppConnectorsModal';
import { GmailActionModal } from './components/GmailActionModal';
import { MasterAuthModal } from './components/MasterAuthModal';
import { ChatMessage, ChatSession } from './types';
import { safeStorage } from './utils/storage';
import { generateClientFallbackResponse } from './utils/clientChat';
import { getMasterUser, MasterUser, HMHS_AGENTS_METRIC } from './utils/masterAuth';
import {
  Menu,
  Plus,
  Send,
  Sparkles,
  Square,
  ArrowLeft,
  Atom,
  Cpu,
  Layers,
  Terminal,
  Zap,
  Mail,
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'landing' | 'chat'>('landing');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCouncilActive, setIsCouncilActive] = useState<boolean>(false);
  const [activeModeLabel, setActiveModeLabel] = useState<string>('💬 Normal AI (ChatGPT/Claude)');
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [isConnectorsModalOpen, setIsConnectorsModalOpen] = useState<boolean>(false);
  const [isGmailModalOpen, setIsGmailModalOpen] = useState<boolean>(false);
  const [gmailPrefill, setGmailPrefill] = useState<{ to?: string; subject?: string; body?: string }>({});
  const [masterUser, setMasterUser] = useState<MasterUser | null>(getMasterUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAgentHudOpen, setIsAgentHudOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = safeStorage.getItem('ai_chat_sessions_v12');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read sessions', e);
    }

    const initialSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'HMHS Box Task',
      timestamp: Date.now(),
      messages: [],
    };
    setSessions([initialSession]);
    setCurrentSessionId(initialSession.id);
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      try {
        safeStorage.setItem('ai_chat_sessions_v12', JSON.stringify(sessions));
      } catch (e) {
        // Safe fallback
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessions, isLoading, isCouncilActive, view]);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  const handleEnterChat = (initialPrompt?: string) => {
    if (!currentSession || currentSession.messages.length > 0) {
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: initialPrompt ? initialPrompt.slice(0, 30) + '...' : 'HMHS Box Task',
        timestamp: Date.now(),
        messages: [],
      };
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
    }

    setView('chat');

    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 100);
    }
  };

  const handleNewSession = () => {
    if (isLoading) {
      abortControllerRef.current?.abort();
    }
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'HMHS Box Task',
      timestamp: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'HMHS Box Task',
          timestamp: Date.now(),
          messages: [],
        };
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearAllSessions = () => {
    if (isLoading) {
      abortControllerRef.current?.abort();
      setIsLoading(false);
      setIsCouncilActive(false);
    }
    const fresh: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'HMHS Box Task',
      timestamp: Date.now(),
      messages: [],
    };
    setSessions([fresh]);
    setCurrentSessionId(fresh.id);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsCouncilActive(false);
    }
  };

  const handleOpenGmailWithDraft = (prefill?: { to?: string; subject?: string; body?: string }) => {
    if (prefill) {
      setGmailPrefill(prefill);
    }
    setIsGmailModalOpen(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    const previousMessages = currentSession?.messages || [];
    const updatedMessages = [...previousMessages, userMsg];

    const updatedTitle =
      previousMessages.length === 0
        ? query.slice(0, 32) + (query.length > 32 ? '...' : '')
        : currentSession.title;

    const assistantMsgId = `assistant-${Date.now() + 1}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: updatedTitle,
              messages: [...updatedMessages, initialAssistantMsg],
            }
          : s
      )
    );

    setIsLoading(true);

    // Only trigger Council / Terminal visualizer when explicitly requested by user prompt
    const isHeavyTask =
      /\b(terminal|kalilinux|win11|open terminal|show terminal|terminal kholo|shell)\b/i.test(query);

    setIsCouncilActive(isHeavyTask);

    const controller = new AbortController();
    let activityTimeout: NodeJS.Timeout | null = null;
    const resetActivityTimeout = () => {
      if (activityTimeout) clearTimeout(activityTimeout);
      // Give 45 seconds between chunks before considering stalled
      activityTimeout = setTimeout(() => {
        controller.abort();
      }, 45000);
    };
    resetActivityTimeout();

    try {
      let accumulatedText = '';

      // 1. Attempt streaming endpoint first
      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages }),
          signal: controller.signal,
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('text/event-stream') && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              resetActivityTimeout();
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              // Retain any trailing incomplete line in buffer
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;
                const dataStr = trimmed.slice(6).trim();
                if (dataStr === '[DONE]') break;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.status === 'council_active' || parsed.status === 'cloud_navigating' || parsed.status === 'cloud_extracted') {
                    setIsCouncilActive(true);
                    if (parsed.modeLabel) setActiveModeLabel(parsed.modeLabel);
                  } else if (parsed.text) {
                    accumulatedText += parsed.text;
                    setIsCouncilActive(false);
                    if (parsed.modeLabel) {
                      setActiveModeLabel(parsed.modeLabel);
                    }
                    setSessions((prev) =>
                      prev.map((s) =>
                        s.id === currentSessionId
                          ? {
                              ...s,
                              messages: s.messages.map((m) =>
                                m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                              ),
                            }
                          : s
                      )
                    );
                  }
                } catch {
                  // Ignore partial parsing
                }
              }
            }
          } else {
            // Netlify serverless function returned JSON
            try {
              const data = await response.json();
              if (data.reply) {
                accumulatedText = data.reply;
                if (data.modeLabel) setActiveModeLabel(data.modeLabel);
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === currentSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                          ),
                        }
                      : s
                  )
                );
              }
            } catch {
              // Ignore non-json
            }
          }
        }
      } catch (streamErr) {
        console.warn('Streaming fetch bypassed:', streamErr);
      }

      // 2. If stream did not return content, attempt JSON /api/chat endpoint
      if (!accumulatedText.trim()) {
        try {
          const fallbackRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: updatedMessages }),
            signal: controller.signal,
          });

          if (fallbackRes.ok) {
            const rawText = await fallbackRes.text();
            try {
              const parsedData = JSON.parse(rawText);
              if (parsedData.reply) {
                accumulatedText = parsedData.reply;
                if (parsedData.modeLabel) setActiveModeLabel(parsedData.modeLabel);
              }
            } catch {
              // Ignore HTML response
            }
          }
        } catch (apiErr) {
          console.warn('API fetch bypassed:', apiErr);
        }
      }

      // 3. Resilient client engine fallback (ensures ZERO 404 errors on Netlify or static host)
      if (!accumulatedText.trim()) {
        accumulatedText = await generateClientFallbackResponse(updatedMessages);
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                ),
              }
            : s
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      try {
        const emergencyReply = await generateClientFallbackResponse(updatedMessages);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: emergencyReply } : m
                  ),
                }
              : s
          )
        );
      } catch {
        // Safe display
      }
    } finally {
      if (activityTimeout) clearTimeout(activityTimeout);
      setIsLoading(false);
      setIsCouncilActive(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  if (view === 'landing') {
    return <LandingScreen onEnterChat={handleEnterChat} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        onOpenCloudComputer={() => setIsCloudModalOpen(true)}
        onOpenConnectors={() => setIsConnectorsModalOpen(true)}
        onOpenGmail={() => handleOpenGmailWithDraft()}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        masterUser={masterUser}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-950 relative">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3 truncate">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setView('landing')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition border border-slate-800"
              title="Back to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <div className="flex items-center gap-2 truncate">
              <h1 className="text-sm font-semibold text-white truncate font-sans">
                {currentSession?.title || 'HMHS Box Task'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Master Sign-In (One-Time Permanent Auth) */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition shadow-sm ${
                masterUser
                  ? 'bg-slate-900 border-emerald-500/60 text-emerald-300 hover:border-emerald-400'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-indigo-400 shadow-indigo-600/30'
              }`}
              title={masterUser ? `Logged in as ${masterUser.email}` : 'Sign in once to authorize all apps'}
            >
              {masterUser ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="max-w-[100px] sm:max-w-[130px] truncate font-bold font-sans">
                    {masterUser.displayName || masterUser.email}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-[9px] text-emerald-400 font-mono font-bold">
                    Linked
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="font-bold">Sign-In</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-[9px] text-cyan-300 font-mono font-bold">
                    1-Time
                  </span>
                </>
              )}
            </button>

            {/* Real Gmail OAuth Action Center Button */}
            <button
              type="button"
              onClick={() => handleOpenGmailWithDraft()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-xs font-mono text-red-300 hover:text-white transition shadow-sm hover:border-red-400 group"
              title="Authorized Gmail Action Center (OAuth Send, Compose & Inbox)"
            >
              <Mail className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-bold">Gmail</span>
              <span className="px-1.5 py-0.2 rounded-full bg-red-900/80 text-[10px] text-red-200 font-mono font-bold">
                OAuth
              </span>
            </button>

            {/* 24+ Real App Connectors Button */}
            <button
              type="button"
              onClick={() => setIsConnectorsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-mono text-cyan-300 hover:text-white transition shadow-sm hover:border-cyan-400 group"
              title="24+ Real App Connectors & OAuth Sign-In"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 group-hover:animate-pulse" />
              <span className="hidden sm:inline font-bold">24+ App Connectors</span>
              <span className="sm:hidden">Apps</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-900/80 text-[10px] text-cyan-300 font-mono font-bold">
                OAuth
              </span>
            </button>

            {/* Cloud PC Specs & Terminal Trigger Button (Max Specification) */}
            <button
              type="button"
              onClick={() => setIsCloudModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:text-white transition shadow-sm hover:border-cyan-400"
              title="Inspect HMHS Box Super Cloud Computer (512 GB RAM • 8x H100 SXM5 • 54 PB ZFS Matrix)"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden md:inline font-bold">HMHS Cloud PC</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
                512GB | 8x H100
              </span>
            </button>

            {/* Mode Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/70 text-indigo-300 text-xs font-mono shadow-sm">
              <Atom className="w-3.5 h-3.5 text-cyan-400 animate-[spin_6s_linear_infinite]" />
              <span className="truncate max-w-[200px]">{activeModeLabel}</span>
            </div>

            <button
              type="button"
              onClick={handleNewSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-sans text-slate-300 hover:text-white transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        {/* Cinematic 10-Agent Live HUD ("Scene wala") */}
        <div className="bg-slate-950/90 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between gap-3 text-xs shrink-0 font-mono">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5 text-[11px] shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">10 HMHS Box Agents:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>

            {/* Quick Agent Pills */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 whitespace-nowrap">
                A1 Vance (Spacetime)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 whitespace-nowrap">
                A3 Sterling (Recon)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-emerald-800 text-emerald-400 whitespace-nowrap font-semibold">
                A7 Cruz (OAuth Verified)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-800 text-cyan-300 whitespace-nowrap font-semibold">
                A8 Drake (Pipeline Active)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 whitespace-nowrap hidden md:inline">
                A10 Kane (54PB Matrix)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAgentHudOpen(!isAgentHudOpen)}
            className="text-[11px] text-slate-400 hover:text-cyan-300 transition flex items-center gap-1 shrink-0 font-mono"
            title="Toggle Agent Telemetry"
          >
            <span className="hidden sm:inline">{isAgentHudOpen ? 'Hide Matrix' : 'Live Matrix'}</span>
            {isAgentHudOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Expanded Agent Telemetry HUD */}
        {isAgentHudOpen && (
          <div className="p-3 bg-slate-900/95 border-b border-indigo-500/30 animate-in slide-in-from-top-2 shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
              {HMHS_AGENTS_METRIC.map((agent) => (
                <div key={agent.id} className="p-2 rounded bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 font-bold">Agent {agent.id}</span>
                    <span className="text-emerald-400">{agent.latency}</span>
                  </div>
                  <span className="text-white font-bold truncate mt-0.5">{agent.name}</span>
                  <span className="text-slate-400 truncate text-[9px]">{agent.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread Scroll Area */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-6 space-y-4">
          {(!currentSession || currentSession.messages.length === 0) && (
            <div className="max-w-2xl mx-auto py-12 sm:py-20 text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-cyan-400 animate-[pulse_3s_infinite]" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  HMHS BOX AGENTS • SUPER CLOUD COMPUTER
                </h2>
                <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Equipped with <span className="text-cyan-300 font-semibold">512 GB RAM</span>, <span className="text-indigo-300 font-semibold">8x NVIDIA H100 GPUs</span>, <span className="text-purple-300 font-semibold">54 PB ZFS Matrix</span>, and <span className="text-emerald-300 font-semibold">24+ Real App Connectors</span> with Gmail OAuth.
                </p>
              </div>

              {/* Clean User-Facing Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2 max-w-xl mx-auto">
                <div
                  onClick={() => handleSendMessage('Draft an official email regarding project collaboration for my review and sending via Gmail')}
                  className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 cursor-pointer transition space-y-1 group"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-red-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Personal Assistant & Gmail</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    "Draft an official email regarding project collaboration for my review and sending"
                  </p>
                </div>

                <div
                  onClick={() => handleSendMessage('Can you explain quantum entanglement and relativity from first principles?')}
                  className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition space-y-1 group"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>First-Principles Research</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    "Explain quantum entanglement and relativity from first principles"
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSession?.messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              onOpenGmail={handleOpenGmailWithDraft}
              onOpenConnectors={() => setIsConnectorsModalOpen(true)}
            />
          ))}

          {/* Aesthetic Animated HMHS Box Cloud Computer Visualizer */}
          {isLoading && isCouncilActive && (
            <div className="my-6 px-2 sm:px-4 max-w-3xl">
              <CouncilVisualizer />
            </div>
          )}

          {/* Fast indicator for standard small talk */}
          {isLoading && !isCouncilActive && currentSession?.messages[currentSession.messages.length - 1]?.content === '' && (
            <div className="flex justify-start my-6 px-2 sm:px-4">
              <div className="flex items-start gap-3 max-w-3xl w-full">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md text-white">
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span>Generating response...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Bar */}
        <div className="p-3 sm:p-5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-xl transition-all">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask HMHS Box Agents (e.g. 'iss site par jao aur details nikal kar do: https://...', terminal task, research)..."
                className="w-full bg-transparent py-3.5 pl-4 pr-12 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans leading-relaxed min-h-[48px] max-h-[180px]"
              />

              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition shadow-sm"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition shadow-md shadow-cyan-500/20"
                  title="Send message to HMHS Box Agents"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-sans px-1">
              <span>🖥️ HMHS Box Super Cloud Computer (512 GB RAM • 8x H100 SXM5 • 54 PB ZFS Matrix • 24+ App Connectors)</span>
              <span>AI can make mistakes. Verify important info.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Computer Live Specs & Terminal Modal (Max Specification) */}
      <CloudComputerModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onOpenConnectors={() => setIsConnectorsModalOpen(true)}
      />

      {/* 24+ Real App Connectors & Authorize Sign-In Hub */}
      <AppConnectorsModal
        isOpen={isConnectorsModalOpen}
        onClose={() => setIsConnectorsModalOpen(false)}
        onNotifyAgents={(appName) =>
          handleSendMessage(
            `[APP CONNECTOR ACTIVATED] User authorized and linked ${appName}. Synchronize active credentials with the 10 HMHS Box Agents and Cloud Computer pipeline.`
          )
        }
      />

      {/* Real Gmail OAuth Action Center Modal */}
      <GmailActionModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
        prefilledTo={gmailPrefill.to}
        prefilledSubject={gmailPrefill.subject}
        prefilledBody={gmailPrefill.body}
        onEmailSent={(details) =>
          handleSendMessage(
            `[EMAIL DISPATCH CONFIRMED VIA GMAIL API] Real email successfully sent to ${details.to} (Subject: "${details.subject}") via authorized Google Workspace OAuth with Message ID: ${details.id}.`
          )
        }
      />

      {/* HMHS Master One-Time Authorization Modal */}
      <MasterAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={masterUser}
        onAuthChange={(user) => {
          setMasterUser(user);
          if (user) {
            handleSendMessage(
              `[MASTER AGENT AUTHENTICATED] Operator ${user.displayName || user.email} signed in via ${user.authProvider.toUpperCase()}. Synchronize all 10 HMHS Box Agents and unlock 24+ App Connectors.`
            );
          }
        }}
        onOpenConnectors={() => setIsConnectorsModalOpen(true)}
      />
    </div>
  );
}
