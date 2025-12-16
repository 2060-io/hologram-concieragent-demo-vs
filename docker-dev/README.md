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

### 2. Update docker-compose.yml

Update the `docker-compose.yml` file with your ngrok domain:

- Replace `your-ngrok-domain.ngrok-free.app` with your actual ngrok domain
- Update `AGENT_PUBLIC_DID` with your ngrok domain
- Update `AGENT_INVITATION_IMAGE_URL` with your ngrok domain
- Update `EVENTS_BASE_URL` with your ngrok domain

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Verify Services

```bash
docker ps
```

You should see:
- `vs-agent` container running on ports 3000 and 3001
- `concieragent-app` container running on port 4001

### 5. Connect with Hologram App

1. Open your browser to `https://your-ngrok-domain.ngrok-free.app/invitation`
2. Scan the QR code with the Hologram app
3. Start chatting with your travel assistant!

## Troubleshooting

- **Containers won't start**: Check that ports 3000, 3001, and 4001 are not already in use
- **ngrok connection issues**: Verify your authtoken is correct in `ngrok-config.yml`
- **API errors**: Ensure all required API keys are set in your `.env` file
