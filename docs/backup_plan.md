# 🚨 Civic Pulse — Operational Backup & Emergency Recovery Plan (M9)

This runbook provides step-by-step instructions to restart any failed service and switch external API providers in **under 2 minutes** during a live hackathon demo.

---

## 1. Quick Emergency Service Restarts

### If Running in Docker Compose:
```bash
# Check status of all containers
docker compose -f infra/docker-compose.yml ps

# Restart specific service
docker compose -f infra/docker-compose.yml restart api
docker compose -f infra/docker-compose.yml restart scheduler
docker compose -f infra/docker-compose.yml restart postgres

# Full clean restart
docker compose -f infra/docker-compose.yml down && docker compose -f infra/docker-compose.yml up -d
```

### If Running Locally / Bare Metal:
```powershell
# 1. Restart Backend API (:8000)
Get-Process -Name python* | Stop-Process -Force
uvicorn apps.api.main:app --reload --port 8000

# 2. Restart Ingestion Scheduler
python -m apps.api.scheduler

# 3. Restart Next.js Frontend (:3000)
cd apps/web
npm run dev
```

---

## 2. Switching LLM Providers in Under 2 Minutes

All models and API endpoints are driven entirely by environment variables in `.env` (no hardcoded model names in code):

### Option A: Switch from Claude Sonnet to Claude Haiku (Lower Latency / Emergency Rate Limit)
Edit `.env`:
```ini
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
```
Restart backend API:
```bash
docker compose -f infra/docker-compose.yml restart api
```
*(Total time: ~20 seconds)*

### Option B: Switch Anthropic API Key (Quota Exceeded)
Edit `.env`:
```ini
ANTHROPIC_API_KEY=sk-ant-api03-backup-key-here...
```
Restart backend API:
```bash
docker compose -f infra/docker-compose.yml restart api
```
*(Total time: ~20 seconds)*

---

## 3. Switching Speech / Audio Providers

Speech-to-Text (STT) and Text-to-Speech (TTS) gracefully degrade automatically if the Sarvam AI service fails:
- **STT Failure**: System displays a friendly banner asking the user to type their query in their chosen language.
- **TTS Failure**: System delivers the fully cited text answer and skips audio streaming without crashing.

### To swap Sarvam API Key:
Edit `.env`:
```ini
SARVAM_API_KEY=your_backup_sarvam_key_here
```
Restart API:
```bash
docker compose -f infra/docker-compose.yml restart api
```

---

## 4. Resetting Ingestion Circuit Breakers & DB

If an official government source (e.g., PIB or India Code) encounters temporary rate-limiting, the circuit breaker skips calls for 5 minutes (`INGEST_CIRCUIT_BREAKER_COOLDOWN=300`) to avoid flooding official servers.

### Force Manual Refresh of a Source (via Admin API):
```bash
curl -X POST http://localhost:8000/admin/ingest/myscheme \
  -H "X-Admin-Token: change-me-in-production"
```

### Re-run Database Migrations on Fresh DB:
```bash
alembic upgrade head
```

---

## 5. Live Demo 2-Minute Pre-Flight Check

Run the automated pre-demo verification tool:
```bash
python scripts/pre_demo_check.py
```
If output displays `ALL CHECKS PASSED - READY FOR DEMO`, all endpoints, guardrails, and deterministic rule engines are fully operational.
