# ================================================
#  WORKFLOW BUILDER - RUN ALL SERVICES
# ================================================
# This script starts all services automatically
# ================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   WORKFLOW BUILDER - STARTING ALL SERVICES   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if Docker Desktop is running
function Test-DockerRunning {
    try {
        $null = docker ps 2>&1
        return $?
    } catch {
        return $false
    }
}

# Function to wait for a service to be healthy
function Wait-ForService {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$MaxAttempts = 30
    )
    
    Write-Host "Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ $ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        } catch {
            # Service not ready yet
        }
        
        Write-Host "  Attempt $i/$MaxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
    
    Write-Host "✗ $ServiceName failed to start" -ForegroundColor Red
    return $false
}

# Step 1: Check if Docker Desktop is running
Write-Host "Step 1: Checking Docker Desktop..." -ForegroundColor Yellow
if (Test-DockerRunning) {
    Write-Host "✓ Docker Desktop is running" -ForegroundColor Green
} else {
    Write-Host "✗ Docker Desktop is not running" -ForegroundColor Red
    Write-Host "  Starting Docker Desktop..." -ForegroundColor Yellow
    
    try {
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction Stop
        Write-Host "  Waiting for Docker Desktop to initialize..." -ForegroundColor Yellow
        
        # Wait up to 60 seconds for Docker to start
        $dockerStarted = $false
        for ($i = 1; $i -le 30; $i++) {
            Start-Sleep -Seconds 2
            if (Test-DockerRunning) {
                $dockerStarted = $true
                break
            }
            Write-Host "  Waiting... ($i/30)" -ForegroundColor Gray
        }
        
        if ($dockerStarted) {
            Write-Host "✓ Docker Desktop started successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Docker Desktop failed to start in time" -ForegroundColor Red
            Write-Host "  Please start Docker Desktop manually and run this script again" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "✗ Failed to start Docker Desktop: $_" -ForegroundColor Red
        Write-Host "  Please start Docker Desktop manually and run this script again" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Step 2: Start all services with Docker Compose
Write-Host "Step 2: Starting all services..." -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ All services started successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to start services" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error starting services: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Wait for services to be healthy
Write-Host "Step 3: Waiting for services to be ready..." -ForegroundColor Yellow
Write-Host ""

$servicesReady = $true

# Wait for PostgreSQL (check backend health instead as it depends on DB)
if (-not (Wait-ForService -Url "http://localhost:3001/health" -ServiceName "Backend API")) {
    $servicesReady = $false
}

# Wait for Frontend
if (-not (Wait-ForService -Url "http://localhost:5173" -ServiceName "Frontend")) {
    $servicesReady = $false
}

# Wait for n8n
if (-not (Wait-ForService -Url "http://localhost:5678/healthz" -ServiceName "n8n")) {
    $servicesReady = $false
}

Write-Host ""

if (-not $servicesReady) {
    Write-Host "✗ Some services failed to start properly" -ForegroundColor Red
    Write-Host "  Run 'docker-compose logs' to see error details" -ForegroundColor Yellow
    exit 1
}

# Step 4: Run database migrations (if needed)
Write-Host "Step 4: Checking database..." -ForegroundColor Yellow

try {
    $migrationOutput = docker exec workflow-builder-backend npm run migrate 2>&1
    
    if ($migrationOutput -match "completed successfully" -or $migrationOutput -match "already exist") {
        Write-Host "✓ Database is ready" -ForegroundColor Green
    } else {
        Write-Host "  Database migration output:" -ForegroundColor Gray
        Write-Host $migrationOutput -ForegroundColor Gray
    }
} catch {
    Write-Host "  Note: Could not run migrations (this is OK if already run)" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Show service status
Write-Host "Step 5: Service Status" -ForegroundColor Yellow
Write-Host ""

docker-compose ps

Write-Host ""

# Final summary
Write-Host "================================================" -ForegroundColor Green
Write-Host "   ALL SERVICES ARE RUNNING! ✓               " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application:" -ForegroundColor White
Write-Host ""
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  API Docs:    http://localhost:3001/api-docs" -ForegroundColor Cyan
Write-Host "  n8n:         http://localhost:5678" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Login Credentials:" -ForegroundColor White
Write-Host "  Email:    demo@example.com" -ForegroundColor Yellow
Write-Host "  Password: demo123" -ForegroundColor Yellow
Write-Host ""
Write-Host "n8n Login Credentials:" -ForegroundColor White
Write-Host "  Username: admin" -ForegroundColor Yellow
Write-Host "  Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To stop all services, run: " -NoNewline -ForegroundColor White
Write-Host ".\stop-all.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs, run: " -NoNewline -ForegroundColor White
Write-Host "docker-compose logs -f" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy workflow building! 🚀" -ForegroundColor Magenta
Write-Host ""

