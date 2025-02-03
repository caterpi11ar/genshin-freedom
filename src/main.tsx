import { createRoot } from "react-dom/client";
import App from "./App";

import "./index.css";

import "./demos/ipc";
import { ConfigProvider } from "antd";
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

createRoot(document.getElementById("root") as HTMLElement).render(
  <ConfigProvider
    theme={{
      components: {
        Layout: {
          headerBg: '#fff',
          siderBg: "#fff",
        },
      },
    }}
  >
    <App />
  </ConfigProvider>
);

postMessage({ payload: "removeLoading" }, "*");
