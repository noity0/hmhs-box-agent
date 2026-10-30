import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Shield,
  MessageSquare,
  Terminal,
  Cpu,
  Globe,
  HardDrive,
  Layers,
} from 'lucide-react';

interface LandingScreenProps {
  onEnterChat: (initialPrompt?: string, enableDeepThinking?: boolean) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnterChat }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [deepThinkingDefault, setDeepThinkingDefault] = useState<boolean>(true);

  const sampleCards = [
    {
      title: 'Gmail & Personal Assistant',
      prompt: 'Draft an official update email regarding project deliverables for my review and sending via Gmail',
      tag: 'Gmail OAuth',
      icon: MessageSquare,
    },
    {
      title: '24+ Real App Connectors',
      prompt: 'How do I connect GitHub, Slack, Notion, and Discord with one-click sign-in to automate my tasks?',
      tag: '24+ Apps',
      icon: Zap,
    },
    {
      title: 'Deep Science & Physics',
      prompt: 'Can you explain quantum entanglement, gravity, and the theoretical speed of light from first principles?',
      tag: 'Deep Science',
      icon: Cpu,
    },
    {
      title: 'Roman Urdu & Daily Workflow',
      prompt: 'Salam! Mujhe artificial intelligence aur modern computing ka future asaan Roman Urdu mein samjhao.',
      tag: 'HMHS Assistant',
      icon: Globe,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background radial glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl w-full mx-auto text-center space-y-7 py-12">
        {/* Top Badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-bold text-white">HMHS BOX AGENTS</span>
          <span>•</span>
          <span>512 GB RAM</span>
          <span>•</span>
          <span>8x H100 GPUs</span>
          <span>•</span>
          <span>54 PB Storage</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">Kali Linux & Win11</span>
          <span>•</span>
          <span className="text-cyan-400 font-semibold">24+ App Connectors & Gmail</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-sans leading-tight">
            HMHS Box Agents & <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Super Cloud Computer
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            10 World-Class Master AI Agents operating a 512 GB RAM, 8x NVIDIA H100, 54 PB Storage Cloud Computer (Dual Kali Linux + Windows 11) with Authorized Real Gmail API & 24+ App Connectors.
          </p>
        </div>

        {/* Enter Chat Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => onEnterChat(selectedPrompt, deepThinkingDefault)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold text-base shadow-xl shadow-cyan-600/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5 text-cyan-200" />
            <span>Launch HMHS Box Agents & Cloud PC</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Interactive Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-5 max-w-3xl mx-auto">
          {sampleCards.map((card, idx) => {
            const Icon = card.icon;
            const isSelected = selectedPrompt === card.prompt;
            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedPrompt(card.prompt);
                  onEnterChat(card.prompt, deepThinkingDefault);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 group ${
                  isSelected
                    ? 'bg-indigo-950/50 border-cyan-400 ring-1 ring-cyan-400'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">{card.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                    {card.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-300 transition">
                  {card.prompt}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer Telemetry */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-mono">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>HMHS Box Cloud Computer: 512GB RAM • 8x H100 SXM5 • 54PB ZFS • 24+ App Connectors • Real Gmail OAuth</span>
        </div>
      </div>
    </div>
  );
};
