# ================================================
#  WORKFLOW BUILDER - STATUS CHECK
# ================================================
# Check status of all services
# ================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   WORKFLOW BUILDER - SERVICE STATUS          " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Docker Status:" -ForegroundColor Yellow
try {
    $null = docker ps 2>&1
    if ($?) {
        Write-Host "  ✓ Docker Desktop is running" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Docker Desktop is not running" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Docker Desktop is not running" -ForegroundColor Red
}

Write-Host ""

# Show container status
Write-Host "Container Status:" -ForegroundColor Yellow
Write-Host ""

docker-compose ps

Write-Host ""

# Test service endpoints
Write-Host "Service Health Checks:" -ForegroundColor Yellow
Write-Host ""

# Backend
Write-Host "  Backend API (http://localhost:3001):" -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✓ Healthy" -ForegroundColor Green
    } else {
        Write-Host " ✗ Unhealthy" -ForegroundColor Red
    }
} catch {
    Write-Host " ✗ Not responding" -ForegroundColor Red
}

# Frontend
Write-Host "  Frontend (http://localhost:5173):    " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✓ Healthy" -ForegroundColor Green
    } else {
        Write-Host " ✗ Unhealthy" -ForegroundColor Red
    }
} catch {
    Write-Host " ✗ Not responding" -ForegroundColor Red
}

# n8n
Write-Host "  n8n (http://localhost:5678):         " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✓ Healthy" -ForegroundColor Green
    } else {
        Write-Host " ✗ Unhealthy" -ForegroundColor Red
    }
} catch {
    Write-Host " ✗ Not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Show URLs
Write-Host "Access Points:" -ForegroundColor White
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  API Docs:    http://localhost:3001/api-docs" -ForegroundColor Cyan
Write-Host "  n8n:         http://localhost:5678" -ForegroundColor Cyan
Write-Host ""

