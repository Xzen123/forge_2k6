#!/bin/bash
# ==============================================================================
# Civic Pulse — 1-Click Automated AWS EC2 Free Tier Deployment Script
# Target OS: Ubuntu 22.04 / 24.04 LTS (x86_64 or arm64)
# Free Tier Target: t2.micro or t3.micro (1 vCPU, 1 GB RAM)
# ==============================================================================

set -euo pipefail

echo "============================================================"
echo "🚀 Starting Civic Pulse AWS Free Tier Automated Deployment"
echo "============================================================"

# 1. Configure 4GB Swap Space (Critical for t2.micro/t3.micro 1GB RAM)
if [ ! -f /swapfile ]; then
    echo "⚙️ Creating 4GB swap space to prevent memory exhaustion..."
    sudo fallocate -l 4G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ 4GB swap allocated successfully."
else
    echo "ℹ️ Swap file already exists."
fi

# 2. Update System and Install Core Packages & Docker
echo "📦 Installing Docker, Git, and system utilities..."
sudo apt-get update -y
sudo apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

# Install Docker CE
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER" || true
    echo "✅ Docker installed successfully."
fi

# 3. Clone / Update Repository
APP_DIR="/opt/civic_pulse"
REPO_URL="https://github.com/Xzen123/forge_2k6.git"

if [ -d "$APP_DIR" ]; then
    echo "🔄 Existing repository found at $APP_DIR. Pulling latest code..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
else
    echo "📥 Cloning Civic Pulse from $REPO_URL to $APP_DIR..."
    sudo git clone "$REPO_URL" "$APP_DIR"
    sudo chown -R "$USER:$USER" "$APP_DIR"
    cd "$APP_DIR"
fi

# 4. Prepare Environment Configuration (.env)
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat << 'EOF' > .env
# Environment Configuration for Civic Pulse
ENV=production
LOG_LEVEL=INFO

# Database Configuration (pgvector container)
POSTGRES_USER=civic
POSTGRES_PASSWORD=civic_secure_db_password
POSTGRES_DB=civic_pulse
DATABASE_URL=postgresql+asyncpg://civic:civic_secure_db_password@db:5432/civic_pulse

# Speech and Translation (Sarvam AI)
SARVAM_API_KEY=
SARVAM_API_BASE=https://api.sarvam.ai
SARVAM_TTS_MODEL=bulbul:v3
SARVAM_TRANSLATE_MODEL=mayura:v1
TTS_CACHE_DIR=/tmp/civic_pulse_tts_cache

# AI Models (Gemini / Anthropic)
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Security & CORS
CORS_ORIGINS=["*"]
API_RATE_LIMIT_PER_MINUTE=120
EOF
    echo "⚠️ Please edit $APP_DIR/.env to insert your SARVAM_API_KEY and GEMINI_API_KEY / ANTHROPIC_API_KEY if desired."
fi

# 5. Build and Launch Containers with Docker Compose
echo "🚢 Launching Civic Pulse containers (Frontend, Backend, PostgreSQL pgvector, Proxy, Scheduler)..."
sudo docker compose -f infra/docker-compose.yml down --remove-orphans || true
sudo docker compose -f infra/docker-compose.yml up -d --build

# 6. Display Status and IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://ifconfig.me || echo "<YOUR-EC2-PUBLIC-IP>")

echo "============================================================"
echo "🎉 Civic Pulse is now live!"
echo "============================================================"
echo "🌐 Web Application: http://${PUBLIC_IP}"
echo "📡 Backend API:     http://${PUBLIC_IP}/api or http://${PUBLIC_IP}:8000"
echo "❤️ Health Status:   http://${PUBLIC_IP}/health"
echo ""
echo "To check container logs:"
echo "  sudo docker compose -f infra/docker-compose.yml logs -f"
echo "============================================================"

