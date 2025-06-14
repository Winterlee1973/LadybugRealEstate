# MCP Browser Console & Control Setup

This project includes an integrated MCP (Model Context Protocol) server for capturing browser console logs, network requests, and full Chrome browser automation in real-time.

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

## 📊 Available Features

### Browser Logging
- ✅ Console logs (log, info, warn, error, debug)
- ✅ Network requests (GET, POST, etc. with status codes)
- ✅ JavaScript errors and stack traces
- ✅ Page navigation and load events
- ✅ Real-time data with timestamps and URLs

### Browser Automation & Control
- 🚀 Launch Chrome browser (headless or visible)
- 🌐 Navigate to any URL
- 📸 Take screenshots (full page or viewport)
- 🔍 Extract page content and element data
- ⚡ Execute JavaScript on pages
- 🖱️ Click elements and interact with forms
- ⌨️ Type text into input fields
- 🔧 Full Puppeteer automation capabilities

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

## 🛠️ Available MCP Tools

### Browser Logging Tools
- `get_console_logs` - Retrieve recent console logs with filtering
- `get_network_requests` - Get network requests with status filtering
- `clear_logs` - Clear console or network logs
- `get_server_status` - Check MCP server status and connections

### Browser Control Tools
- `launch_browser` - Launch Chrome (headless or visible)
- `navigate_to` - Navigate to any URL
- `take_screenshot` - Capture page screenshots
- `get_page_content` - Extract HTML content or specific elements
- `execute_javascript` - Run JavaScript code on the page
- `click_element` - Click on page elements
- `type_text` - Type text into input fields
- `close_browser` - Close the browser instance

### Usage Examples

```javascript
// Launch visible Chrome browser
launch_browser({ headless: false, width: 1920, height: 1080 })

// Navigate to your app
navigate_to({ url: "http://localhost:3000", wait_for: "networkidle0" })

// Take a screenshot
take_screenshot({ path: "/tmp/app-screenshot.png", full_page: true })

// Get console errors
get_console_logs({ level: "error", limit: 10 })

// Execute JavaScript and inspect elements
execute_javascript({ code: "document.querySelectorAll('.error').length" })
```

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

## 🔗 Claude Code Integration

**MCP Server Configuration:**
```bash
# Add browser console server to Claude Code
claude mcp add browser-console-server -- node /Users/leecarlin/Documents/LadybugRealEstate/mcp-server/build/index.js

# Verify configuration
claude mcp list
claude mcp get browser-console-server
```

**Available Claude Code Commands:**
Once configured, you can use these tools directly in Claude Code:

- `launch_browser({ headless: false, width: 1920, height: 1080 })` - Launch Chrome
- `navigate_to({ url: "http://localhost:5173", wait_for: "networkidle0" })` - Go to URL
- `take_screenshot({ path: "/tmp/app.png", full_page: true })` - Capture screenshot
- `get_console_logs({ level: "error", limit: 10 })` - Get browser console logs
- `get_network_requests({ status_filter: "4xx", limit: 20 })` - Get failed requests
- `execute_javascript({ code: "console.log('test')" })` - Run JS code
- `click_element({ selector: ".button", wait_for_navigation: true })` - Click elements
- `type_text({ selector: "input[name='email']", text: "test@example.com" })` - Fill forms
- `get_page_content({ selector: ".error-message" })` - Extract content
- `close_browser()` - Close browser

**End-to-End Workflow Example:**
```
1. "Fix the login validation bug"
2. "launch_browser and navigate to localhost:5173" 
3. "click the login button and check console for errors"
4. "take_screenshot to document the issue"
5. Fix the bug in code
6. "refresh browser and verify no console errors"
7. "take_screenshot to confirm fix"
```

**Restart Required:**
After adding the MCP server, restart Claude Code to enable the browser tools.