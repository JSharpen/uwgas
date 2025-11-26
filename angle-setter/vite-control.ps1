# Vite Dev Server Control Panel
# Windows 11 - PowerShell script

# === CONFIG ===
$ProjectDir = "C:\Users\jorda\Documents\GitHub\uwgas\angle-setter"
$DevUrl     = "http://localhost:5173"
# =============

$global:ViteProc = $null

function Show-Status {
    if ($global:ViteProc -and -not $global:ViteProc.HasExited) {
        Write-Host "Status: RUNNING (PID $($global:ViteProc.Id))" -ForegroundColor Green
    } else {
        Write-Host "Status: STOPPED" -ForegroundColor Red
        $global:ViteProc = $null
    }
}

function Wait-Enter {
    Write-Host
    Read-Host "Press ENTER to continue" | Out-Null
}

function Start-Vite {
    if ($global:ViteProc -and -not $global:ViteProc.HasExited) {
        Write-Host "Vite dev server is already running (PID $($global:ViteProc.Id))." -ForegroundColor Yellow
        return
    }

    if (-not (Test-Path $ProjectDir)) {
        Write-Host "[ERROR] Project directory not found: $ProjectDir" -ForegroundColor Red
        Wait-Enter
        return
    }

    Set-Location $ProjectDir

    Write-Host "Starting Vite dev server from:" -ForegroundColor Cyan
    Write-Host "  $ProjectDir"
    Write-Host

    # Start `npm run dev` in a separate process and keep the handle
    try {
        $global:ViteProc = Start-Process "npm.cmd" "run dev" `
            -WorkingDirectory $ProjectDir `
            -PassThru

        Start-Sleep -Seconds 2

        Write-Host "Opening browser at $DevUrl ..." -ForegroundColor Cyan
        Start-Process $DevUrl

        Write-Host
        Write-Host "Vite dev server started (PID $($global:ViteProc.Id))." -ForegroundColor Green
        Write-Host "This script will keep running as a controller; close it when you're done."
    }
    catch {
        Write-Host "[ERROR] Failed to start Vite dev server: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Stop-Vite {
    if (-not $global:ViteProc -or $global:ViteProc.HasExited) {
        Write-Host "No tracked Vite dev server process is running." -ForegroundColor Yellow
        $global:ViteProc = $null
        return
    }

    Write-Host "Stopping Vite dev server (PID $($global:ViteProc.Id))..." -ForegroundColor Yellow

    try {
        Stop-Process -Id $global:ViteProc.Id -Force -ErrorAction Stop
        Write-Host "Vite dev server stopped." -ForegroundColor Green
    }
    catch {
        Write-Host "[WARN] Failed to stop tracked process: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    $global:ViteProc = $null
}

function Open-Browser {
    Write-Host "Opening browser at $DevUrl ..." -ForegroundColor Cyan
    Start-Process $DevUrl
}

# ===== Main menu loop =====
while ($true) {
    Clear-Host
    Write-Host "=============================="
    Write-Host "   Vite Dev Server Control"
    Write-Host "=============================="
    Show-Status
    Write-Host
    Write-Host "[1] Start / Restart Vite dev server"
    Write-Host "[2] Stop Vite dev server"
    Write-Host "[3] Open browser only ($DevUrl)"
    Write-Host "[4] Exit (no extra cleanup)"
    Write-Host
    $choice = Read-Host "Select option (1-4)"

    switch ($choice) {
        "1" {
            # Restart semantics: stop if running, then start fresh
            if ($global:ViteProc -and -not $global:ViteProc.HasExited) {
                Stop-Vite
            }
            Start-Vite
            Wait-Enter
        }
        "2" {
            Stop-Vite
            Wait-Enter
        }
        "3" {
            Open-Browser
            Wait-Enter
        }
        "4" {
            # Optional: automatically stop server on exit.
            # Comment this out if you want it to keep running.
            if ($global:ViteProc -and -not $global:ViteProc.HasExited) {
                Write-Host "Stopping Vite before exit..." -ForegroundColor Yellow
                Stop-Vite
            }
            break
        }
        default {
            Write-Host "Invalid selection. Please choose 1-4." -ForegroundColor Yellow
            Start-Sleep -Seconds 1.2
        }
    }
}

Write-Host
Write-Host "Exiting Vite control panel." -ForegroundColor Cyan
