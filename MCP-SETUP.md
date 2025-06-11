# MCP Browser Console Setup

This project includes an integrated MCP (Model Context Protocol) server for capturing browser console logs and network requests in real-time.

## 🚀 Quick Start

### Option 1: Start Everything at Once (Recommended)
```bash
npm run dev:full
```
This starts both the MCP server and your main development server automatically.

### Option 2: Start Manually
```bash
# Terminal 1: Start MCP server
npm run mcp:start

# Terminal 2: Start main server
npm start
```

## 📁 Project Structure

```
your-project/
├── mcp-server/          # MCP server for browser logging
│   ├── src/index.ts     # MCP server code
│   ├── package.json     # MCP dependencies
│   └── build/           # Compiled MCP server
├── client/              # Your React app
├── server/              # Your Express server
├── start-dev.sh         # Convenience script
└── package.json         # Main project
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev:full` | Start everything (MCP + main server) |
| `npm run mcp:install` | Install MCP server dependencies |
| `npm run mcp:build` | Build MCP server |
| `npm run mcp:start` | Start MCP server only |
| `npm run mcp:dev` | Start MCP server in watch mode |

## 🌐 How It Works

1. **Browser Spy** 🕵️ - Built into your HTML, captures all browser activity
2. **MCP Server** 📡 - Runs on port 8765, receives and processes browser data
3. **Local Server** 🏠 - Runs on port 3000, receives forwarded data from MCP

```
Browser → MCP Server (8765) → Your Local Server (3000)
```

## 📊 What Gets Logged

- ✅ Console logs (log, info, warn, error, debug)
- ✅ Network requests (GET, POST, etc. with status codes)
- ✅ JavaScript errors and stack traces
- ✅ Page navigation and load events
- ✅ Real-time data with timestamps and URLs

## 🆕 Setting Up on New Computer

1. Clone your repo:
   ```bash
   git clone your-repo
   cd your-project
   ```

2. Install dependencies:
   ```bash
   npm install
   npm run mcp:install
   ```

3. Start development:
   ```bash
   npm run dev:full
   ```

That's it! Everything is now included in your project.

## 🔍 Troubleshooting

**MCP server won't start?**
```bash
npm run mcp:build
npm run mcp:start
```

**No browser logs appearing?**
- Check that MCP server is running on port 8765
- Check browser console for connection errors
- Verify your HTML includes the browser logging script

**Port conflicts?**
- MCP server uses port 8765
- Main server uses port 3000
- Kill existing processes: `pkill -f "node.*build/index.js"`