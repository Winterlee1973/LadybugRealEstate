#!/usr/bin/env bash
set -e

echo "🚀  Ladybug Real Estate dev stack (development mode)"

# Kill ghost processes (if container is re-used)
pkill -f "node.*mcp-server" 2>/dev/null || true
pkill -f "vite"             2>/dev/null || true

# --- MCP Server -------------------------------------------
pushd mcp-server >/dev/null
npm ci
npm run build
PORT="${MCP_PORT:-9002}" NODE_ENV=development npm start &
MCP_PID=$!
popd >/dev/null

# --- Main App (Dev Mode) ----------------------------------
echo "🛠  Starting main app in dev mode..."
npm ci
PORT="${PORT:-3000}" NODE_ENV=development npm run dev &
MAIN_PID=$!

trap "echo '👋 Stopping'; kill $MCP_PID $MAIN_PID" SIGINT SIGTERM
wait
