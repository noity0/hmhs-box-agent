export const handler = async (event: any, context: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ram: '512 GB DDR5 ECC Quad-Channel',
      ramUsed: '142.4 GB',
      storage: '54 PB Quantum NVMe ZFS Matrix (120 GB/s)',
      storageUsed: '2.14 PB',
      cpu: '256-Core AMD EPYC 9654 (1024 Virtual Threads, 5.2 GHz Boost)',
      gpu: '8x NVIDIA H100 80GB SXM5 NVLink (640 GB VRAM, 32,000 Tensor TFLOPS)',
      network: '800 Gbps InfiniBand RDMA Quantum-2 (0.05ms latency)',
      cooling: 'Sub-Zero Cryogenic Fluorinert Loop (31°C)',
      osKali: 'Kali Linux Rolling 2026.1 Enterprise',
      osWin: 'Windows 11 Pro Enterprise Workstation',
      status: 'ONLINE',
      connectorsConnected: 2,
    }),
  };
};
