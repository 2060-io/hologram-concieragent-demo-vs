<div align="center">

<img src="./logo.png" alt="Concieragent Logo" width="200"/>

# 🌍 Concieragent

**Your Multilingual AI Travel Concierge for Hologram**

*Orchestrating complex travel planning through MCP (Model Context Protocol) with multi-LLM support*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-8B5CF6?style=for-the-badge)](https://modelcontextprotocol.io/)

[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai)](https://openai.com/)
[![Claude](https://img.shields.io/badge/Anthropic-Claude-D97757?style=flat-square)](https://anthropic.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local-000000?style=flat-square)](https://ollama.ai/)
[![Hologram](https://img.shields.io/badge/Hologram-VS%20Agent-00D4AA?style=flat-square)](https://hologram.zone/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

🇬🇧 English • 🇪🇸 Español • 🇫🇷 Français

[Features](#-features) • [Quick Start](#-quick-start) • [Configuration](#%EF%B8%8F-configuration) • [Architecture](#-architecture) • [API Reference](#-api-reference)

</div>

---

## 🎯 What is Concieragent?

**Concieragent** is a production-ready, multilingual AI travel assistant that runs on the [Hologram](https://hologram.zone) platform. It demonstrates the power of **MCP (Model Context Protocol)** by orchestrating **6 specialized travel planning servers** with your choice of LLM backend.

### ✨ Key Highlights

| Feature | Description |
|---------|-------------|
| 🤖 **Multi-LLM Support** | Switch between OpenAI, Claude, or Ollama |
| 🌍 **Multilingual** | Automatic detection & responses in EN/ES/FR |
| 🛠️ **30 MCP Tools** | Real-time flights, hotels, weather, events, finance |
| 💬 **Context-Aware** | Remembers conversation history & user preferences |
| ⚡ **Smart Truncation** | Handles large API responses gracefully |
| 🔒 **Private & Secure** | End-to-end encrypted via Hologram |

---

## ✨ Features

### 🛫 Comprehensive Travel Planning

<table>
<tr>
<td width="50%">

**✈️ Flights**
- Real-time flight search via SerpAPI
- Filter by price, airline, duration
- Multi-city and round-trip support

**🏨 Hotels**
- Global hotel search with ratings
- Filter by amenities, price, class
- Property details and reviews

**🎭 Events**
- Local events and activities
- Filter by date, type, venue
- Concert, sports, cultural events

</td>
<td width="50%">

**🌤️ Weather**
- Current conditions (OpenWeatherMap)
- 5-day forecasts
- Works worldwide

**📍 Geocoding**
- Location to coordinates
- Distance calculations
- Batch geocoding

**💰 Finance**
- Real-time currency conversion
- Stock lookups
- Market overview

</td>
</tr>
</table>

### 🤖 Multi-LLM Support

Choose your preferred AI backend:

| Provider | Model | Best For |
|----------|-------|----------|
| **OpenAI** | GPT-4o | Production demos, best tool calling |
| **Claude** | Claude Sonnet | Alternative cloud option |
| **Ollama** | Llama 3.1, Mistral | Local/private, no API costs |

### 🌍 Internationalization (i18n)

The bot automatically detects and responds in the user's language:

- 🇬🇧 **English** - Default language
- 🇪🇸 **Spanish** - "Hola, ¿qué tiempo hace en Barcelona?"
- 🇫🇷 **French** - "Bonjour, je cherche un hôtel à Paris"

Language detection happens automatically based on the user's message patterns.

### 🧠 Smart Context Management

- **Conversation Memory** - Remembers destinations, dates, preferences
- **No Repetitive Questions** - Uses context from previous messages
- **Token Management** - Automatic truncation of large responses
- **Rate Limit Handling** - Graceful retry with context trimming

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Purpose | Get It |
|------------|---------|--------|
| Docker | VS Agent container | [Install](https://docker.com) |
| Node.js 18+ | Bot server | [Install](https://nodejs.org) |
| Python 3.12+ | MCP servers | [Install](https://python.org) |
| UV | Python packages | [Install](https://docs.astral.sh/uv/) |
| ngrok | Public URL tunnel | [Get free](https://ngrok.com) |
| Hologram App | Mobile client | [Download](https://hologram.zone) |

### API Keys Needed

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| OpenAI | LLM orchestration | Pay-as-you-go |
| SerpAPI | Flights, hotels, events | 100 searches/mo |
| OpenWeatherMap | Weather data | Unlimited |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/concieragent.git
cd concieragent

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies for all MCP servers
for server in flight hotel event geocoder weather finance; do
  cd mcp_travelassistant/servers/${server}_server && uv sync && cd ../../..
done

# 4. Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### Running

You need **3 terminals**:

```bash
# Terminal 1: Start ngrok
ngrok http 3001
# Note the URL: https://xxxxx.ngrok-free.app

# Terminal 2: Start bot server
npm start
# Wait for: ✅ Travel Agent ready!

# Terminal 3: Start VS Agent
./docker-run.sh xxxxx.ngrok-free.app
```

### Connect & Test

1. Open `http://localhost:3001/invitation`
2. Scan QR code with Hologram app
3. Send: "What's the weather in Tokyo?" 🎉

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# ═══════════════════════════════════════════════════════════════
# LLM PROVIDER CONFIGURATION
# ═══════════════════════════════════════════════════════════════

# Choose: 'openai', 'claude', or 'ollama'
LLM_PROVIDER=openai

# ───────────────────────────────────────────────────────────────
# OpenAI (default)
# ───────────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-your-key-here
# OPENAI_MODEL=gpt-4o  # Optional, defaults to gpt-4o

# ───────────────────────────────────────────────────────────────
# Anthropic Claude
# ───────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-your-key-here
# CLAUDE_MODEL=claude-sonnet-4-20250514  # Optional

# ───────────────────────────────────────────────────────────────
# Ollama (Local - no API key needed)
# ───────────────────────────────────────────────────────────────
# OLLAMA_BASE_URL=http://localhost:11434  # Optional
# OLLAMA_MODEL=llama3.1  # Optional

# ═══════════════════════════════════════════════════════════════
# MCP SERVER API KEYS
# ═══════════════════════════════════════════════════════════════

# SerpAPI - Flights, Hotels, Events, Finance
SERPAPI_KEY=your-serpapi-key-here

# OpenWeatherMap - Weather data
OPENWEATHER_API_KEY=your-openweather-key-here

# ═══════════════════════════════════════════════════════════════
# VS AGENT
# ═══════════════════════════════════════════════════════════════
VS_AGENT_URL=http://localhost:3000
```

### Switching LLM Providers

Simply change `LLM_PROVIDER` in your `.env`:

```bash
# Use Claude instead of OpenAI
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Use local Ollama (free!)
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.1
```

For Ollama, make sure it's running:

```bash
# Install from https://ollama.ai
ollama pull llama3.1
ollama serve
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    📱 Hologram Mobile App                        │
│                    (iPhone / Android)                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │ 🔐 DIDComm (E2E Encrypted)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  🐳 VS Agent (Docker)                            │
│            Protocol Handler • Connection Manager                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP Webhooks
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              🤖 Concieragent Bot Server (Node.js)               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    TravelAgent                             │  │
│  │  • Multi-LLM Provider (OpenAI/Claude/Ollama)              │  │
│  │  • Context Management & Memory                             │  │
│  │  • i18n Language Detection                                 │  │
│  │  • Token Management & Truncation                           │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │ MCP Protocol                        │
│  ┌─────────────────────────▼─────────────────────────────────┐  │
│  │                    McpClient                               │  │
│  │           Spawns & manages Python MCP servers              │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐  ┌──────────▼──────────┐  ┌──────▼──────┐
│ ✈️ Flights   │  │ 🏨 Hotels           │  │ 🎭 Events   │
│ (SerpAPI)   │  │ (SerpAPI)           │  │ (SerpAPI)   │
└─────────────┘  └────────────────────┘  └─────────────┘
       │                     │                     │
┌──────▼──────┐  ┌──────────▼──────────┐  ┌──────▼──────┐
│ 📍 Geocoder  │  │ 🌤️ Weather          │  │ 💰 Finance  │
│ (Nominatim) │  │ (OpenWeatherMap)    │  │ (SerpAPI)   │
└─────────────┘  └────────────────────┘  └─────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Hologram App | Encrypted mobile messaging |
| Protocol | DIDComm | Decentralized identity & encryption |
| Gateway | VS Agent | Protocol handler (Docker) |
| Server | Node.js + TypeScript | Application logic |
| AI | OpenAI / Claude / Ollama | LLM orchestration |
| Tools | MCP Protocol | External service integration |
| Servers | Python 3.12 + FastMCP | 6 specialized MCP servers |

---

## 📡 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/message-received` | Webhook for incoming messages |
| `POST` | `/connection-established` | Handle new connections with welcome |
| `GET` | `/welcome?lang=es` | Get localized welcome message |
| `GET` | `/health` | Health check |
| `GET` | `/invitation` | QR code for Hologram connection |
| `GET` | `/logo.png` | Bot logo |

### MCP Tools Available (30 total)

<details>
<summary><b>✈️ Flight Tools (4)</b></summary>

| Tool | Description |
|------|-------------|
| `search_flights` | Search flights by origin, destination, dates |
| `get_flight_details` | Get detailed info for a specific flight |
| `filter_flights_by_price` | Filter results by max price |
| `filter_flights_by_airline` | Filter results by airline |

</details>

<details>
<summary><b>🏨 Hotel Tools (7)</b></summary>

| Tool | Description |
|------|-------------|
| `search_hotels` | Search hotels by location, dates |
| `get_hotel_details` | Get detailed hotel info |
| `get_property_details` | Extended property information |
| `filter_hotels_by_price` | Filter by price range |
| `filter_hotels_by_rating` | Filter by star rating |
| `filter_hotels_by_amenities` | Filter by amenities |
| `filter_hotels_by_class` | Filter by hotel class |

</details>

<details>
<summary><b>🎭 Event Tools (5)</b></summary>

| Tool | Description |
|------|-------------|
| `search_events` | Search local events |
| `get_event_details` | Get event details |
| `filter_events_by_date` | Filter by date range |
| `filter_events_by_type` | Filter by event type |
| `filter_events_by_venue` | Filter by venue |

</details>

<details>
<summary><b>🌤️ Weather Tools (3)</b></summary>

| Tool | Description |
|------|-------------|
| `get_current_conditions` | Current weather for location |
| `get_weather_forecast` | 5-day weather forecast |
| `get_weather_data_details` | Extended weather data |

</details>

<details>
<summary><b>📍 Geocoder Tools (5)</b></summary>

| Tool | Description |
|------|-------------|
| `geocode_location` | Address to coordinates |
| `reverse_geocode` | Coordinates to address |
| `batch_geocode` | Multiple locations at once |
| `calculate_distance` | Distance between points |
| `search_locations` | Search for places |

</details>

<details>
<summary><b>💰 Finance Tools (6)</b></summary>

| Tool | Description |
|------|-------------|
| `convert_currency` | Real-time currency conversion |
| `lookup_stock` | Stock price lookup |
| `get_market_overview` | Market summary |
| `get_finance_details` | Extended finance data |
| `filter_stocks_by_price_movement` | Filter stocks |
| `get_historical_data` | Historical prices |

</details>

---

## 💬 Usage Examples

### English

```
User: "What's the weather like in Paris this week?"
Bot: 🌤️ Using OpenWeatherMap MCP tool...

     Current weather in Paris, France:
     Temperature: 18°C (feels like 17°C)
     Conditions: Partly cloudy
     Humidity: 65%
     Wind: 12 km/h

     5-Day Forecast:
     - Monday: 19°C, Sunny
     - Tuesday: 17°C, Light rain
     ...
```

### Spanish 🇪🇸

```
User: "Hola, busco vuelos de Madrid a Tokyo para la próxima semana"
Bot: ¡Hola! Voy a buscar vuelos de Madrid a Tokyo...

     ✈️ He encontrado 5 opciones de vuelos:
     
     1. Iberia - $892 USD
        Duración: 14h 30m (1 escala)
        Salida: 10:30 → Llegada: 07:00+1
     ...
```

### French 🇫🇷

```
User: "Bonjour, je cherche un hôtel à Nice pour le week-end prochain"
Bot: Bonjour ! Je recherche des hôtels à Nice...

     🏨 J'ai trouvé 8 hôtels correspondant à vos critères:
     
     1. Hôtel Negresco ⭐⭐⭐⭐⭐
        Prix: 320€/nuit
        Note: 4.8/5 (1,234 avis)
     ...
```

---

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><b>❌ "No MCP tools available"</b></summary>

**Cause:** Python MCP servers failed to start

**Fix:**
```bash
# Check each server can start
cd mcp_travelassistant/servers/flight_server
uv sync
uv run python flight_server.py
# Should show "Processing request..." when working
```
</details>

<details>
<summary><b>❌ Rate limit exceeded (429)</b></summary>

**Cause:** Too many tokens or requests to OpenAI

**Fix:**
- The bot automatically retries with trimmed context
- Wait a few seconds between requests
- Consider using Ollama for unlimited local usage
</details>

<details>
<summary><b>❌ VS Agent won't start</b></summary>

**Fix:**
```bash
# Check Docker is running
docker ps

# Remove old container and restart
docker stop vs-agent && docker rm vs-agent
./docker-run.sh your-ngrok-url
```
</details>

<details>
<summary><b>❌ Weather/flights returning errors</b></summary>

**Cause:** Missing or invalid API keys

**Fix:** Check your `.env` file has valid keys:
```bash
OPENWEATHER_API_KEY=your-key  # Get from openweathermap.org
SERPAPI_KEY=your-key          # Get from serpapi.com
```
</details>

---

## 📁 Project Structure

```
concieragent/
├── 📄 src/
│   ├── bot.ts                    # Express server, webhooks, endpoints
│   ├── agent/
│   │   ├── TravelAgent.ts        # Main orchestration logic
│   │   └── McpClient.ts          # MCP protocol client
│   └── providers/
│       ├── types.ts              # Provider interfaces
│       ├── openai-provider.ts    # OpenAI adapter
│       ├── claude-provider.ts    # Claude adapter
│       ├── ollama-provider.ts    # Ollama adapter
│       └── index.ts              # Provider factory
├── 🐍 mcp_travelassistant/
│   └── servers/
│       ├── flight_server/        # ✈️ Flight search
│       ├── hotel_server/         # 🏨 Hotel search
│       ├── event_server/         # 🎭 Event discovery
│       ├── geocoder_server/      # 📍 Geocoding
│       ├── weather_server/       # 🌤️ Weather
│       └── finance_server/       # 💰 Finance
├── 📜 docker-run.sh              # VS Agent startup
├── 📋 package.json               # Dependencies
├── ⚙️ tsconfig.json              # TypeScript config
└── 📖 README.md                  # You are here!
```

---

## 🛣️ Roadmap

- [x] Multi-LLM support (OpenAI, Claude, Ollama)
- [x] Internationalization (EN, ES, FR)
- [x] Conversation context memory
- [x] Smart token management
- [ ] Live deployment (24/7 availability)
- [ ] CI/CD pipeline
- [ ] Credential/passport verification
- [ ] More languages (DE, IT, PT, JA, ZH)
- [ ] Car rental MCP server
- [ ] Restaurant reservations

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **[Hologram](https://hologram.zone)** - Decentralized messaging platform
- **[Anthropic](https://anthropic.com)** - MCP protocol specification
- **[OpenAI](https://openai.com)** - GPT-4o and function calling
- **[Ollama](https://ollama.ai)** - Local LLM runtime
- **[2060 OÜ](https://2060.io)** - VS Agent infrastructure

---

<div align="center">

**Built with ❤️ for the Hologram ecosystem by Maxime Mansiet**

[⬆️ Back to Top](#-concieragent)

</div>
