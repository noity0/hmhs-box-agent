import React, { useState, useEffect } from 'react';
import {
  Atom,
  Cpu,
  Sparkles,
  Brain,
  Dna,
  Rocket,
  Compass,
  Radio,
  Shield,
  Zap,
  Terminal,
  HardDrive,
  Activity,
  Layers,
} from 'lucide-react';

const HMHS_AGENTS = [
  { name: 'Dr. Alistair Vance', role: 'Quantum Metric Specialist', icon: Atom, color: 'text-cyan-400', border: 'border-cyan-500/50' },
  { name: 'Prof. Kaelen Thorne', role: 'Thermodynamics Boundary Architect', icon: Zap, color: 'text-amber-400', border: 'border-amber-500/50' },
  { name: 'Dr. Lyra Sterling', role: 'Molecular Nanotech & Web Recon Lead', icon: Cpu, color: 'text-emerald-400', border: 'border-emerald-500/50' },
  { name: 'Prof. Zephyr Vance', role: 'Dark Matter & Network Topology Lead', icon: Compass, color: 'text-indigo-400', border: 'border-indigo-500/50' },
  { name: 'Dr. Nyx Thorne', role: 'Quantum Consciousness Specialist', icon: Brain, color: 'text-purple-400', border: 'border-purple-500/50' },
  { name: 'Prof. Orion Voss', role: 'Relativistic Propulsion Engineer', icon: Rocket, color: 'text-rose-400', border: 'border-rose-500/50' },
  { name: 'Dr. Vespera Cruz', role: 'Computational Epigenetics Lead', icon: Dna, color: 'text-pink-400', border: 'border-pink-500/50' },
  { name: 'Prof. Silas Drake', role: 'AGI & Kali/Win11 Automation Lead', icon: Radio, color: 'text-blue-400', border: 'border-blue-500/50' },
  { name: 'Dr. Thalia Rey', role: 'Sub-Quantum Kinetics Engineer', icon: Sparkles, color: 'text-teal-400', border: 'border-teal-500/50' },
  { name: 'Prof. Magnus Kane', role: 'Megastructure & 54PB Matrix Director', icon: Shield, color: 'text-yellow-400', border: 'border-yellow-500/50' },
];

const CLOUD_EXECUTION_PHASES = [
  {
    phase: 'Phase 1: HMHS Cloud Computer Boot & Allocation',
    action: 'Allocating 120 GB RAM DDR5 pool & mounting 54 PB Quantum NVMe Matrix storage...',
    cmd: 'kali@hmhs-cloud:~$ /opt/hmhs/boot_cluster.sh --nodes=10 --mem=120GB --storage=54PB',
  },
  {
    phase: 'Phase 2: Kali Linux Recon & Windows 11 Sandbox Execution',
    action: 'HMHS Box Agents spawning headless browser sockets, network packets & DOM scraper...',
    cmd: 'kali@hmhs-cloud:~$ curl -I -s -L --max-time 5 $TARGET_SITE | grep -i "server\\|content"',
  },
  {
    phase: 'Phase 3: 10 HMHS Box Agents Multi-Core Synthesis',
    action: '10 master scientists & futurist predictors analyzing extracted payload in parallel...',
    cmd: 'powershell> Invoke-HMHSConsensus -Agents 10 -EvaluateFirstPrinciples -OutBuffer 54PB',
  },
  {
    phase: 'Phase 4: Scientific Cross-Debate & Thermodynamic Filtering',
    action: 'Eliminating mathematical inconsistencies, verifying entropy limits (dS ≥ 0)...',
    cmd: 'kali@hmhs-cloud:~$ python3 -m hmhs_verify --check=lorentz,entropy,quantum_limits',
  },
  {
    phase: 'Phase 5: Reaching 10/10 Unanimous Consensus',
    action: 'All 10 HMHS Box Agents agreed. Synthesizing publication-grade report with tables & roadmaps...',
    cmd: '[HMHS CONSENSUS REACHED] Publishing finalized 99.99% breakthrough report to chat.',
  },
];

export const CouncilVisualizer: React.FC = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [activeAgent, setActiveAgent] = useState(0);

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % CLOUD_EXECUTION_PHASES.length);
    }, 2800);

    const agentTimer = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % HMHS_AGENTS.length);
    }, 500);

    return () => {
      clearInterval(phaseTimer);
      clearInterval(agentTimer);
    };
  }, []);

  const currentPhase = CLOUD_EXECUTION_PHASES[phaseIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950/70 to-slate-950 border border-cyan-500/40 p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in duration-500">
      {/* Cloud Computer Hardware Specs HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Cpu className="w-6 h-6 text-cyan-400 animate-[spin_8s_linear_infinite]" />
            <span className="absolute inset-0 rounded-full bg-cyan-400/20 blur-sm animate-ping" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
              HMHS BOX CLOUD COMPUTER
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                10 Box Agents
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 font-mono flex items-center gap-2">
              <span>⚡ 512 GB RAM</span>
              <span>•</span>
              <span>💾 54 PB ZFS</span>
              <span>•</span>
              <span>🚀 8x H100 SXM5</span>
              <span>•</span>
              <span className="text-emerald-400">🐧 Kali + 🪟 Win11</span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="px-3 py-1 rounded-full bg-indigo-900/70 border border-cyan-500/50 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Executing on Cloud PC</span>
        </div>
      </div>

      {/* Grid of the 10 HMHS Box Agents */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {HMHS_AGENTS.map((agent, idx) => {
          const Icon = agent.icon;
          const isWorking = activeAgent === idx;
          return (
            <div
              key={idx}
              className={`p-2 rounded-xl border transition-all duration-300 relative ${
                isWorking
                  ? 'bg-indigo-900/50 border-cyan-400 shadow-md shadow-cyan-500/20 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center shrink-0 border ${agent.border}`}>
                  <Icon className={`w-3.5 h-3.5 ${agent.color}`} />
                </div>
                <div className="truncate min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate font-sans">
                    {agent.name.split(' ')[1] || agent.name}
                  </p>
                  <p className="text-[9px] text-cyan-300/80 truncate font-mono">
                    {isWorking ? '⚡ Computing' : 'Allocated'}
                  </p>
                </div>
              </div>
              {isWorking && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
          );
        })}
      </div>

      {/* Live Animated Cloud Terminal Console */}
      <div className="rounded-xl bg-black border border-indigo-500/40 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-cyan-300 font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            {currentPhase.phase}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Step {phaseIndex + 1} / 5
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
          {currentPhase.action}
        </p>

        {/* Live Monospace Terminal Output */}
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-emerald-400 overflow-x-auto truncate">
          <span className="text-cyan-400">{currentPhase.cmd}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
          <div
            className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((phaseIndex + 1) / CLOUD_EXECUTION_PHASES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
