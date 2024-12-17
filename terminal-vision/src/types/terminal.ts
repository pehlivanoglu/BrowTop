export interface Process {
  user: string;
  pid: number;
  cpu: string;
  memory: string;
  vsz: number;
  rss: number;
  tty: string;
  stat: string;
  start: string;
  time: string;
  command: string;
}

export type SortConfig = {
  key: keyof Process | null;
  direction: 'asc' | 'desc';
};

export interface SystemMetrics {
  cpu: number;
  memory: {
    used: number;
    total: number;
  };
  disk: {
    used: number;
    total: number;
  };
  loadAvg: {
    '1min': number;
    '5min': number;
    '15min': number;
  };
}

export interface SystemInfo {
  processSummary: {
    total: number;
    running: number;
    sleeping: number;
    stopped: number;
    zombie: number;
  };
  currentUsers: Array<{
    name: string;
    terminal: string;
  }>;
  lastUsers: Array<{
    name: string;
    time: string;
  }>;
  uptime: string;
}

export interface SystemLog {
  systemLog: string[];
}