#!/bin/bash

# Target Blaster Game Startup Script
# Production-ready development server with enhanced features

set -e  # Exit on any error

echo "🎯 TARGET BLASTER - DEVELOPMENT SERVER"
echo "======================================"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Configuration
DEFAULT_PORT=8000
MAX_PORT=8010
BROWSER_AUTO_OPEN=${BROWSER_AUTO_OPEN:-true}

# Check for required files
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found in current directory"
    echo "   Make sure you're running this script from the Target Blaster root directory"
    exit 1
fi

# Function to check if port is available
is_port_available() {
    local port=$1
    if command -v lsof &> /dev/null; then
        ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    elif command -v netstat &> /dev/null; then
        ! netstat -an | grep -q ":$port.*LISTEN"
    else
        # Fallback: assume port is available
        true
    fi
}

# Find available port
PORT=$DEFAULT_PORT
while [ $PORT -le $MAX_PORT ]; do
    if is_port_available $PORT; then
        break
    fi
    echo "⚠️  Port $PORT is in use, trying port $((PORT + 1))..."
    PORT=$((PORT + 1))
done

if [ $PORT -gt $MAX_PORT ]; then
    echo "❌ Error: No available ports found between $DEFAULT_PORT and $MAX_PORT"
    exit 1
fi

# Check for Python
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1)
    if [ "$PYTHON_VERSION" = "3" ]; then
        PYTHON_CMD="python"
    fi
fi

if [ -z "$PYTHON_CMD" ]; then
    echo "❌ Python 3 not found. Please install Python 3 to run the development server."
    echo ""
    echo "Alternative options:"
    echo "1. Install Python 3: https://python.org/downloads"
    echo "2. Open index.html directly in your web browser"
    echo "3. Use any other HTTP server (nginx, Apache, etc.)"
    exit 1
fi

# Display startup information
echo "📊 GAME INFORMATION"
echo "   Version: Production Ready v1.0"
echo "   Type: HTML5 Canvas Arcade Shooter"
echo "   Monetization: Google AdSense Ready"
echo ""
echo "🚀 SERVER CONFIGURATION"
echo "   Python: $($PYTHON_CMD --version)"
echo "   Port: $PORT"
echo "   URL: http://localhost:$PORT"
echo "   Directory: $SCRIPT_DIR"
echo ""
echo "💰 MONETIZATION STATUS"
if grep -q "ca-pub-XXXXXXXXXX" js/ads.js 2>/dev/null; then
    echo "   ⚠️  AdSense: Demo mode (replace publisher ID in js/ads.js)"
else
    echo "   ✅ AdSense: Configured for production"
fi
echo "   📈 Analytics: Ready for integration"
echo "   🎯 Revenue: Banner + Interstitial + Rewarded Video ads"
echo ""

# Create PID file for easy stopping
PID_FILE="$SCRIPT_DIR/.server.pid"
trap 'echo ""; echo "🛑 Stopping Target Blaster server..."; rm -f "$PID_FILE"; exit 0' INT TERM

# Start the server
echo "🎮 STARTING TARGET BLASTER..."
echo "   Press Ctrl+C to stop the server"
echo "   View in browser: http://localhost:$PORT"
echo ""

# Auto-open browser if requested and available
if [ "$BROWSER_AUTO_OPEN" = "true" ]; then
    sleep 1  # Brief delay to let server start
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:$PORT" &
    elif command -v open &> /dev/null; then
        open "http://localhost:$PORT" &
    elif command -v start &> /dev/null; then
        start "http://localhost:$PORT" &
    fi
fi

# Store server PID
echo $$ > "$PID_FILE"

# Start Python HTTP server with better error handling
exec $PYTHON_CMD -m http.server $PORT 2>&1