import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Cpu,
  HardDrive,
  Activity,
  Terminal,
  Shield,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Play,
  RotateCcw,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface CloudComputerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectors?: () => void;
}

const AGENT_CORE_PINNINGS = [
  { id: 1, name: 'Dr. Alistair Vance', role: 'Spacetime Metric Specialist', cores: 'Cores 0-23', gpu: 'GPU 0 (H100)', vram: '34.1 GB', load: '42%', status: 'Metric Tensor Computing' },
  { id: 2, name: 'Prof. Kaelen Thorne', role: 'Thermodynamics Boundary Architect', cores: 'Cores 24-47', gpu: 'GPU 1 (H100)', vram: '42.4 GB', load: '51%', status: 'Entropy Sinks Active' },
  { id: 3, name: 'Dr. Lyra Sterling', role: 'Molecular Nanotech & Materials', cores: 'Cores 48-71', gpu: 'GPU 2 (H100)', vram: '28.9 GB', load: '36%', status: 'Atomic Lattice Mesh' },
  { id: 4, name: 'Prof. Zephyr Vance', role: 'Dark Sector & Vacuum Topology', cores: 'Cores 72-95', gpu: 'GPU 3 (H100)', vram: '39.1 GB', load: '48%', status: 'Casimir Boundary Loop' },
  { id: 5, name: 'Dr. Nyx Thorne', role: 'Quantum Coherence & Neural Bounds', cores: 'Cores 96-119', gpu: 'GPU 4 (H100)', vram: '31.2 GB', load: '39%', status: 'Wave-Function Protection' },
  { id: 6, name: 'Prof. Orion Voss', role: 'Relativistic Propulsion & Dynamics', cores: 'Cores 120-143', gpu: 'GPU 5 (H100)', vram: '45.6 GB', load: '58%', status: 'Thrust Vectoring Active' },
  { id: 7, name: 'Dr. Vespera Cruz', role: 'Biological Integrity & Shielding', cores: 'Cores 144-167', gpu: 'GPU 6 (H100)', vram: '26.5 GB', load: '33%', status: 'Radiation Shielding Check' },
  { id: 8, name: 'Prof. Silas Drake', role: 'Autonomous Kali/Win11 Engine', cores: 'Cores 168-191', gpu: 'GPU 7 (H100)', vram: '48.2 GB', load: '62%', status: 'Daemon & Code Runner' },
  { id: 9, name: 'Dr. Thalia Rey', role: 'Failure Mode Reverse-Engineer', cores: 'Cores 192-223', gpu: 'QPU-Array', vram: '24.0 GB', load: '44%', status: 'Bottleneck Countermeasure' },
  { id: 10, name: 'Prof. Magnus Kane', role: '54PB Matrix Synthesis Director', cores: 'Cores 224-255', gpu: 'All NVLink', vram: '640 GB Bus', load: '78%', status: 'Consensus Director' },
];

const WORKSPACE_FILES = [
  { name: 'scraper.py', size: '4.2 KB', desc: 'Real-time DOM scraping & headless cURL extractor for web reconnaissance', lang: 'Python 3.12' },
  { name: 'quantum_simulation.py', size: '6.8 KB', desc: 'Casimir zero-point fluctuation and room-temperature superconductor lattice sim', lang: 'Python 3.12' },
  { name: 'warp_field_metric.py', size: '3.5 KB', desc: 'Alcubierre-White metric tensor solver and negative energy density curvature validator', lang: 'Python 3.12' },
  { name: 'elephant_biomechanics.py', size: '2.1 KB', desc: 'African Elephant inverted pendulum gait & peak ground reaction force solver', lang: 'Python 3.12' },
  { name: 'recon_data.json', size: '128.4 KB', desc: 'Extracted web metadata, headers, security posture, and payload metrics', lang: 'JSON Data' },
];

