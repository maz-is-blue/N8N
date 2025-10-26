# ================================================
#  WORKFLOW BUILDER - STOP ALL SERVICES
# ================================================
# This script stops all running services
# ================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   WORKFLOW BUILDER - STOPPING ALL SERVICES   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping all services..." -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "   ALL SERVICES STOPPED ✓                     " -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "All containers have been stopped and removed." -ForegroundColor White
        Write-Host ""
        Write-Host "Your data is preserved in Docker volumes." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To start again, run: " -NoNewline -ForegroundColor White
        Write-Host ".\run-all.ps1" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "✗ Failed to stop services" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error stopping services: $_" -ForegroundColor Red
    exit 1
}

