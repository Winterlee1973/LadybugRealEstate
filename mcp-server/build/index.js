#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebSocketServer } from 'ws';
import { z } from "zod";
import puppeteer from 'puppeteer';
class BrowserConsoleServer {
    consoleLogs = [];
    networkRequests = [];
    wsServer;
    mcpServer;
    browser = null;
    activePage = null;
    constructor() {
        // Create WebSocket server for browser communication
        this.wsServer = new WebSocketServer({ port: 8765 });
        // Create MCP server
        this.mcpServer = new McpServer({
            name: "browser-console-server",
            version: "1.0.0"
        });
        this.setupWebSocketServer();
        this.setupMcpTools();
    }
    setupWebSocketServer() {
        this.wsServer.on('connection', (ws) => {
            console.log('🔗 Browser connected to console logger');
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (message.type === 'console') {
                        const logEntry = {
                            timestamp: new Date().toISOString(),
                            level: message.level,
                            message: message.message,
                            url: message.url,
                            line: message.line,
                            column: message.column
                        };
                        this.consoleLogs.push(logEntry);
                        console.log(`🔍 [CONSOLE ${message.level.toUpperCase()}] ${message.message}`);
                        if (message.url) {
                            console.log(`   📍 URL: ${message.url}`);
                        }
                        // Forward to all connected clients (including local dev server)
                        this.broadcastToClients(message);
                    }
                    else if (message.type === 'network') {
                        const networkEntry = {
                            timestamp: new Date().toISOString(),
                            method: message.method,
                            url: message.url,
                            status: message.status,
                            statusText: message.statusText,
                            responseTime: message.responseTime
                        };
                        this.networkRequests.push(networkEntry);
                        // Color code based on status
                        const statusIcon = message.status >= 400 ? '❌' : message.status >= 300 ? '⚠️' : '✅';
                        console.log(`${statusIcon} [NETWORK] ${message.method} ${message.url} - ${message.status} ${message.statusText} (${message.responseTime}ms)`);
                        // Forward to all connected clients (including local dev server)
                        this.broadcastToClients(message);
                    }
                }
                catch (error) {
                    console.log('❌ Error parsing WebSocket message:', error);
                }
            });
            ws.on('close', () => {
                console.log('🔌 Browser disconnected from console logger');
            });
        });
    }
    broadcastToClients(message) {
        this.wsServer.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                try {
                    client.send(JSON.stringify(message));
                }
                catch (error) {
                    console.log('❌ Error broadcasting to client:', error);
                }
            }
        });
    }
    setupMcpTools() {
        // Tool to get recent console logs
        this.mcpServer.tool("get_console_logs", {
            limit: z.number().min(1).max(1000).optional().describe("Number of recent logs to retrieve (default: 50)"),
            level: z.enum(["log", "info", "warn", "error", "debug"]).optional().describe("Filter by log level")
        }, async ({ limit = 50, level }) => {
            let logs = this.consoleLogs;
            if (level) {
                logs = logs.filter(log => log.level === level);
            }
            const recentLogs = logs.slice(-limit);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(recentLogs, null, 2),
                    },
                ],
            };
        });
        // Tool to get recent network requests
        this.mcpServer.tool("get_network_requests", {
            limit: z.number().min(1).max(1000).optional().describe("Number of recent requests to retrieve (default: 50)"),
            status_filter: z.string().optional().describe("Filter by status code pattern (e.g., '2xx', '4xx', '404')")
        }, async ({ limit = 50, status_filter }) => {
            let requests = this.networkRequests;
            if (status_filter) {
                if (status_filter.endsWith('xx')) {
                    const statusPrefix = status_filter.slice(0, 1);
                    requests = requests.filter(req => req.status.toString().startsWith(statusPrefix));
                }
                else {
                    requests = requests.filter(req => req.status.toString() === status_filter);
                }
            }
            const recentRequests = requests.slice(-limit);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(recentRequests, null, 2),
                    },
                ],
            };
        });
        // Tool to clear logs
        this.mcpServer.tool("clear_logs", {
            type: z.enum(["console", "network", "all"]).describe("Type of logs to clear")
        }, async ({ type }) => {
            if (type === "console" || type === "all") {
                this.consoleLogs = [];
            }
            if (type === "network" || type === "all") {
                this.networkRequests = [];
            }
            return {
                content: [
                    {
                        type: "text",
                        text: `Cleared ${type} logs successfully`,
                    },
                ],
            };
        });
        // Tool to get server status
        this.mcpServer.tool("get_server_status", {}, async () => {
            const status = {
                websocket_port: 8765,
                connected_clients: this.wsServer.clients.size,
                total_console_logs: this.consoleLogs.length,
                total_network_requests: this.networkRequests.length,
                uptime: process.uptime()
            };
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(status, null, 2),
                    },
                ],
            };
        });
        // Tool to launch Chrome browser
        this.mcpServer.tool("launch_browser", {
            headless: z.boolean().optional().describe("Run browser in headless mode (default: false)"),
            width: z.number().optional().describe("Browser window width (default: 1280)"),
            height: z.number().optional().describe("Browser window height (default: 720)")
        }, async ({ headless = false, width = 1280, height = 720 }) => {
            try {
                if (this.browser) {
                    await this.browser.close();
                }
                this.browser = await puppeteer.launch({
                    headless,
                    defaultViewport: { width, height },
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                });
                const pages = await this.browser.pages();
                this.activePage = pages[0] || await this.browser.newPage();
                // Set up console and network monitoring
                this.activePage.on('console', (msg) => {
                    const logEntry = {
                        timestamp: new Date().toISOString(),
                        level: msg.type(),
                        message: msg.text(),
                        url: this.activePage?.url(),
                    };
                    this.consoleLogs.push(logEntry);
                    console.log(`🔍 [BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
                });
                this.activePage.on('response', (response) => {
                    const networkEntry = {
                        timestamp: new Date().toISOString(),
                        method: response.request().method(),
                        url: response.url(),
                        status: response.status(),
                        statusText: response.statusText(),
                    };
                    this.networkRequests.push(networkEntry);
                    const statusIcon = response.status() >= 400 ? '❌' : response.status() >= 300 ? '⚠️' : '✅';
                    console.log(`${statusIcon} [BROWSER] ${response.request().method()} ${response.url()} - ${response.status()}`);
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: `✅ Browser launched successfully (headless: ${headless}, viewport: ${width}x${height})`,
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to launch browser: ${error}`,
                        },
                    ],
                };
            }
        });
        // Tool to navigate to a URL
        this.mcpServer.tool("navigate_to", {
            url: z.string().describe("URL to navigate to"),
            wait_for: z.enum(["load", "domcontentloaded", "networkidle0", "networkidle2"]).optional().describe("Wait condition (default: load)")
        }, async ({ url, wait_for = "load" }) => {
            if (!this.browser || !this.activePage) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ No browser instance available. Use launch_browser first.",
                        },
                    ],
                };
            }
            try {
                await this.activePage.goto(url, { waitUntil: wait_for });
                const title = await this.activePage.title();
                return {
                    content: [
                        {
                            type: "text",
                            text: `✅ Navigated to: ${url}\nPage title: ${title}`,
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to navigate to ${url}: ${error}`,
                        },
                    ],
                };
            }
        });
        // Tool to take a screenshot
        this.mcpServer.tool("take_screenshot", {
            path: z.string().optional().describe("Path to save screenshot (optional)"),
            full_page: z.boolean().optional().describe("Capture full page (default: false)")
        }, async ({ path, full_page = false }) => {
            if (!this.browser || !this.activePage) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ No browser instance available. Use launch_browser first.",
                        },
                    ],
                };
            }
            try {
                const options = { fullPage: full_page };
                if (path) {
                    options.path = path;
                }
                else {
                    options.encoding = 'base64';
                }
                const screenshot = await this.activePage.screenshot(options);
                if (path) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `✅ Screenshot saved to: ${path}`,
                            },
                        ],
                    };
                }
                else {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `✅ Screenshot captured (base64):\ndata:image/png;base64,${screenshot}`,
                            },
                        ],
                    };
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to take screenshot: ${error}`,
                        },
                    ],
                };
            }
        });
        // Tool to get page content/HTML
        this.mcpServer.tool("get_page_content", {
            selector: z.string().optional().describe("CSS selector to get specific element content"),
            attribute: z.string().optional().describe("Get specific attribute value (e.g., 'href', 'src')")
        }, async ({ selector, attribute }) => {
            if (!this.browser || !this.activePage) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ No browser instance available. Use launch_browser first.",
                        },
                    ],
                };
            }
            try {
                let content;
                if (selector) {
                    if (attribute) {
                        content = await this.activePage.$eval(selector, (el, attr) => el.getAttribute(attr) || '', attribute);
                    }
                    else {
                        content = await this.activePage.$eval(selector, el => el.textContent || el.innerHTML);
                    }
                }
                else {
                    content = await this.activePage.content();
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: content,
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to get page content: ${error}`,
                        },
                    ],
                };
            }
        });
        // Tool to execute JavaScript on the page
        this.mcpServer.tool("execute_javascript", {
            code: z.string().describe("JavaScript code to execute"),
            return_result: z.boolean().optional().describe("Return the result of execution (default: true)")
        }, async ({ code, return_result = true }) => {
            if (!this.browser || !this.activePage) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ No browser instance available. Use launch_browser first.",
                        },
                    ],
                };
            }
            try {
                const result = await this.activePage.evaluate(code);
                if (return_result) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `✅ JavaScript executed successfully.\nResult: ${JSON.stringify(result, null, 2)}`,
                            },
                        ],
                    };
                }
                else {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "✅ JavaScript executed successfully.",
                            },
                        ],
                    };
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to execute JavaScript: ${error}`,
                        },
                    ],
                };
            }
        });
        // Tool to close browser
        this.mcpServer.tool("close_browser", {}, async () => {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
                this.activePage = null;
                return {
                    content: [
                        {
                            type: "text",
                            text: "✅ Browser closed successfully.",
                        },
                    ],
                };
            }
            else {
                return {
                    content: [
                        {
                            type: "text",
                            text: "ℹ️ No browser instance to close.",
                        },
                    ],
                };
            }
        });
        // Tool to click on an element
        this.mcpServer.tool("click_element", {
            selector: z.string().describe("CSS selector for the element to click"),
            wait_for_navigation: z.boolean().optional().describe("Wait for navigation after click (default: false)")
        }, async ({ selector, wait_for_navigation = false }) => {
            if (!this.browser || !this.activePage) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ No browser instance available. Use launch_browser first.",
                        },
                    ],
                };
            }
            try {
                if (wait_for_navigation) {
                    await Promise.all([
                        this.activePage.waitForNavigation(),
                        this.activePage.click(selector)
                    ]);
                }
                else {
                    await this.activePage.click(selector);
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: `✅ Clicked element: ${selector}`,
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to click element ${selector}: ${error}`,
                        },
                    ],
                };
            }
        });
        // Tool to type text into an input
        this.mcpServer.tool("type_text", {
            selector: z.string().describe("CSS selector for the input element"),
            text: z.string().describe("Text to type"),
            delay: z.number().optional().describe("Delay between keystrokes in ms (default: 0)")
        }, async ({ selector, text, delay = 0 }) => {
            if (!this.browser || !this.activePage) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "❌ No browser instance available. Use launch_browser first.",
                        },
                    ],
                };
            }
            try {
                await this.activePage.focus(selector);
                await this.activePage.keyboard.type(text, { delay });
                return {
                    content: [
                        {
                            type: "text",
                            text: `✅ Typed text into ${selector}: "${text}"`,
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `❌ Failed to type text into ${selector}: ${error}`,
                        },
                    ],
                };
            }
        });
    }
    async start() {
        const transport = new StdioServerTransport();
        await this.mcpServer.connect(transport);
        console.log('🚀 Browser Console MCP server running on stdio');
        console.log('🌐 WebSocket server listening on port 8765');
    }
}
// Start the server
const server = new BrowserConsoleServer();
server.start().catch(console.error);
//# sourceMappingURL=index.js.map