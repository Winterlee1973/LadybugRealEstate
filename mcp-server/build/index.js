#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebSocketServer } from 'ws';
import { z } from "zod";
class BrowserConsoleServer {
    consoleLogs = [];
    networkRequests = [];
    wsServer;
    mcpServer;
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