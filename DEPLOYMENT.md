# 🚀 Concieragent Deployment Guide

This guide explains how to deploy Concieragent for 24/7 availability using the CI/CD pipeline.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [GitHub Repository Setup](#github-repository-setup)
- [CI/CD Workflows](#cicd-workflows)
- [Environment Configuration](#environment-configuration)
- [Deployment Environments](#deployment-environments)
- [Accessing Your Deployment](#accessing-your-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Access
- ✅ GitHub repository access
- ✅ Docker Hub account (for container images)
- ✅ Kubernetes cluster access (via kubeconfig)
- ✅ API keys (OpenAI, SerpAPI, OpenWeatherMap)

### Required Infrastructure
- Kubernetes 1.21+ cluster
- Ingress controller (nginx recommended)
- cert-manager for automatic TLS
- VS Agent chart repository access

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   CI Build   │───▶│  Docker Hub  │───▶│   Deploy     │       │
│  │   & Test     │    │   Registry   │    │   to K8s     │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    demos namespace                       │    │
│  │  ┌─────────────┐         ┌─────────────┐                │    │
│  │  │ Concieragent│◀────────│  VS Agent   │                │    │
│  │  │   (Bot)     │  HTTP   │  (DIDComm)  │                │    │
│  │  │  Port 4001  │         │  Port 3000  │                │    │
│  │  └─────────────┘         └─────────────┘                │    │
│  │        │                        │                        │    │
│  │        │     ┌──────────────────┘                       │    │
│  │        ▼     ▼                                           │    │
│  │  ┌─────────────────────────────────────────────┐        │    │
│  │  │              Ingress (nginx)                 │        │    │
│  │  │  concieragent.domain.com                    │        │    │
│  │  │  concieragent.domain.com/invitation         │        │    │
│  │  └─────────────────────────────────────────────┘        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────┐
                    │   Hologram   │
                    │   Mobile App │
                    └──────────────┘
```

---

## Quick Start

### 1. Fork/Clone the Repository

```bash
git clone https://github.com/your-org/concieragent.git
cd concieragent
```

### 2. Set Up GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `DOCKER_HUB_LOGIN` | Docker Hub username |
| `DOCKER_HUB_PWD` | Docker Hub password/token |
| `KUBECONFIG` | Base64-encoded kubeconfig |
| `OPENAI_API_KEY` | OpenAI API key |
| `SERPAPI_KEY` | SerpAPI key |
| `OPENWEATHER_API_KEY` | OpenWeatherMap key |
| `ANTHROPIC_API_KEY` | (Optional) Anthropic API key |

### 3. Set Up GitHub Variables

Go to **Settings → Secrets and variables → Actions → Variables** and add:

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Production domain | `demos.2060.io` |
| `DOMAIN_DEV` | Development domain (optional) | `dev.demos.2060.io` |

### 4. Create Kubernetes Secrets

Run the **Setup Kubernetes Secrets** workflow:

1. Go to **Actions → Setup Kubernetes Secrets**
2. Click **Run workflow**
3. Select environment and action: `create`

### 5. Push to Deploy

```bash
# For development
git push origin develop

# For production
git push origin main
```

---

## GitHub Repository Setup

### Required Secrets

```bash
# Docker Hub credentials
DOCKER_HUB_LOGIN=your-username
DOCKER_HUB_PWD=your-password-or-token

# Kubernetes access (base64-encoded kubeconfig file)
KUBECONFIG=$(cat ~/.kube/config | base64)

# API Keys
OPENAI_API_KEY=sk-your-openai-key
SERPAPI_KEY=your-serpapi-key
OPENWEATHER_API_KEY=your-openweather-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key  # Optional
```

### Encoding Kubeconfig

```bash
# Linux/macOS
cat ~/.kube/config | base64 -w 0 > kubeconfig-base64.txt

# Use the contents of kubeconfig-base64.txt as the KUBECONFIG secret
```

### GitHub Environments

Create two environments in **Settings → Environments**:

1. **development** - For `develop` branch deployments
2. **production** - For `main` branch deployments

Each environment can have:
- Required reviewers (for production)
- Deployment branch policies
- Environment-specific secrets

---

## CI/CD Workflows

### Continuous Integration (`ci.yml`)

**Triggers:** Pull requests and pushes to `main`/`develop`

**Jobs:**
1. **lint** - TypeScript compilation and type checking
2. **helm-validate** - Helm chart linting and template validation
3. **docker-build** - Docker image build test (no push)
4. **security** - Trivy vulnerability scanning

### Continuous Deployment (`cd.yml`)

**Triggers:** Pushes to `main`/`develop`

**Jobs:**
1. **build** - Build and push Docker image to Docker Hub
2. **helm** - Package and push Helm chart to OCI registry
3. **deploy** - Deploy to Kubernetes using Helm

**Versioning:**
- Uses semantic-release for automatic versioning
- `main` → `latest` tag + version tag
- `develop` → `dev` tag + version tag with `-dev` suffix

### Manual Deploy (`deploy-manual.yml`)

**Triggers:** Manual workflow dispatch

Use for:
- Deploying specific versions
- Rollbacks
- Dry-run testing

### Secrets Setup (`secrets-setup.yml`)

**Triggers:** Manual workflow dispatch

Use for:
- Initial secrets creation
- Key rotation
- Secrets verification

---

## Environment Configuration

### Development Environment

```yaml
# develop branch deploys here
Domain: dev.demos.2060.io
Replicas: 1
Image Tag: dev
```

### Production Environment

```yaml
# main branch deploys here
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

---

## Deployment Environments

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 3. Install MCP server dependencies
for server in flight hotel event geocoder weather finance; do
  cd mcp_travelassistant/servers/${server}_server && uv sync && cd ../../..
done

# 4. Start ngrok (in separate terminal)
ngrok http 3001

# 5. Start bot server
npm run dev

# 6. Start VS Agent
./docker-run.sh your-ngrok-url
```

### Docker Local Testing

```bash
# Build image
npm run docker:build

# Run with environment file
npm run docker:run

# Or with explicit env vars
docker run -p 4001:4001 \
  -e OPENAI_API_KEY=sk-xxx \
  -e SERPAPI_KEY=xxx \
  -e OPENWEATHER_API_KEY=xxx \
  concieragent:local
```

### Kubernetes Deployment

Automatic via GitHub Actions, or manual:

```bash
# Dry run
helm template concieragent ./charts \
  --set global.domain=your-domain.com

# Install
helm upgrade --install concieragent ./charts \
  --namespace demos \
  --create-namespace \
  --set global.domain=your-domain.com \
  --set existingSecret=concieragent-api-keys
```

---

## Accessing Your Deployment

### URLs

After successful deployment:

| URL | Purpose |
|-----|---------|
| `https://concieragent.{domain}/invitation` | QR code for Hologram connection |
| `https://concieragent.{domain}/health` | Health check endpoint |
| `https://concieragent.{domain}/welcome` | Welcome message API |

### Connecting with Hologram

1. Open your browser to `https://concieragent.{domain}/invitation`
2. Open the Hologram app on your phone
3. Scan the QR code
4. Start chatting!

### Checking Deployment Status

```bash
# View pods
kubectl get pods -n demos -l app=concieragent
kubectl get pods -n demos -l app=concieragent-vsa

# View logs
kubectl logs -n demos -l app=concieragent -f
kubectl logs -n demos -l app=concieragent-vsa -f

# View ingress
kubectl get ingress -n demos | grep concieragent

# Describe deployment
kubectl describe statefulset concieragent -n demos
```

---

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

# Re-run secrets setup workflow if needed
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

---

## Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets and Kubernetes Secrets
2. **Rotate API keys regularly** - Use the secrets-setup workflow
3. **Use environment-specific secrets** - Different keys for dev/prod
4. **Enable required reviewers** - For production environment in GitHub
5. **Monitor deployments** - Set up alerts for failed deployments
6. **Use read-only containers** - The Dockerfile creates a non-root user

---

## Support

For issues or questions:

1. Check the [main README](./README.md)
2. Review the [Helm chart README](./charts/README.md)
3. Check GitHub Actions run logs
4. Open an issue in the repository

---

*Built with ❤️ for the Hologram ecosystem*
