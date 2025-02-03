import { useState, useCallback, useEffect } from "react";
import { Button, Input, Layout, Space } from "antd";
import LogComponent, { Log } from "./components/Log";
import { IpcRendererEvent } from "electron";
import TaskList from "./components/Task";

const { Header, Sider, Content } = Layout;

const tasks = [
  { label: "领取月卡", value: "auto" },
  { label: "邮件奖励[待开发]", value: "email" },
  { label: "前瞻兑换码[待开发]", value: "code" },
  { label: "执行自定义脚本[待开发]", value: "custom_script" },
];

function App() {
  const [selectedTasks, setSelectedTasks] = useState<string[]>(['auto']);
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);

  const handle = async () => {
    if (!uid || loading) return;
    setLoading(true);
    await window.ipcRenderer.invoke("launch", uid);
    setLoading(false);
  };

  const handleLogUpdate = useCallback(
    (_e: IpcRendererEvent, message: string) => {
      setLogs((prevLogs) => [...prevLogs, message]);
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
    <Layout style={{ width: "100vw" }}>
      <Header>
        <Space.Compact style={{ width: "100%" }}>
          <Button disabled>设置</Button>
          <Input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="输入uid"
          />
          <Button type="primary" onClick={handle}>
            登录
          </Button>
        </Space.Compact>
      </Header>
      <Layout>
        <Sider width={300}>
          <TaskList
            tasks={tasks}
            selectedValues={selectedTasks}
            setSelectedValues={setSelectedTasks}
          />
        </Sider>

        <Content>
          <LogComponent logs={logs} />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
