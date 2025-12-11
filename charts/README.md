# Concieragent Helm Chart

A Helm chart for deploying Concieragent - the Multilingual AI Travel Concierge for Hologram.

## Prerequisites

- Kubernetes 1.21+
- Helm 3.0+
- PV provisioner support in the underlying infrastructure (for VS Agent wallet persistence)
- Ingress controller (nginx recommended)
- cert-manager (for automatic TLS certificates)

## Installation

### From OCI Registry

```bash
helm install concieragent oci://registry-1.docker.io/io2060/concieragent-chart \
  --namespace demos \
  --create-namespace \
  --set global.domain=your-domain.com \
  --set secrets.openaiApiKey=sk-xxx \
  --set secrets.serpapiKey=xxx \
  --set secrets.openweatherApiKey=xxx
```

### From Local Chart

```bash
cd charts
helm dependency update
helm install concieragent . \
  --namespace demos \
  --create-namespace \
  -f values.yaml
```

## Configuration

### Required Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.domain` | Base domain for ingress | `demos.2060.io` |
| `secrets.openaiApiKey` | OpenAI API key | `""` |
| `secrets.serpapiKey` | SerpAPI key for flights/hotels/events | `""` |
| `secrets.openweatherApiKey` | OpenWeatherMap API key | `""` |

### Optional Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `name` | Application name | `concieragent` |
| `replicas` | Number of replicas | `1` |
| `env.llmProvider` | LLM provider (openai/claude/ollama) | `openai` |
| `secrets.anthropicApiKey` | Anthropic API key (for Claude) | `""` |
| `image.repository` | Docker image repository | `io2060/concieragent` |
| `image.tag` | Docker image tag | Chart appVersion |
| `resources.requests.memory` | Memory request | `512Mi` |
| `resources.limits.memory` | Memory limit | `2Gi` |

### Using Existing Secrets

Instead of providing secrets in values, you can reference an existing Kubernetes secret:

```bash
# Create secret manually
kubectl create secret generic concieragent-api-keys \
  --from-literal=OPENAI_API_KEY=sk-xxx \
  --from-literal=SERPAPI_KEY=xxx \
  --from-literal=OPENWEATHER_API_KEY=xxx

# Reference it in Helm
helm install concieragent . \
  --set existingSecret=concieragent-api-keys
```

## Architecture

The chart deploys:

1. **Concieragent StatefulSet** - Node.js bot server with Python MCP servers
2. **VS Agent** (via dependency) - Handles DIDComm/Hologram protocol
3. **Services** - Internal service discovery
4. **Ingress** - External HTTPS access with automatic TLS

```
Internet → Ingress → VS Agent → Concieragent Bot → MCP Servers
                     (DIDComm)      (Express)       (Python)
```

## Accessing the Service

After deployment:

1. **Invitation URL**: `https://concieragent.<domain>/invitation`
2. **Health Check**: `https://concieragent.<domain>/health`
3. **Welcome API**: `https://concieragent.<domain>/welcome`

## Uninstalling

```bash
helm uninstall concieragent --namespace demos
```

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n demos -l app=concieragent
kubectl logs -n demos -l app=concieragent -f
```

### Check VS Agent
```bash
kubectl get pods -n demos -l app=concieragent-vsa
kubectl logs -n demos -l app=concieragent-vsa -f
```

### Verify Secrets
```bash
kubectl get secrets -n demos | grep concieragent
```
