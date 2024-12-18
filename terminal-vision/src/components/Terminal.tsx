import React, { useRef, useState } from 'react';
import ProcessList from './ProcessList';
import MetricsPanel from './MetricsPanel';
import SystemInfoPanel from './SystemInfoPanel';
import { Process, SortConfig, SystemMetrics, SystemInfo} from '../types/terminal';
import SystemLogPanel from './SystemLogPanel';

const Terminal = () => {
  const GB = 1024 * 1024 * 1024;
  const MB = 1024 * 1024;

  const terminalRef = useRef<HTMLDivElement>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [isButtonToggled, setIsButtonToggled] = useState(true);

  
  const [processes, setProcesses] = useState<Process[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
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

  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    processSummary: {
      total: 0,
      running: 0,
      sleeping: 0,
      stopped: 0,
      zombie: 0,
      idle:0 ,
      other: 0
    },
    currentUsers: [
      { name: 'none', terminal: 'none' },
    ],
    lastUsers: [
      { name: 'none', terminal: 'none' }
    ],
    uptime: '0 days, 0 hours, 0 minutes'
  });

  const serverUrl = 'wss://localhost:8765/ws';
  const ws = new WebSocket(serverUrl);

  ws.onopen = () => {
    console.info('Connected to WebSocket server');
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('stats');
    }
  };

  ws.onerror = (e: Event) => {
    const errorEvent = e as ErrorEvent;
    console.error(`Could not connect to WebSocket server: ${errorEvent.message}`);
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    const messageType = message[0];

    if (messageType === 'stats') {
      updateSystemMetrics(message[1][0]);
      updateProcesses(message[1][1]);
      updateSystemInfo(message[1][2]);
      updateSystemLogs(message[1][3]);
    }
  };

  ws.onclose = () => {
    console.error('Disconnected from WebSocket server');
  };

  const updateSystemLogs = (systemLogs) => {
    setSystemLogs(systemLogs);
  };

  const updateSystemInfo = (systemInfo) => {
    setSystemInfo({
      processSummary: {
        total: systemInfo[0].total_processes,
        running: systemInfo[0].states.running,
        sleeping: systemInfo[0].states.sleeping,
        stopped: systemInfo[0].states.stopped,
        zombie: systemInfo[0].states.zombie,
        idle: systemInfo[0].states.idle,
        other: systemInfo[0].states.other
    },
    currentUsers: systemInfo[1].map((user) => ({
      name: user.name,
      terminal: user.terminal
    })),
    lastUsers: systemInfo[2].map((user) => ({
      name: user.name,
      terminal: user.terminal
    })),
    uptime: systemInfo[3]
    });
  };
  
  const updateProcesses = (processes) => {
    setProcesses(
      processes.map((process) => ({
        user: process.user,
        pid: process.pid,
        cpu: process.cpu,
        memory: process.memory,
        vsz: parseFloat((Number(process.vsz)/MB).toFixed(1)),
        rss: parseFloat((Number(process.rss)/MB).toFixed(1)),
        tty: process.tty,
        stat: process.stat,
        start: process.start,
        time: `${Math.floor(process.time / 60).toString().padStart(2, '0')}:${Math.floor(process.time % 60).toString().padStart(2, '0')}`,        command: process.command.length > 29 ? process.command.substring(0, 29) : process.command
      }))
    );
  };

  const updateSystemMetrics = (systemMetrics) => {
    setMetrics({
      cpu: systemMetrics.cpu,
      memory: {
        used: Number(systemMetrics.memory.used)/GB,
        total: Number(systemMetrics.memory.total)/GB,
      },
      disk: {
        used: Number(systemMetrics.disk.used)/GB,
        total: Number(systemMetrics.disk.total)/GB,
      },
      loadAvg: {
        '1min': systemMetrics.load_avg[0],
        '5min': systemMetrics.load_avg[1],
        '15min': systemMetrics.load_avg[2]
      }
    });
  };

  const getStats = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('stats');
    }
  };

  const handleToggle = () => {
    setIsButtonToggled(!isButtonToggled);
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

  setInterval(getStats, 1000);

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
            <span className="ml-2">
              {isButtonToggled ? 'System Logs - ' : 'Process List - '}
              {new Date().toLocaleString()}
          </span>
            <button
              className="ml-10 px-1 py-1 bg-black border rounded"
              onClick={handleToggle}
            >
              {isButtonToggled ? '[See Process List]' : '[See Last 20 System Logs]'}
            </button>
          </div>
          <div>
            {isButtonToggled ? (
              <SystemLogPanel logs={systemLogs} />
            ) : (
              <ProcessList
                processes={getSortedProcesses()}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            )}
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
}

export default Terminal;