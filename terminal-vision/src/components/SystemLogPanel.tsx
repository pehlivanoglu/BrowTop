import React from 'react';
import { SystemLog } from '../types/terminal';

const SystemLogPanel = ({ info }: { info: SystemLog }) => {
  return (
    <div className="fixed bottom-32 left-32 right-4 flex justify-between items-end">
      {/* Main content container */}
      <div className="flex-grow mr-4">
        {/* System Log Panel */}
        <div className="border border-terminal-dim rounded-t-md p-4 bg-terminal-bg shadow-md h-[300px] overflow-y-auto">
          <h2 className="text-lg mb-4 text-terminal-text border-b border-terminal-dim pb-2">System Logs</h2>
          <div>
            <h3 className="text-terminal-dim mb-2">Recent System Log</h3>
            <div className="text-xs overflow-hidden bg-terminal-bg/50 p-2 rounded">
              {info.systemLog.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right-side container (already present on the page) */}
      <div className="w-[390px]"></div>
    </div>
  );
};

export default SystemLogPanel;
