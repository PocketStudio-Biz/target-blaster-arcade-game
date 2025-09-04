#!/bin/bash

# Target Blaster Game - Stop Server Script
echo "🛑 Stopping Target Blaster Game Server..."

# Find and kill Python HTTP servers running on common ports
for port in 8000 8001 8002; do
    PID=$(lsof -ti:$port)
    if [ ! -z "$PID" ]; then
        echo "🔍 Found server on port $port (PID: $PID)"
        kill $PID
        echo "✅ Stopped server on port $port"
    fi
done

echo "👋 Target Blaster servers stopped."