export const CloudComputerModal: React.FC<CloudComputerModalProps> = ({ isOpen, onClose, onOpenConnectors }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'agents' | 'files'>('terminal');
  const [activeOS, setActiveOS] = useState<'kali' | 'win11'>('kali');
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    '[*] [HMHS BOX SUPER CLOUD COMPUTER INITIALIZED - MAX SPECIFICATION NODE #01-ULTRA]',
    '[*] Processors: 256-Core AMD EPYC 9654 Genoa-X (5.2 GHz Boost, 1024 Virtual Threads, 1.15GB 3D V-Cache)',
    '[*] High-Speed Memory: 512 GB DDR5 ECC Quad-Channel Unified RAM (768 GB/s Bandwidth)',
    '[*] Matrix Storage: 54 PB Quantum NVMe ZFS Array (/mnt/quantum_store, 120 GB/s IOPS)',
    '[*] Accelerators: 8x NVIDIA H100 80GB SXM5 NVLink (640 GB Aggregate VRAM, 32,000 Tensor TFLOPS)',
    '[*] Interconnect: 800 Gbps InfiniBand RDMA Quantum-2 (0.05ms Ping Latency)',
    '[*] Cryogenics: Sub-Zero Liquid Fluorinert Loop (Core Temp: 31°C)',
    '[+] Dual Subsystems: Kali Linux Rolling 2026.1 & Windows 11 Enterprise Hyper-V Online',
    '[+] All 10 HMHS Box Master Agents Pinned to Physical Cores & GPU Bus',
    'root@hmhs-box-maxcloud:~# Ready for real bash & network execution. Type command below.',
  ]);

  useEffect(() => {
    if (isOpen && activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, isOpen, activeTab]);

  if (!isOpen) return null;

  const runCommand = async (cmdToRun: string) => {
    const cmd = cmdToRun.trim();
    if (!cmd || isExecuting) return;

    setCommandInput('');
    setIsExecuting(true);

    const promptPrefix = activeOS === 'kali' ? 'root@hmhs-box-maxcloud:~#' : 'PS C:\\HMHS\\Workspace>';
    setTerminalHistory((prev) => [...prev, `${promptPrefix} ${cmd}`]);

    try {
      const response = await fetch('/api/cloud-computer/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, os: activeOS }),
      });

      const data = await response.json();
      const outputLines: string[] = [];

      if (data.stdout) {
        outputLines.push(...data.stdout.trim().split('\n'));
      }
      if (data.stderr) {
        outputLines.push(...data.stderr.trim().split('\n').map((l: string) => `[STDERR] ${l}`));
      }
      if (!data.stdout && !data.stderr) {
        outputLines.push(`[Process finished with exit code ${data.exitCode}]`);
      }

      setTerminalHistory((prev) => [...prev, ...outputLines]);
    } catch (err: any) {
      setTerminalHistory((prev) => [
        ...prev,
        `[HMHS ERROR] Execution socket failed: ${err?.message || 'Connection interrupted'}`,
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(commandInput);
  };

  const sampleCommands = [
    'free -h',
    'lscpu',
    'nvidia-smi',
    'df -h',
    'ip a',
    'python3 scraper.py --url https://wikipedia.org --extract-meta',
    'uname -a',
    'cat /etc/os-release',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Cpu className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight flex items-center gap-2">
                  HMHS BOX SUPER CLOUD COMPUTER
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono">
                    MAX SPECIFICATION
                  </span>
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-mono font-bold animate-pulse">
                  ONLINE • 8x H100
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-sans">
                512 GB DDR5 RAM • 256-Core AMD EPYC • 8x H100 (640GB VRAM) • 54 PB ZFS Matrix • 800 Gbps InfiniBand
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenConnectors && (
              <button
                type="button"
                onClick={onOpenConnectors}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-mono text-cyan-300 hover:text-white transition"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>24+ App Connectors</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Hardware Telemetry HUD Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-slate-900/60 border-b border-slate-800 text-xs shrink-0">
          {/* RAM Gauge */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Activity className="w-3.5 h-3.5" /> Memory (RAM)
              </span>
              <span className="text-white font-bold">512 GB</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full w-[28%]" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Used: 142.4 GB</span>
              <span>Free: 369.6 GB</span>
            </div>
          </div>

          {/* Storage Gauge */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <HardDrive className="w-3.5 h-3.5" /> Matrix Storage
              </span>
              <span className="text-white font-bold">54 PB</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[4%]" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Throughput: 120 GB/s</span>
              <span>Free: 51.8 PB</span>
            </div>
          </div>

          {/* CPU Gauge */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Cpu className="w-3.5 h-3.5" /> 256-Core EPYC
              </span>
              <span className="text-white font-bold">1024 Th</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full w-[44%]" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Clock: 5.2 GHz Boost</span>
              <span>Temp: 31°C Fluorinert</span>
            </div>
          </div>

          {/* GPU Gauge */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Zap className="w-3.5 h-3.5" /> 8x NVIDIA H100
              </span>
              <span className="text-white font-bold">640 GB</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full w-[52%]" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>TFLOPS: 32,000</span>
              <span>NVLink Gen5 Active</span>
            </div>
          </div>
        </div>

        {/* View Switcher: Terminal | 10-Agent Hardware Mapping | 54PB Files */}
        <div className="px-3 pt-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-mono font-bold transition border-t border-x ${
                activeTab === 'terminal'
                  ? 'bg-black border-slate-700 text-cyan-300'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Interactive Terminal ({activeOS === 'kali' ? 'Kali Linux' : 'Win11'})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('agents')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-mono font-bold transition border-t border-x ${
                activeTab === 'agents'
                  ? 'bg-black border-slate-700 text-indigo-300'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>10 Agents Hardware Pinning (256 Cores / 8 GPUs)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-mono font-bold transition border-t border-x ${
                activeTab === 'files'
                  ? 'bg-black border-slate-700 text-emerald-300'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>54 PB Workspace Files & Python Runner</span>
            </button>
          </div>

          {activeTab === 'terminal' && (
            <div className="flex items-center gap-1.5 pb-1">
              <button
                type="button"
                onClick={() => setActiveOS('kali')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                  activeOS === 'kali' ? 'bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                🐧 Kali Linux Root
              </button>
              <button
                type="button"
                onClick={() => setActiveOS('win11')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                  activeOS === 'win11' ? 'bg-blue-950 border border-blue-800 text-blue-300 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                🪟 Win11 PowerShell
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Terminal Content */}
        {activeTab === 'terminal' && (
          <div className="flex-1 flex flex-col min-h-0 bg-black">
            {/* Quick Command Suggestions */}
            <div className="p-2 border-b border-slate-900 bg-slate-950/90 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono shrink-0">
              <span className="text-slate-500 shrink-0 px-1">Quick:</span>
              {sampleCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => runCommand(cmd)}
                  disabled={isExecuting}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-cyan-300/90 whitespace-nowrap transition"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Terminal History Log Console */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs text-emerald-400 space-y-1 select-text">
              {terminalHistory.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed break-all ${
                    line.startsWith('root@') || line.startsWith('PS C:')
                      ? 'text-cyan-300 font-bold mt-2'
                      : line.startsWith('[*]') || line.startsWith('[+]')
                      ? 'text-indigo-300'
                      : line.startsWith('[STDERR]') || line.startsWith('[HMHS ERROR]')
                      ? 'text-rose-400'
                      : line.startsWith('+--') || line.startsWith('|')
                      ? 'text-emerald-300 whitespace-pre font-mono'
                      : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              ))}
              {isExecuting && (
                <div className="text-cyan-400 animate-pulse flex items-center gap-2 pt-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>[HMHS Cloud Computer] Executing in kernel sandbox...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Command Input Bar */}
            <form onSubmit={handleFormSubmit} className="p-2 sm:p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs pl-2 shrink-0">
                <span>{activeOS === 'kali' ? 'root@hmhs-maxcloud:~#' : 'PS C:\\HMHS\\Workspace>'}</span>
              </div>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Type bash, python, or powershell command (e.g. nvidia-smi, lscpu, free -h)..."
                disabled={isExecuting}
                className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-xs"
              />
              <button
                type="submit"
                disabled={isExecuting || !commandInput.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold transition flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                <span>Run</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: 10-Agent Live Hardware Pinning & Process Monitor */}
        {activeTab === 'agents' && (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-950 space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white font-mono">10-AGENT HARDWARE CORE BINDINGS (AMD EPYC 256 CORES • 8x H100 SXM5)</h4>
                <p className="text-slate-400 text-[11px]">Each master scientist possesses dedicated L3 cache slices, NVLink memory bus, and cryo-cooled execution threads.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono font-bold text-[10px]">
                10/10 SYNCHRONIZED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AGENT_CORE_PINNINGS.map((agent) => (
                <div key={agent.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center border border-indigo-800">
                        {agent.id}
                      </span>
                      <h5 className="text-xs font-bold text-white font-sans">{agent.name}</h5>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80">
                      {agent.cores}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans">{agent.role}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-indigo-300">{agent.gpu} ({agent.vram})</span>
                    <span className="text-emerald-400">{agent.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: 54 PB Workspace Files & Python Runner */}
        {activeTab === 'files' && (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-950 space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white font-mono">54 PB QUANTUM MATRIX WORKSPACE (/mnt/quantum_store)</h4>
                <p className="text-slate-400 text-[11px]">Real scripts and datasets executed by the 10 AI Agents on the Cloud Computer.</p>
              </div>
              <button
                type="button"
                onClick={() => runCommand('ls -la /mnt/quantum_store')}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold"
              >
                Inspect Storage
              </button>
            </div>

            <div className="space-y-2.5">
              {WORKSPACE_FILES.map((file, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0 font-mono text-xs">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{file.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({file.size})</span>
                        <span className="text-[10px] text-cyan-400/80 font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/80">{file.lang}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{file.desc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('terminal');
                      runCommand(`python3 ${file.name}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-xs font-mono text-cyan-300 hover:text-white transition shrink-0 flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 text-cyan-400" />
                    <span>Run in Kernel</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
