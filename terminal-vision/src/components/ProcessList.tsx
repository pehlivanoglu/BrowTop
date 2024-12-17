import React from 'react';
import { Process, SortConfig } from '../types/terminal';

interface ProcessListProps {
  processes: Process[];
  sortConfig: SortConfig;
  onSort: (key: keyof Process) => void;
}

const ProcessList = ({ processes, sortConfig, onSort }: ProcessListProps) => {
  const header = {
    user: "USER",
    pid: "PID",
    cpu: "%CPU",
    memory: "%MEM",
    vsz: "VSZ(MB)",
    rss: "RSS(MB)",
    tty: "TTY",
    stat: "STAT",
    start: "START",
    time: "TIME",
    command: "COMMAND"
  };

  const getSortIndicator = (key: keyof Process) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="whitespace-nowrap">
      {/* Header */}
      <div className="flex text-terminal-dim mb-2">
        <span className="w-32 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('user')}>
          {header.user}{getSortIndicator('user')}
        </span>
        <span className="w-20 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('pid')}>
          {header.pid}{getSortIndicator('pid')}
        </span>
        <span className="w-24 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('cpu')}>
          {header.cpu}{getSortIndicator('cpu')}
        </span>
        <span className="w-24 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('memory')}>
          {header.memory}{getSortIndicator('memory')}
        </span>
        <span className="w-24 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('vsz')}>
          {header.vsz}{getSortIndicator('vsz')}
        </span>
        <span className="w-24 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('rss')}>
          {header.rss}{getSortIndicator('rss')}
        </span>
        <span className="w-12 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('tty')}>
          {header.tty}{getSortIndicator('tty')}
        </span>
        <span className="w-12 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('stat')}>
          {header.stat}{getSortIndicator('stat')}
        </span>
        <span className="w-20 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('start')}>
          {header.start}{getSortIndicator('start')}
        </span>
        <span className="w-20 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('time')}>
          {header.time}{getSortIndicator('time')}
        </span>
        <span className="flex-1 text-center cursor-pointer hover:text-terminal-text" onClick={() => onSort('command')}>
          {header.command}{getSortIndicator('command')}
        </span>
      </div>

      {/* Process rows */}
      {processes.map((process, index) => (
        <div key={index} className="flex hover:bg-terminal-text/10">
          <span className="w-32 text-center">{process.user}</span>
          <span className="w-20 text-center">{process.pid}</span>
          <span className="w-24 text-center">{process.cpu}</span>
          <span className="w-24 text-center">{process.memory}</span>
          <span className="w-24 text-center">{process.vsz}</span>
          <span className="w-24 text-center">{process.rss}</span>
          <span className="w-12 text-center">{process.tty}</span>
          <span className="w-12 text-center">{process.stat}</span>
          <span className="w-20 text-center">{process.start}</span>
          <span className="w-20 text-center">{process.time}</span>
          <span className="flex-1 text-center">{process.command}</span>
        </div>
      ))}
    </div>
  );
};

export default ProcessList;