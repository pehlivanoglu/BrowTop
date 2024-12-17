import React, { useRef, useState } from 'react';
import ProcessList from './ProcessList';
import MetricsPanel from './MetricsPanel';
import SystemInfoPanel from './SystemInfoPanel';
import { Process, SortConfig, SystemMetrics, SystemInfo } from '../types/terminal';

const Terminal = () => {
  const GB = 1024 * 1024 * 1024;
  const terminalRef = useRef<HTMLDivElement>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const [processes, setProcesses] = useState<Process[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: {
      used: 0,
      total: 0
    },
    disk: {
      used: 0,
      total: 0
    },
    loadAvg: {
      '1min': 0,
      '5min': 0,
      '15min': 0
    }
  });

  // WebSocket setup
  const server_url = 'wss://localhost:8765/ws';
  const ws = new WebSocket(server_url);

  ws.onopen = () => {
    console.info('Connected to WebSocket server');
  };

  ws.onerror = (e: Event) => {
    const errorEvent = e as ErrorEvent;
    console.error(`Could not connect to WebSocket server: ${errorEvent.message}`);
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    // console.log('Message received from server', message);

    const messageType = message[0];

    if (messageType === 'stats') {
      updateSystemMetrics(message[1][0]);
      updateProcesses(message[1][1]);
      console.log('stats', message[1][1]);
    }
  };

  ws.onclose = () => {
    console.error('Disconnected from WebSocket server');
  };

  const updateProcesses = (newProcesses: Process[]) => {
    setProcesses(
      newProcesses.map((process) => ({
        user: process.user.trim(),
        pid: process.pid,
        cpu: process.cpu,
        memory: process.memory,
        vsz: parseFloat((Number(process.vsz)/1024).toFixed(1)),
        rss: parseFloat((Number(process.rss)/1024).toFixed(1)),
        tty: process.tty.trim(),
        stat: process.stat.trim(),
        start: process.start.trim(),
        time: process.time.trim(),
        command: process.command.length > 29 ? process.command.substring(0, 29) : process.command //process.command.trim()
      }))
    );
  };

  const updateSystemMetrics = (stat) => {
    setMetrics({
      cpu: stat.cpu,
      memory: {
        used: Number(stat.memory.used)/GB,
        total: Number(stat.memory.total)/GB,
      },
      disk: {
        used: Number(stat.disk.used)/GB,
        total: Number(stat.disk.total)/GB,
      },
      loadAvg: {
        '1min': stat.load_avg[0],
        '5min': stat.load_avg[1],
        '15min': stat.load_avg[2]
      }
    });
  };

  const getStats = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('stats');
    }
  };

  const getProcesses = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('ps-aux');
    }
  };

  // Fetch stats every 2 seconds
  setInterval(getStats, 2000);

  // Sample system info (replace with actual data if needed)
  const systemInfo: SystemInfo = {
    processSummary: {
      total: 234,
      running: 2,
      sleeping: 232,
      stopped: 0,
      zombie: 0
    },
    currentUsers: [
      { name: 'root', terminal: 'pts/0' },
      { name: 'user1', terminal: 'pts/1' }
    ],
    lastUsers: [
      { name: 'admin', time: '2024-02-20 15:30' },
      { name: 'user1', time: '2024-02-20 14:25' }
    ],
    uptime: '5 days, 3 hours, 42 minutes'
  };

  

  const handleSort = (key: keyof Process) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedProcesses = () => {
    if (!sortConfig.key) return processes;

    return [...processes].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  return (
    <div className="min-h-screen bg-terminal-bg p-4 font-mono text-terminal-text">
      <div className="max-w-[1400px] mx-auto flex gap-4">
        {/* Process List */}
        <div
          ref={terminalRef}
          className="flex-1 overflow-x-auto"
        >
          <div className="mb-4 flex items-center">
            <span className="animate-pulse">▊</span>
            <span className="ml-2">Process List - {new Date().toLocaleString()}</span>
          </div>
          <div>
            <ProcessList
              processes={getSortedProcesses()}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
        </div>

        {/* Right Side Panels */}
        <div>
          <MetricsPanel metrics={metrics} />
          <SystemInfoPanel info={systemInfo} />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
