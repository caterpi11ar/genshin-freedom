import type { FC } from "react";

export interface Log {
  timestamp: Date;
  message: string;
}

interface LogComponentProps {
  logs: Log[];
}

const LogComponent: FC<LogComponentProps> = ({ logs }) => {
  if (logs.length === 0) return null
  const formatTimestamp = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-md bg-white">
      <div className="max-h-60 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="text-left text-gray-700">
            <span className="font-mono">{formatTimestamp(log.timestamp)}</span>{" "}
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogComponent;
