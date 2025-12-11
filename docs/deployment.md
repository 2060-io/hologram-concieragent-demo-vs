# Concieragent API and Deployment Guide

- [Concieragent API and Deployment Guide](#concieragent-api-and-deployment-guide)
  - [Initial Considerations](#initial-considerations)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Environment Configuration](#environment-configuration)
  - [API](#api)
    - [Message Webhook](#message-webhook)
    - [Connection Established](#connection-established)
    - [Welcome Message](#welcome-message)
    - [Health Check](#health-check)
    - [Invitation QR Code](#invitation-qr-code)
    - [Static Assets](#static-assets)
  - [Troubleshooting](#troubleshooting)
  - [Security Best Practices](#security-best-practices)

## Initial Considerations

To deploy the service locally, ensure that the environment variables are configured as follows:

| **Variable**                   | **Description**                                | **Default**                          |
|--------------------------------|------------------------------------------------|--------------------------------------|
| `PORT`                         | The port on which the bot server runs         | `4001`                               |
| `VS_AGENT_URL`                 | Base URL for the VS Agent Admin API           | `http://localhost:3000`              |
| `LLM_PROVIDER`                 | LLM provider to use (`openai`, `claude`, `ollama`) | `openai`                    |
| `OPENAI_API_KEY`               | OpenAI API key (required if using OpenAI)     | -                                    |
| `ANTHROPIC_API_KEY`            | Anthropic API key (required if using Claude)  | -                                    |
| `OLLAMA_BASE_URL`              | Ollama base URL (required if using Ollama)    | `http://localhost:11434`             |
| `SERPAPI_KEY`                  | SerpAPI key for flights, hotels, events        | -                                    |
| `OPENWEATHER_API_KEY`          | OpenWeatherMap API key for weather data        | -                                    |
| `LOG_LEVEL`                    | Logging verbosity level                        | `info`                               |

Once everything is set up correctly, you can start the bot server using:

```bash
npm start
```

For Docker deployment, use the provided Dockerfile or docker-compose configuration.

## Prerequisites

### Required Accounts & Access
- ✅ Docker Hub account (for container images)
- ✅ Kubernetes cluster access (via kubeconfig) - Optional
- ✅ API keys (OpenAI, SerpAPI, OpenWeatherMap)

### Required Infrastructure
- Kubernetes 1.21+ cluster (optional, for K8s deployment)
- Ingress controller (nginx recommended)
- cert-manager for automatic TLS (optional)

## Quick Start

### 1. Fork/Clone the Repository

```bash
git clone https://github.com/your-org/concieragent.git
cd concieragent
```

### 2. Set Up Environment Variables

Create a `.env` file with your API keys:

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Deploy Locally

See the [README.md](../README.md) for local development setup instructions.

### 4. Deploy to Kubernetes

For Kubernetes deployment, use the provided Helm charts:

```bash
helm upgrade --install concieragent ./charts \
  --namespace demos \
  --create-namespace \
  --set global.domain=your-domain.com \
  --set existingSecret=concieragent-api-keys
```

## Environment Configuration

### Development Environment

```yaml
Domain: dev.demos.2060.io
Replicas: 1
Image Tag: dev
```

### Production Environment

```yaml
Domain: demos.2060.io
Replicas: 2
Image Tag: latest
```

### Custom Values

Override Helm values during deployment:

```bash
helm upgrade --install concieragent ./charts \
  --set global.domain=custom.domain.com \
  --set replicas=3 \
  --set env.llmProvider=claude \
  --set resources.limits.memory=4Gi
```

## API

This document outlines the REST API provided by Concieragent for integration with the VS Agent and external services.

Concieragent Bot API consists of a REST-like interface that exposes endpoints to:

- Handle incoming messages from VS Agent
- Manage connection lifecycle
- Provide health checks and status information
- Serve static assets (logo, invitation QR code)

Additionally, the bot integrates with the [2060 VS Agent](https://github.com/2060-io/2060-service-agent) for DIDComm protocol handling. Keep in mind that this connection is mandatory for any chatbot that intends to utilize a DIDComm agent.

### Message Webhook

**Endpoint:** `POST /message-received`

**Description:** Webhook endpoint called by VS Agent when a message is received from a user.

**Request Body:**
```json
{
  "message": {
    "connectionId": "string",
    "content": "string"
  }
}
```

**Response:** `200 OK` (empty body)

**Example:**
```bash
curl -X POST http://localhost:4001/message-received \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "connectionId": "conn-123",
      "content": "What is the weather in Tokyo?"
    }
  }'
```

### Connection Established

**Endpoint:** `POST /connection-established`

**Description:** Handle new connections and send a welcome message to the user.

**Request Body:**
```json
{
  "connectionId": "string",
  "language": "en" | "es" | "fr"
}
```

**Response:**
```json
{
  "success": true,
  "language": "en"
}
```

**Example:**
```bash
curl -X POST http://localhost:4001/connection-established \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "conn-123",
    "language": "es"
  }'
```

### Welcome Message

**Endpoint:** `GET /welcome`

**Description:** Get a localized welcome message without establishing a connection.

**Query Parameters:**
- `lang` (optional): Language code (`en`, `es`, `fr`). Defaults to `en`.

**Response:**
```json
{
  "message": "Welcome to Concieragent!...",
  "language": "en",
  "supportedLanguages": ["en", "es", "fr"]
}
```

**Example:**
```bash
curl http://localhost:4001/welcome?lang=es
```

### Health Check

**Endpoint:** `GET /health`

**Description:** Health check endpoint for monitoring and load balancers.

**Response:**
```json
{
  "status": "ok",
  "service": "concieragent"
}
```

**Example:**
```bash
curl http://localhost:4001/health
```

### Invitation QR Code

**Endpoint:** `GET /invitation`

**Description:** Returns an HTML page with a QR code for connecting via the Hologram mobile app.

**Response:** HTML page with QR code

**Example:**
Open `http://localhost:4001/invitation` in a browser to view the QR code.

### Static Assets

**Endpoint:** `GET /logo.png`

**Description:** Serves the bot logo image.

**Response:** PNG image file

**Example:**
```bash
curl http://localhost:4001/logo.png -o logo.png
```

## Troubleshooting

### Common Issues

#### ❌ Pods not starting

```bash
# Check pod status
kubectl describe pod -n demos -l app=concieragent

# Check for image pull errors
kubectl get events -n demos --sort-by='.lastTimestamp'
```

#### ❌ MCP servers failing

Check the Python MCP servers are starting correctly:

```bash
kubectl logs -n demos -l app=concieragent | grep -i "mcp\|python\|error"
```

#### ❌ VS Agent connection issues

```bash
# Verify VS Agent is running
kubectl get pods -n demos -l app=concieragent-vsa

# Check VS Agent logs
kubectl logs -n demos -l app=concieragent-vsa -f

# Verify internal service connectivity
kubectl exec -n demos -it $(kubectl get pod -n demos -l app=concieragent -o jsonpath='{.items[0].metadata.name}') -- curl http://concieragent-vsa:3000/health
```

#### ❌ Secrets not found

```bash
# Verify secret exists
kubectl get secret concieragent-api-keys -n demos

# Check secret keys
kubectl get secret concieragent-api-keys -n demos -o jsonpath='{.data}' | jq 'keys'

# Create secrets manually if needed
kubectl create secret generic concieragent-api-keys -n demos \
  --from-literal=OPENAI_API_KEY=your-key \
  --from-literal=SERPAPI_KEY=your-key \
  --from-literal=OPENWEATHER_API_KEY=your-key
```

#### ❌ Ingress not working

```bash
# Check ingress status
kubectl describe ingress concieragent -n demos

# Check cert-manager certificates
kubectl get certificates -n demos

# Check nginx ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### Rollback

To rollback to a previous version:

```bash
# List Helm releases
helm history concieragent -n demos

# Rollback to previous revision
helm rollback concieragent -n demos

# Or rollback to specific revision
helm rollback concieragent 3 -n demos
```

### Manual Scaling

```bash
# Scale up
kubectl scale statefulset concieragent -n demos --replicas=3

# Scale down
kubectl scale statefulset concieragent -n demos --replicas=1
```

## Security Best Practices

1. **Never commit secrets** - Use Kubernetes Secrets
2. **Rotate API keys regularly** - Update secrets periodically
3. **Use environment-specific secrets** - Different keys for dev/prod
4. **Monitor deployments** - Set up alerts for failed deployments
5. **Use read-only containers** - The Dockerfile creates a non-root user

---

**Note:** For more information about the VS Agent integration, please refer to the [2060 Service Agent documentation](https://github.com/2060-io/2060-service-agent).
