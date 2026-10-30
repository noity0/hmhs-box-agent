import React, { useState } from 'react';
import { ChatSession } from '../types';
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  Sparkles,
  Search,
  AlertTriangle,
  Clock,
  Cpu,
  Zap,
  Mail,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions?: () => void;
  onOpenCloudComputer?: () => void;
  onOpenConnectors?: () => void;
  onOpenGmail?: () => void;
  onOpenAuth?: () => void;
  masterUser?: any;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAllSessions,
  onOpenCloudComputer,
  onOpenConnectors,
  onOpenGmail,
  onOpenAuth,
  masterUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 sm:w-80 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header & New Chat Button */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight font-sans text-sm block">
                  AI Research Assistant
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  Gemini 3.8 Flash
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition shadow-md shadow-indigo-600/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Master Auth / User Profile Quick Card */}
          <button
            type="button"
            onClick={() => {
              onOpenAuth?.();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-indigo-500/40 hover:border-cyan-400 transition flex items-center justify-between gap-2 group text-left shadow-sm"
          >
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${masterUser ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate font-sans">
                  {masterUser ? masterUser.displayName || masterUser.email : 'Master Sign-In'}
                </span>
                <span className="text-[10px] text-cyan-300 font-mono block">
                  {masterUser ? 'Permanent Auth Active' : 'One-Time Authorization'}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950 border border-indigo-800 text-cyan-300 font-mono font-bold shrink-0">
              {masterUser ? 'LINKED' : 'AUTH'}
            </span>
          </button>

          {/* Cloud Computer, App Connectors & Gmail Quick Links */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                onOpenCloudComputer?.();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 transition flex flex-col items-center gap-1 group text-center"
              title="HMHS Cloud PC (512GB RAM, 8x H100)"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold text-slate-200">Cloud PC</span>
              <span className="text-[9px] text-cyan-400 font-mono">512GB</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenConnectors?.();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col items-center gap-1 group text-center"
              title="24+ Real App Connectors & OAuth Sign-In"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-mono font-bold text-slate-200">24+ Apps</span>
              <span className="text-[9px] text-indigo-400 font-mono">OAuth</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenGmail?.();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 transition flex flex-col items-center gap-1 group text-center"
              title="Gmail Action Center (Send, Read & Compose via OAuth)"
            >
              <Mail className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-mono font-bold text-slate-200">Gmail</span>
              <span className="text-[9px] text-red-400 font-mono">Send/Read</span>
            </button>
          </div>

          {/* Search Chat History */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Sessions List (Chat History) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-sans uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
            <span>Chat History ({filteredSessions.length})</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2">
              <Clock className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 font-sans">
                {searchQuery ? 'No matching chats found.' : 'No previous chats yet.'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer border ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-medium border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                    <div className="truncate">
                      <p className="truncate font-sans">{session.title}</p>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {formatRelativeTime(session.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Delete Single Chat Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition shrink-0"
                    title="Delete this chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Clear All System */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950">
          {showClearConfirm ? (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Delete all chat history?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllSessions?.();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-1 px-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition"
                >
                  Yes, Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            sessions.length > 1 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 text-xs transition font-sans"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Chat History</span>
              </button>
            )
          )}

          <div className="text-[11px] text-slate-500 text-center font-sans">
            Powered by Google Gemini 3.8 Flash
          </div>
        </div>
      </aside>
    </>
  );
};
