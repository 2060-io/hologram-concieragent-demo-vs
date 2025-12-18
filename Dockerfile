# ═══════════════════════════════════════════════════════════════════════════
# Concieragent Dockerfile
# Multi-stage build for Node.js bot server + Python MCP servers
# ═══════════════════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────────────────
# Stage 1: Node.js Dependencies
# ───────────────────────────────────────────────────────────────────────────
FROM node:24-slim AS node-deps

WORKDIR /app

# Install pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile && \
    pnpm store prune

# ───────────────────────────────────────────────────────────────────────────
# Stage 2: TypeScript Build
# ───────────────────────────────────────────────────────────────────────────
FROM node:24-slim AS node-builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install all deps (including devDependencies)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.json tsconfig.build.json ./
COPY src/ ./src/

# Build TypeScript
RUN pnpm run build

# ───────────────────────────────────────────────────────────────────────────
# Stage 3: Production Runtime
# ───────────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Install Node.js 24.x
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install UV package manager for Python
RUN pip install --no-cache-dir uv

WORKDIR /app

# ───────────────────────────────────────────────────────────────────────────
# Copy Node.js application
# ───────────────────────────────────────────────────────────────────────────
COPY --from=node-deps /app/node_modules ./node_modules
COPY --from=node-builder /app/build ./build
COPY package.json ./

# Copy static assets
COPY assets/ ./assets/

# ───────────────────────────────────────────────────────────────────────────
# Copy and setup Python MCP servers
# ───────────────────────────────────────────────────────────────────────────
COPY mcp_travelassistant/ ./mcp_travelassistant/

# Install Python dependencies for all MCP servers
RUN cd mcp_travelassistant/servers/flight_server && uv sync --frozen && cd ../../.. && \
    cd mcp_travelassistant/servers/hotel_server && uv sync --frozen && cd ../../.. && \
    cd mcp_travelassistant/servers/event_server && uv sync --frozen && cd ../../.. && \
    cd mcp_travelassistant/servers/geocoder_server && uv sync --frozen && cd ../../.. && \
    cd mcp_travelassistant/servers/weather_server && uv sync --frozen && cd ../../.. && \
    cd mcp_travelassistant/servers/finance_server && uv sync --frozen && cd ../../..

# ───────────────────────────────────────────────────────────────────────────
# Copy entrypoint script
# ───────────────────────────────────────────────────────────────────────────
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# ───────────────────────────────────────────────────────────────────────────
# Create non-root user for security
# ───────────────────────────────────────────────────────────────────────────
RUN groupadd -g 1001 concieragent && \
    useradd -m -u 1001 -g concieragent -s /bin/bash concieragent && \
    chown -R concieragent:concieragent /app

USER concieragent

# ───────────────────────────────────────────────────────────────────────────
# Runtime configuration
# ───────────────────────────────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=4001

EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4001/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "build/bot.js"]
