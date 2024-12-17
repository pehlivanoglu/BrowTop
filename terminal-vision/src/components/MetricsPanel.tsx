import React from 'react';
import { SystemMetrics } from '../types/terminal';

const MetricsPanel = ({ metrics }: { metrics: SystemMetrics }) => {
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatGB = (value: number) => `${value.toFixed(1)} GB`;

  return (
    <div className="w-64 border border-terminal-dim rounded-md p-4 h-fit">
      <h2 className="text-lg mb-4 text-terminal-text border-b border-terminal-dim pb-2">System Metrics</h2>
      
      {/* CPU Usage */}
      <div className="mb-4">
        <div className="text-terminal-dim mb-1">CPU Usage</div>
        <div className="flex items-center">
          <div className="flex-1 bg-terminal-dim/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-terminal-text h-full rounded-full"
              style={{ width: `${metrics.cpu}%` }}
            />
          </div>
          <span className="ml-2 text-sm">{formatPercentage(metrics.cpu)}</span>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="mb-4">
        <div className="text-terminal-dim mb-1">Memory Usage</div>
        <div className="flex items-center">
          <div className="flex-1 bg-terminal-dim/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-terminal-text h-full rounded-full"
              style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
            />
          </div>
          <span className="ml-2 text-sm">
            {formatGB(metrics.memory.used)}/{formatGB(metrics.memory.total)}
          </span>
        </div>
      </div>

      {/* Disk Usage */}
      <div className="mb-4">
        <div className="text-terminal-dim mb-1">Disk Usage</div>
        <div className="flex items-center">
          <div className="flex-1 bg-terminal-dim/20 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-terminal-text h-full rounded-full"
              style={{ width: `${(metrics.disk.used / metrics.disk.total) * 100}%` }}
            />
          </div>
          <span className="ml-2 text-sm">
            {formatGB(metrics.disk.used)}/{formatGB(metrics.disk.total)}
          </span>
        </div>
      </div>

      {/* Load Average */}
      <div>
        <div className="text-terminal-dim mb-1">Load Average</div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-terminal-dim text-xs">1min</div>
            <div>{metrics.loadAvg['1min'].toFixed(2)}</div>
          </div>
          <div>
            <div className="text-terminal-dim text-xs">5min</div>
            <div>{metrics.loadAvg['5min'].toFixed(2)}</div>
          </div>
          <div>
            <div className="text-terminal-dim text-xs">15min</div>
            <div>{metrics.loadAvg['15min'].toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;