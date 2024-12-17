import React from 'react';
import { SystemInfo } from '../types/terminal';

const SystemInfoPanel = ({ info }: { info: SystemInfo }) => {
  return (
    <div className="w-64 border border-terminal-dim rounded-md p-4 mt-4">
      <h2 className="text-lg mb-4 text-terminal-text border-b border-terminal-dim pb-2">System Information</h2>
      
      {/* Process Summary */}
      <div className="mb-4">
        <h3 className="text-terminal-dim mb-2">Process Summary</h3>
        <div className="text-sm">
          <div>Total: {info.processSummary.total}</div>
          <div>Running: {info.processSummary.running}</div>
          <div>Sleeping: {info.processSummary.sleeping}</div>
          <div>Stopped: {info.processSummary.stopped}</div>
          <div>Zombie: {info.processSummary.zombie}</div>
        </div>
      </div>

      {/* Current Users */}
      <div className="mb-4">
        <h3 className="text-terminal-dim mb-2">Current Users</h3>
        <div className="text-sm space-y-1">
          {info.currentUsers.map((user, index) => (
            <div key={index}>{user.name} ({user.terminal})</div>
          ))}
        </div>
      </div>

      {/* Last Logged Users */}
      <div className="mb-4">
        <h3 className="text-terminal-dim mb-2">Last 10 Users</h3>
        <div className="text-sm space-y-1">
          {info.lastUsers.map((user, index) => (
            <div key={index}>{user.name} - {user.time}</div>
          ))}
        </div>
      </div>

      {/* System Uptime */}
      <div className="mb-4">
        <h3 className="text-terminal-dim mb-2">System Uptime</h3>
        <div className="text-sm">{info.uptime}</div>
      </div>
    </div>
  );
};

export default SystemInfoPanel;