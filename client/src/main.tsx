import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { startMcp } from "./lib/mcp";

// Initialize MCP in development only
if (import.meta.env.DEV) {
  startMcp();
}

createRoot(document.getElementById("root")!).render(<App />);
