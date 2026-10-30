export interface CloudComputerExecutionLog {
  timestamp: string;
  os: 'Kali Linux' | 'Windows 11' | 'HMHS Cloud Core';
  command?: string;
  output: string;
  agentName?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  cloudLogs?: CloudComputerExecutionLog[];
  isCloudComputerActive?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}

export interface CloudComputerSpecs {
  ram: string; // "512 GB DDR5 ECC"
  ramUsed: string; // "142 GB"
  storage: string; // "54 PB ZFS NVMe Matrix"
  storageUsed: string; // "2.1 PB"
  cpu: string; // "256-Core AMD EPYC 9654 Quantum Matrix"
  gpu: string; // "8x NVIDIA H100 80GB SXM5 (640GB VRAM)"
  osKali: string; // "Kali Linux Rolling 2026.1 Enterprise"
  osWin: string; // "Windows 11 Pro Enterprise Workstation"
  network: string; // "800 Gbps InfiniBand Quantum Mesh"
  status: 'ONLINE' | 'EXECUTING' | 'IDLE';
}
