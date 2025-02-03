import type { FC } from "react";
import { Input } from "antd";

const { TextArea } = Input;

export type Log = string;

interface LogComponentProps {
  logs: Log[];
}

const LogComponent: FC<LogComponentProps> = ({ logs }) => {
  return (
    <TextArea
      defaultValue="logs..."
      value={logs.join("\n")}
      style={{ width: 300, height: 300 }}
    />
  );
};

export default LogComponent;
