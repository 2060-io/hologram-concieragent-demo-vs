# Development Environment Setup

This directory contains Docker Compose configuration for local development of Concieragent.

## Prerequisites

- Docker and Docker Compose installed
- ngrok account and authtoken (free tier is sufficient)
- API keys configured in `.env` file

## Setup Instructions

### 1. Configure ngrok

Edit `ngrok-config.yml` and add your ngrok authtoken:

```yaml
authtoken: <your ngrok token>
```

Then start ngrok:

```bash
ngrok start --config=ngrok-config.yml --all
```

Note the ngrok URLs that are generated (e.g., `https://xxxxx.ngrok-free.app`).

### 2. Configure Environment Variables

Create a `.env` file in the `docker-dev` directory (or use the parent `.env` file) with the following variables:

```bash
# API Keys
OPENAI_API_KEY=your-openai-key
SERPAPI_KEY=your-serpapi-key
OPENWEATHER_API_KEY=your-openweather-key

# Postgres Database (required for message persistence)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=concieragent
POSTGRES_PORT=5432
```

**⚠️ Important**: Never commit the `.env` file to git. Use environment variables for all sensitive credentials.

### 3. Update docker-compose.yml

Update the `docker-compose.yml` file with your ngrok domain:

- Replace `your-ngrok-domain.ngrok-free.app` with your actual ngrok domain
- Update `AGENT_PUBLIC_DID` with your ngrok domain
- Update `AGENT_INVITATION_IMAGE_URL` with your ngrok domain
- Update `EVENTS_BASE_URL` with your ngrok domain

### 4. Start Services

```bash
docker-compose up -d
```

### 5. Verify Services

```bash
docker ps
```

You should see:
- `vs-agent` container running on ports 3000 and 3001
- `concieragent-app` container running on port 4001
- `concieragent-postgres` container running on port 5432 (or your configured POSTGRES_PORT)

### 6. Connect with Hologram App

1. Open your browser to `https://your-ngrok-domain.ngrok-free.app/invitation`
2. Scan the QR code with the Hologram app
3. Start chatting with your travel assistant!

## Troubleshooting

- **Containers won't start**: Check that ports 3000, 3001, 4001, and 5432 are not already in use
- **ngrok connection issues**: Verify your authtoken is correct in `ngrok-config.yml`
- **API errors**: Ensure all required API keys are set in your `.env` file
- **Database connection errors**: Verify `POSTGRES_PASSWORD` is set in your `.env` file and the postgres container is healthy
- **Message loss**: Ensure the Postgres service is running and accessible. Messages are persisted to prevent loss across service restarts
