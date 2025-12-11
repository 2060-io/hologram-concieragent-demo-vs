#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Concieragent Entrypoint Script
# Handles environment variable substitution and startup
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "🚀 Starting Concieragent..."
echo "📋 Environment:"
echo "   NODE_ENV: ${NODE_ENV:-development}"
echo "   PORT: ${PORT:-4001}"
echo "   VS_AGENT_URL: ${VS_AGENT_URL:-http://localhost:3000}"
echo "   LLM_PROVIDER: ${LLM_PROVIDER:-openai}"

# Validate required environment variables
if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ] && [ "$LLM_PROVIDER" != "ollama" ]; then
    echo "⚠️  Warning: No LLM API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY"
fi

if [ -z "$SERPAPI_KEY" ]; then
    echo "⚠️  Warning: SERPAPI_KEY not set. Flight, hotel, event searches will not work."
fi

if [ -z "$OPENWEATHER_API_KEY" ]; then
    echo "⚠️  Warning: OPENWEATHER_API_KEY not set. Weather queries will not work."
fi

echo ""
echo "🤖 Launching Concieragent server..."

# Execute the main command
exec "$@"
