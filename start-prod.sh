#!/bin/bash

echo "🚀 Starting Ladybug Real Estate Development Environment..."

# Load environment variables from .env.local
if [ -f .env.local ]; then
    echo "📋 Loading environment variables from .env.local..."
    set -a  # automatically export all variables
    source .env.local
    set +a  # stop automatically exporting
else
    echo "⚠️  Warning: .env.local file not found!"
fi

# Kill any existing processes on the ports we need
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*build/index.js" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true

# Build and start MCP server in background
echo "📡 Building and starting MCP server..."
cd mcp-server
npm install 2>/dev/null || true
echo "🔨 Building MCP server..."
npm run build
echo "🚀 Starting MCP server..."
npm start &
MCP_PID=$!
cd ..

# Wait a moment for MCP server to start
sleep 2

# Starting and building main development server with environment variables
echo "🏠 Building and starting main development server..."
echo "🔧 Environment check - VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:0:20}..."
npm run build
echo "🏠 Starting main development server..."
npm start &
MAIN_PID=$!

echo "✅ Development environment started!"
echo "📡 MCP Server PID: $MCP_PID"
echo "🏠 Main Server PID: $MAIN_PID"
echo ""
echo "🌐 Open http://localhost:4173 in your browser"
echo "📊 Browser logs will appear in both terminals"
echo ""
echo "To stop everything, press Ctrl+C or run: kill $MCP_PID $MAIN_PID"

# Wait for user to stop
wait