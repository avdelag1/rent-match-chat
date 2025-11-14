#!/bin/bash

# Supabase Migration Viewer Startup Script
# This script starts a local web server and opens the migration viewer in your browser

echo "🗄️  Starting Supabase Migration Viewer..."
echo ""

# Check if a port is already in use
PORT=8080
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is already in use. Trying port 8081..."
    PORT=8081
fi

# Determine which HTTP server to use
if command -v python3 &> /dev/null; then
    echo "📡 Starting Python HTTP server on port $PORT..."
    echo ""
    echo "🌐 Open your browser and navigate to:"
    echo "   http://localhost:$PORT/migration-viewer.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "📡 Starting Python HTTP server on port $PORT..."
    echo ""
    echo "🌐 Open your browser and navigate to:"
    echo "   http://localhost:$PORT/migration-viewer.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer $PORT
elif command -v php &> /dev/null; then
    echo "📡 Starting PHP HTTP server on port $PORT..."
    echo ""
    echo "🌐 Open your browser and navigate to:"
    echo "   http://localhost:$PORT/migration-viewer.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:$PORT
elif command -v npx &> /dev/null; then
    echo "📡 Starting Node HTTP server on port $PORT..."
    echo ""
    echo "🌐 Open your browser and navigate to:"
    echo "   http://localhost:$PORT/migration-viewer.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    npx http-server -p $PORT
else
    echo "❌ Error: No suitable HTTP server found!"
    echo ""
    echo "Please install one of the following:"
    echo "  - Python 3: https://www.python.org/downloads/"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - PHP: https://www.php.net/downloads"
    echo ""
    echo "Or open migration-viewer.html directly in your browser (some features may not work)"
    exit 1
fi
