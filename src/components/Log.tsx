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
      style={{ height: "100%" }}
    />
  );
};

export default LogComponent;
