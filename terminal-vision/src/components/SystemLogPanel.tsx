import React from 'react';

const SystemLogPanel = ({ logs }: { logs: string[] }) => {
  return (
    <div className="flex justify-center items-center">
      {/* Main content container */}
      <div className="flex-grow mr-4">
        {/* System Log Panel */}
        <div className="bg-terminal-bg shadow-md">
          <div>
            <div className="text-base overflow-hidden bg-terminal-bg/50 p-2 rounded">
            {logs.map((log, index) => (
                <div key={index} className="mb-1 border p-2 rounded">{index+1} - {log}<br /></div>
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