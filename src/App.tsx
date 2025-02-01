import { useState } from "react";
import "./App.css";
import { useEffect } from "react";
import LogComponent, { Log } from "./components/Log";
import { useCallback } from "react";
import { IpcRendererEvent } from "electron";

function App() {
  const [uid, setUid] = useState("223607222");
  const [logs, setLogs] = useState<Log[]>([]);

  const handle = async () => {
    if (!uid) return;
    const response = await window.ipcRenderer.invoke("launch", uid);
    console.log(response);
  };

  const handleLogUpdate = useCallback(
    (_e: IpcRendererEvent, message: string) => {
      setLogs((prevLogs) => [...prevLogs, { timestamp: new Date(), message }]);
    },
    []
  );

  useEffect(() => {
    // 监听来自主进程的日志更新
    window.ipcRenderer.on("log-update", handleLogUpdate);

    return () => {
      // 清理监听器
      window.ipcRenderer.off("log-update", handleLogUpdate);
    };
  }, []);

  return (
    <div className="App">
      <h1>Freedom</h1>
      <LogComponent logs={logs} />
      <div className="card">
        <input
          type="text"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          placeholder="输入uid"
        />
        <button onClick={handle}>原神 启动！</button>
      </div>
    </div>
  );
}

export default App;
