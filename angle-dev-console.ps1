# ============================================
# ANGLE SETTER DEV CONSOLE (STRICT, HTTP ONLY)
# ============================================

[CmdletBinding()]
param(
    [string]$ProjectDirParam = $env:ANGLE_PROJECT_DIR,
    [int]$PortParam = $(if ($env:ANGLE_PORT) { [int]$env:ANGLE_PORT } else { 0 }),
    [switch]$NoTerminalTab,
    [switch]$NoMenu
)

# === CONFIG ===
$ScriptDir = Split-Path -Parent $PSCommandPath
$FallbackProjectDir = "C:\Users\jorda\Documents\GitHub\uwgas\angle-setter"
$ProjectDir = if ($ProjectDirParam) {
    $ProjectDirParam
} elseif (Test-Path -Path (Join-Path $ScriptDir "package.json")) {
    $ScriptDir
} else {
    $FallbackProjectDir
}

$Port       = if ($PortParam -gt 0) { $PortParam } else { 5173 }
$LogDir     = Join-Path $ProjectDir "logs"
$MasterLogFile = Join-Path $LogDir "master-deploy-check.log"
$DiffDir    = Join-Path $ProjectDir "diffs"
$UseWindowsTerminalTab = $false   # set to $true to prefer Windows Terminal tabs when wt.exe is available
$DevPortWaitSeconds = 25

# Internal state
$global:ViteProc = $null
$global:LastLocalUrl = $null
$global:LastLanUrl  = $null
$global:LastTaskExitCode = $null
$global:LastTaskName = $null
$global:LastTaskOutput = @()
$global:ProjectScriptsCache = $null
$global:DevServerLogFile = $null
$global:DevServerStdOutFile = $null
$global:DevServerStdErrFile = $null

# ============================================
# FUNCTIONS
# ============================================

function Write-LineNumberedOutput {
    param([string[]]$Lines, [string]$Header = "Output (with line numbers)")

    if (-not $Lines -or $Lines.Count -eq 0) { return }

    Write-Host $Header -ForegroundColor DarkYellow
    $idx = 1
    foreach ($line in $Lines) {
        # Prefix each line with a right-aligned number for quick pinpointing.
        Write-Host ("[{0,4}] {1}" -f $idx, $line)
        $idx++
    }
}

function Initialize-Logs {
    try {
        if (-not (Test-Path -Path $LogDir)) {
            New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
        }
    }
    catch {
        Write-Host "[WARN] Could not create log directory: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

function Get-NpmScripts {
    if ($global:ProjectScriptsCache) { return $global:ProjectScriptsCache }
    try {
        $pkg = Get-Content -Path (Join-Path $ProjectDir "package.json") -Raw | ConvertFrom-Json
        if ($pkg -and $pkg.scripts) {
            $global:ProjectScriptsCache = $pkg.scripts
            return $pkg.scripts
        }
    }
    catch {
        Write-Host "[WARN] Could not read package.json scripts: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    $global:ProjectScriptsCache = @{}
    return @{}
}

function Test-NpmScript {
    param([string]$Name)
    $scripts = Get-NpmScripts
    return $scripts.PSObject.Properties.Name -contains $Name
}

# Basic pause helper that can auto-continue
function Wait-ForEnterOrTimeout {
    param(
        [int]$TimeoutSeconds = 5
    )

    $remaining = $TimeoutSeconds
    while ($remaining -gt 0) {
        Write-Host -NoNewline "`rPress ENTER to continue... (auto in $remaining sec) "
        if ([Console]::KeyAvailable) {
            $key = [Console]::ReadKey($true)
            if ($key.Key -eq 'Enter') {
                Write-Host ""
                return
            }
        }
        Start-Sleep -Seconds 1
        $remaining--
    }

    Write-Host "`rContinuing...                         "
}

function Invoke-GitCommand {
    param(
        [string[]]$GitArgs,
        [string]$Description = ""
    )

    if (-not (Test-ProjectDir)) { return $false }

    if ($Description) {
        Write-Host $Description -ForegroundColor Cyan
    }

    try {
        Push-Location $ProjectDir
        & git @GitArgs
        $exitCode = $LASTEXITCODE
        Pop-Location

        if ($exitCode -ne 0) {
            Write-Host "Git command failed (exit $exitCode)." -ForegroundColor Red
            return $false
        }
        return $true
    }
    catch {
        Write-Host "[ERROR] Git command failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-WorkingTreeClean {
    if (-not (Test-ProjectDir)) { return $false }

    $porcelain = & git -C $ProjectDir status --porcelain
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0) {
        Write-Host "[ERROR] git status failed (exit $exitCode)." -ForegroundColor Red
        return $false
    }

    if ($porcelain) {
        Write-Host "Working tree not clean. Commit or stash before deploying." -ForegroundColor Red
        & git -C $ProjectDir status -sb
        return $false
    }

    Write-Host "Working tree clean." -ForegroundColor Green
    return $true
}

function Show-GitStatusShort {
    Invoke-GitCommand -GitArgs @("status", "-sb") -Description "Git status (short):"
}

function Save-GitDiff {
    param(
        [switch]$Staged,
        [string]$Label  # optional label to include in filename
    )

    if (-not (Test-ProjectDir)) { return }
    Initialize-Logs
    if (-not (Test-Path -Path $DiffDir)) {
        New-Item -ItemType Directory -Path $DiffDir -Force | Out-Null
    }

    if ($Staged) {
        $tag = "staged"
        $gitArgs = @("diff", "--cached")
    }
    else {
        $tag = "working"
        $gitArgs = @("diff")
    }

    $stamp = (Get-Date).ToString("yyyyMMddTHHmmss")
    $labelSafe = ($Label -replace '[^a-zA-Z0-9\-]', '')
    $labelPart = ""
    if ($labelSafe) { $labelPart = "-$labelSafe" }
    $fileBase = "diff-$tag-$stamp$labelPart"
    $dest = Join-Path $DiffDir "$fileBase.patch"

    try {
        Push-Location $ProjectDir
        $diff = & git @gitArgs 2>&1
        $exitCode = $LASTEXITCODE
        $stat = & git @($gitArgs + "--stat") 2>&1
        Pop-Location

        if ($exitCode -ne 0) {
            Write-Host "Git diff failed (exit $exitCode)." -ForegroundColor Red
            return
        }

        Set-Content -Path $dest -Value $diff -Encoding UTF8
        if ($stat) {
            Set-Content -Path ($dest + ".stat") -Value $stat -Encoding UTF8
        }

        Write-Host "Saved $tag diff to $dest" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Failed to save diff: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Get-WtPath {
    try {
        $wt = Get-Command wt.exe -ErrorAction Stop
        return $wt.Source
    }
    catch {
        return $null
    }
}

function Get-WindowsPowerShellExe {
    $p = Join-Path $env:WINDIR "System32\\WindowsPowerShell\\v1.0\\powershell.exe"
    if (Test-Path -Path $p) { return $p }

    $cmd = Get-Command powershell.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    return $null
}

function ConvertTo-SingleQuotedString {
    param([string]$Value)
    if ($null -eq $Value) { return "" }
    return ($Value -replace "'", "''")
}

function Start-Work {
    if (-not (Invoke-GitCommand -GitArgs @("switch", "dev") -Description "Switching to dev")) { return }
    if (-not (Invoke-GitCommand -GitArgs @("pull", "origin", "dev") -Description "Pulling origin/dev")) { return }
    Show-GitStatusShort
}

function Complete-Work {
    Show-GitStatusShort
    $message = Read-Host "Commit message (leave blank to cancel)"
    if (-not $message) {
        Write-Host "Commit cancelled (empty message)." -ForegroundColor Yellow
        return
    }

    if (-not (Invoke-GitCommand -GitArgs @("add", ".") -Description "Adding changes")) { return }
    if (-not (Invoke-GitCommand -GitArgs @("commit", "-m", $message) -Description "Committing changes")) { return }
    if (-not (Invoke-GitCommand -GitArgs @("push", "origin", "dev") -Description "Pushing origin/dev")) { return }
    Show-GitStatusShort
}

function Show-RecentCommits {
    Invoke-GitCommand -GitArgs @("log", "--oneline", "--graph", "--decorate", "-n", "15") -Description "Recent commits:"
}

function Save-WipStash {
    Invoke-GitCommand -GitArgs @("stash", "push", "-m", "WIP") -Description "Stashing WIP changes"
}

function Restore-LastStash {
    Invoke-GitCommand -GitArgs @("stash", "pop") -Description "Applying last stash"
}

function Test-ProjectDir {
    if (-not (Test-Path -Path $ProjectDir)) {
        Write-Host "[ERROR] Project directory not found:" -ForegroundColor Red
        Write-Host "  $ProjectDir"
        return $false
    }
    Set-Location -Path $ProjectDir
    return $true
}
function Test-DevPort {
    param(
        [int]$PortParam
    )

    # Silent TCP check to avoid console banners
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $async = $client.BeginConnect('127.0.0.1', $PortParam, $null, $null)
        if (-not $async.AsyncWaitHandle.WaitOne(500)) {
            $client.Close()
            return $false
        }
        $client.EndConnect($async) | Out-Null
        $client.Close()
        return $true
    }
    catch {
        $client.Close()
        return $false
    }
}

function Get-PortOwner {
    param([int]$PortParam)

    try {
        $conn = Get-NetTCPConnection -LocalPort $PortParam -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $conn) { return $null }

        $proc = $null
        if ($conn.OwningProcess) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        }

        return [pscustomobject]@{
            Port = $PortParam
            OwningProcess = $conn.OwningProcess
            ProcessName = $(if ($proc) { $proc.ProcessName } else { $null })
        }
    }
    catch {
        return $null
    }
}

function Wait-DevPort {
    param(
        [int]$PortParam,
        [int]$TimeoutSeconds = 10
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-DevPort -PortParam $PortParam) { return $true }
        Start-Sleep -Milliseconds 250
    }

    return $false
}

function Show-LastDevLog {
    $any = $false

    if ($global:DevServerStdErrFile) {
        $any = $true
        Write-Host "stderr: $($global:DevServerStdErrFile)" -ForegroundColor DarkYellow
        if (Test-Path -Path $global:DevServerStdErrFile) {
            Get-Content -Path $global:DevServerStdErrFile -Tail 80
        }
        else {
            Write-Host "(missing)" -ForegroundColor Yellow
        }
        Write-Host ""
    }

    if ($global:DevServerStdOutFile) {
        $any = $true
        Write-Host "stdout: $($global:DevServerStdOutFile)" -ForegroundColor DarkYellow
        if (Test-Path -Path $global:DevServerStdOutFile) {
            Get-Content -Path $global:DevServerStdOutFile -Tail 80
        }
        else {
            Write-Host "(missing)" -ForegroundColor Yellow
        }
        Write-Host ""
    }

    if (-not $any -and $global:DevServerLogFile) {
        $any = $true
        Write-Host "log: $($global:DevServerLogFile)" -ForegroundColor DarkYellow
        if (Test-Path -Path $global:DevServerLogFile) {
            Get-Content -Path $global:DevServerLogFile -Tail 80
        }
        else {
            Write-Host "(missing)" -ForegroundColor Yellow
        }
    }
}

function Get-Urls {
    param([int]$PortParam)

    # Detect LAN IP
    try {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
            Where-Object {
                $_.IPAddress -ne "127.0.0.1" -and
                $_.IPAddress -notlike "169.254.*"
            } |
            Sort-Object InterfaceMetric |
            Select-Object -First 1 -ExpandProperty IPAddress)
    }
    catch {
        $ip = $null
    }

    if (-not $ip) { $ip = "127.0.0.1" }

    $global:LastLocalUrl = "http://localhost:$PortParam/"
    $global:LastLanUrl   = "http://$($ip):$PortParam/"
}

function Show-Urls {
    Get-Urls -PortParam $Port
    Write-Host "Local: $($global:LastLocalUrl)" -ForegroundColor Cyan
    Write-Host "LAN:   $($global:LastLanUrl)"  -ForegroundColor Cyan
}
function Show-LanQr {
    Get-Urls -PortParam $Port

    if (-not $global:LastLanUrl) {
        Write-Host "[ERROR] LAN URL not available." -ForegroundColor Red
        return
    }

    # Give the QR the whole screen so it doesn't get truncated
    Clear-Host

    Write-Host "$($global:LastLanUrl)" -ForegroundColor Green
    Write-Host ""

    try {
        $npxArgs = "qrcode-terminal $($global:LastLanUrl)"
        Start-Process -FilePath "npx.cmd" `
                      -ArgumentList $npxArgs `
                      -NoNewWindow `
                      -Wait
    }
    catch {
        Write-Host "[ERROR] Failed to run npx/qrcode-terminal: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "You may need to install it manually first:" -ForegroundColor Yellow
        Write-Host "  npm install -g qrcode-terminal"
    }

    Write-Host ""
}

function Show-Status {
    # Refresh URLs silently
    Get-Urls -PortParam $Port

    $procRunning = $false
    if ($global:ViteProc -and -not $global:ViteProc.HasExited) {
        $procRunning = $true
    }

    $portOpen = Test-DevPort -PortParam $Port

    if ($portOpen) {
        # Happy path: keep it minimal and green
        Write-Host "Dev server: OK" -ForegroundColor Green
        return
    }

    # Problem cases — only show details when something is wrong
    if ($procRunning) {
        Write-Host "Dev server: PROCESS RUNNING, PORT NOT REACHABLE" -ForegroundColor Yellow
    }
    else {
        Write-Host "Dev server: NOT RUNNING" -ForegroundColor Red
    }

    if ($global:LastLocalUrl) {
        Write-Host "  Local: $($global:LastLocalUrl)"
    }
    if ($global:LastLanUrl) {
        Write-Host "  LAN:   $($global:LastLanUrl)"
    }
}

function Start-Server {
    if (-not (Test-ProjectDir)) { return }

    if ($global:ViteProc -and -not $global:ViteProc.HasExited) {
        Write-Host "Dev server already running." -ForegroundColor Yellow
        return
    }

    if (-not (Test-NpmScript -Name "dev")) {
        Write-Host "[ERROR] No npm script named 'dev' in package.json." -ForegroundColor Red
        return
    }

    $npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if (-not $npmCmd) { $npmCmd = Get-Command npm -ErrorAction SilentlyContinue }
    if (-not $npmCmd) {
        Write-Host "[ERROR] npm not found on PATH. Install Node.js or fix PATH." -ForegroundColor Red
        return
    }
    $npmPath = $npmCmd.Source

    $portOwner = Get-PortOwner -PortParam $Port
    if ($portOwner) {
        $who = if ($portOwner.ProcessName) { "$($portOwner.ProcessName) (PID $($portOwner.OwningProcess))" } else { "PID $($portOwner.OwningProcess)" }
        Write-Host "[ERROR] Port $Port is already in use by $who." -ForegroundColor Red
        Write-Host "Stop that process, change `$Port, or set ANGLE_PORT to override." -ForegroundColor Yellow
        return
    }

    Get-Urls -PortParam $Port

    Write-Host "Starting Dev Server..." -ForegroundColor Cyan
    Write-Host "  Local: $($global:LastLocalUrl)"
    Write-Host "  LAN:   $($global:LastLanUrl)"
    Write-Host ""

    # --- Launch Vite dev server (HTTP) ---
    $wtPath = if ($UseWindowsTerminalTab) { Get-WtPath } else { $null }
    $spawnedWithWt = $false
    if ($wtPath) {
        try {
            $tabTitle = "Vite Dev ($Port)"
            $psExe = Get-WindowsPowerShellExe
            if (-not $psExe) {
                throw "powershell.exe not found (Windows PowerShell)."
            }

            $projSq = ConvertTo-SingleQuotedString -Value $ProjectDir
            $npmSq = ConvertTo-SingleQuotedString -Value $npmPath
            $cmd = "Set-Location -LiteralPath '$projSq'; & '$npmSq' run dev -- --host --port $Port"
            $wtArgs = @()
            $terminalRunning = Get-Process -Name "WindowsTerminal" -ErrorAction SilentlyContinue
            if ($terminalRunning) {
                $wtArgs += @("-w", "0")
            }
            $wtArgs += @("new-tab", "--title", $tabTitle, "-d", $ProjectDir, $psExe, "-NoLogo", "-NoExit", "-Command", $cmd)
            Write-Host "Launching in Windows Terminal tab: wt $($wtArgs -join ' ')" -ForegroundColor DarkCyan
            Start-Process -FilePath $wtPath -ArgumentList $wtArgs -WorkingDirectory $ProjectDir | Out-Null
            $spawnedWithWt = $true
        }
        catch {
            Write-Host "[WARN] Failed to launch via Windows Terminal, falling back to background process: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    if (-not $spawnedWithWt) {
        try {
            $npmArgs = "run dev -- --host --port $Port"
            Write-Host "Launching: npm $npmArgs" -ForegroundColor DarkCyan

            Initialize-Logs
            $stamp = (Get-Date).ToString("yyyyMMddTHHmmss")
            $global:DevServerStdOutFile = $null
            $global:DevServerStdErrFile = $null
            $global:DevServerLogFile = Join-Path $LogDir "dev-server-$stamp.log"
            if (-not (Test-Path -Path $global:DevServerLogFile)) {
                New-Item -ItemType File -Path $global:DevServerLogFile -Force | Out-Null
            }
            Write-Host "Logging output to: $($global:DevServerLogFile)" -ForegroundColor DarkCyan

            $psExe = Get-WindowsPowerShellExe
            if (-not $psExe) {
                throw "powershell.exe not found (Windows PowerShell)."
            }

            $projSq = ConvertTo-SingleQuotedString -Value $ProjectDir
            $npmSq = ConvertTo-SingleQuotedString -Value $npmPath
            $logSq = ConvertTo-SingleQuotedString -Value $global:DevServerLogFile

            # Run npm via a child PowerShell so we can append ALL streams to one log file (`*>>`) reliably.
            $psCmd = "Set-Location -LiteralPath '$projSq'; & '$npmSq' run dev -- --host --port $Port *>> '$logSq'"

            $global:ViteProc = Start-Process -FilePath $psExe `
                                             -ArgumentList @("-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $psCmd) `
                                             -WorkingDirectory $ProjectDir `
                                             -WindowStyle Hidden `
                                             -PassThru

            if ($global:ViteProc) {
                Write-Host "Dev server started (PID $($global:ViteProc.Id))." -ForegroundColor Green
            }
        }
        catch {
            Write-Host "[ERROR] Failed to start dev server: $($_.Exception.Message)" -ForegroundColor Red
            $global:ViteProc = $null
            return
        }
    }

    $ok = Wait-DevPort -PortParam $Port -TimeoutSeconds $DevPortWaitSeconds
    if (-not $ok) {
        Write-Host "[ERROR] Dev server did not open port $Port within $DevPortWaitSeconds seconds." -ForegroundColor Red
        if ($spawnedWithWt) {
            Write-Host "Tip: re-run with -NoTerminalTab to start in the current window and capture a log." -ForegroundColor Yellow
        }
        if ($global:ViteProc -and $global:ViteProc.HasExited) {
            $exitCode = $null
            try { $exitCode = $global:ViteProc.ExitCode } catch { }
            if ($null -ne $exitCode) {
                Write-Host "Process exited (exit code $exitCode)." -ForegroundColor Red
            }
            else {
                Write-Host "Process exited." -ForegroundColor Red
            }
        }
        Show-LastDevLog
        return
    }

    # If launched via Windows Terminal, try to record the owning process now that the port is open
    if ($spawnedWithWt -and -not $global:ViteProc) {
        try {
            $owner = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess
            if ($owner) {
                $proc = Get-Process -Id $owner -ErrorAction SilentlyContinue
                if ($proc) { $global:ViteProc = $proc }
            }
        }
        catch { }
    }

    # --- Chrome handling with timeout + live countdown + default YES ---
    $chrome = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
    if (-not $chrome) {
        Write-Host "Chrome not running; opening dev URL..." -ForegroundColor Green
        Start-Process -FilePath "chrome.exe" -ArgumentList $global:LastLocalUrl | Out-Null
    } else {
        $timeoutSeconds = 5
        $response = $null

        Write-Host "Chrome is running." -ForegroundColor Yellow
        Write-Host "Open dev URL in new tab? (Y/N)"
        Write-Host "(Auto-default: YES in $timeoutSeconds seconds)"

        for ($i = $timeoutSeconds; $i -gt 0 -and -not $response; $i--) {

            # Countdown tick
            Write-Host -NoNewline "   Waiting: $i sec  `r"

            # Check for keypress without ENTER
            if ([Console]::KeyAvailable) {
                $key = [Console]::ReadKey($true)
                $response = $key.KeyChar
            }

            Start-Sleep -Milliseconds 1000
        }

        Write-Host ""  # clear countdown line

        # Decision logic: Y = yes, N = no, timeout = YES (default)
        if ($response) {
            if ($response -match '^(y|Y)$') {
                Start-Process -FilePath "chrome.exe" -ArgumentList $global:LastLocalUrl | Out-Null
                Write-Host "Opened new Chrome tab." -ForegroundColor Green
            } else {
                Write-Host "No new tab opened ('N')." -ForegroundColor DarkYellow
            }
        } else {
            # Timeout → YES
            Write-Host "Timeout reached; opening tab (default YES)." -ForegroundColor Green
            Start-Process -FilePath "chrome.exe" -ArgumentList $global:LastLocalUrl | Out-Null
        }
    }

    # No explicit return needed — function exits naturally.
    # The menu case for option "1" handles the small delay + auto-redraw.
}

function Stop-Server {
    $stopped = $false

    if ($global:ViteProc -and -not $global:ViteProc.HasExited) {
        try {
            Stop-Process -Id $global:ViteProc.Id -Force
            Write-Host "Server stopped (tracked PID $($global:ViteProc.Id))." -ForegroundColor Green
            $stopped = $true
        }
        catch {
            Write-Host "[WARN] Could not stop tracked server: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    if (-not $stopped) {
        try {
            $owner = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess
            if ($owner) {
                Stop-Process -Id $owner -Force -ErrorAction Stop
                Write-Host "Server stopped (by port scan PID $owner)." -ForegroundColor Green
                $stopped = $true
            }
        }
        catch {
            Write-Host "[WARN] Could not stop server by port scan: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    if (-not $stopped) {
        Write-Host "No server running." -ForegroundColor Yellow
    }

    $global:ViteProc = $null
}

function Restart-Server {
    if ($global:ViteProc -and -not $global:ViteProc.HasExited) {
        Stop-Server
    }
    Start-Server
}

function Open-DevUrl {
    Get-Urls -PortParam $Port
    Start-Process -FilePath "chrome.exe" -ArgumentList $global:LastLocalUrl | Out-Null
}

function Invoke-NpmTask {
    param(
        [string]$TaskName,
        [string]$Description = ""
    )

    if (-not (Test-ProjectDir)) { return $false }

    $global:LastTaskExitCode = $null
    $global:LastTaskOutput = @()
    $global:LastTaskName = $TaskName

    if ($Description) {
        Write-Host $Description -ForegroundColor Cyan
    }

    try {
        Push-Location $ProjectDir
        $global:LastTaskOutput = & npm.cmd run $TaskName 2>&1
        $exitCode = $LASTEXITCODE
        Pop-Location

        $global:LastTaskExitCode = $exitCode

        if ($exitCode -eq 0) {
            Write-Host "Task '$TaskName' succeeded." -ForegroundColor Green
            return $true
        } else {
            Write-Host "Task '$TaskName' FAILED (exit code $exitCode)." -ForegroundColor Red
            if ($TaskName -eq "build") {
                Write-LineNumberedOutput -Lines ($global:LastTaskOutput | ForEach-Object { "$_" }) -Header "Build output (line numbered)"
            }
            return $false
        }
    }
    catch {
        Write-Host "[ERROR] NPM task failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Invoke-Build {
    Invoke-NpmTask -TaskName "build" -Description "Building production bundle..."
}

function Confirm-Deploy {
    param(
        [int]$TimeoutSeconds = 10
    )

    Write-Host "Build succeeded. Type 'deploy' to confirm deploy." -ForegroundColor Cyan
    Write-Host "(No input auto-cancels in $TimeoutSeconds seconds)"

    $buffer = ""
    $confirmed = $false
    for ($i = $TimeoutSeconds; $i -gt 0 -and -not $confirmed; $i--) {
        Write-Host -NoNewline "   Waiting: $i sec  `r"

        if ([Console]::KeyAvailable) {
            $key = [Console]::ReadKey($true)
            switch ($key.Key) {
                "Enter" { 
                    if ($buffer -match '^(?i)deploy$') {
                        $confirmed = $true
                    }
                    break
                }
                "Backspace" {
                    if ($buffer.Length -gt 0) {
                        $buffer = $buffer.Substring(0, $buffer.Length - 1)
                        Write-Host -NoNewline "`b `b"
                    }
                }
                default {
                    $buffer += $key.KeyChar
                    Write-Host -NoNewline $key.KeyChar
                }
            }
        }

        Start-Sleep -Milliseconds 1000
    }

    Write-Host ""  # clear countdown line
    $timedOut = (-not $confirmed -and $i -eq 0)

    return [pscustomobject]@{
        Confirmed = $confirmed
        TimedOut  = $timedOut
    }
}

function Invoke-Deploy {
    Invoke-NpmTask -TaskName "deploy" -Description "Deploying to GitHub Pages..."
}

function Show-CheckSummary {
    param(
        [pscustomobject]$Result,
        [string]$Context = "Checks"
    )

    if (-not $Result) { return }

    $checks = Get-CheckStatuses -Result $Result
    $passedCount = ($checks | Where-Object { $_.Ran -and $_.Passed }).Count
    $ranCount    = ($checks | Where-Object { $_.Ran }).Count

    Write-Host "$Context summary:" -ForegroundColor Cyan
    Write-Host ("Checks run: {0}/{1} passed" -f $passedCount, $ranCount) -ForegroundColor Cyan

    function Write-Status {
        param($Label, $Passed, $Skipped = $false)
        if ($Skipped) {
            Write-Host (" - {0}: SKIP" -f $Label) -ForegroundColor Yellow
        }
        elseif ($Passed) {
            Write-Host (" - {0}: PASS" -f $Label) -ForegroundColor Green
        } else {
            Write-Host (" - {0}: FAIL" -f $Label) -ForegroundColor Red
        }
    }

    foreach ($c in $checks) {
        Write-Status $c.Name $c.Passed -Skipped:(-not $c.Ran)
    }

    $failures = Get-CheckFailures -Result $Result
    if ($failures.Count -gt 0) {
        Write-Host "Failures/details to copy:" -ForegroundColor Yellow
        foreach ($f in $failures) {
            Write-Host " - $f"
        }
    }
}

function Get-CheckFailures {
    param([pscustomobject]$Result)

    $failures = @()
    if (-not $Result) { return $failures }

    if (($Result.PSObject.Properties.Name -contains "Clean") -and (-not $Result.Clean)) {
        $failures += "Clean working tree: FAIL"
    }
    if ($Result.PSObject.Properties.Name -contains "Errors" -and $Result.Errors) {
        $failures += $Result.Errors
    }
    if (($Result.PSObject.Properties.Name -contains "LintOk") -and ($Result.PSObject.Properties.Name -contains "LintRan") -and $Result.LintRan -and (-not $Result.LintOk)) {
        $failures += "Lint failed" + ($(if ($Result.PSObject.Properties.Name -contains "LintExitCode") { " (exit $($Result.LintExitCode))" } else { "" }))
        if ($Result.PSObject.Properties.Name -contains "LintOutput" -and $Result.LintOutput) {
            $failures += "Lint output:"
            $failures += $Result.LintOutput
        }
    }
    if (($Result.PSObject.Properties.Name -contains "TypeOk") -and ($Result.PSObject.Properties.Name -contains "TypeRan") -and $Result.TypeRan -and (-not $Result.TypeOk)) {
        $failures += "Typecheck failed" + ($(if ($Result.PSObject.Properties.Name -contains "TypeExitCode") { " (exit $($Result.TypeExitCode))" } else { "" }))
        if ($Result.PSObject.Properties.Name -contains "TypeOutput" -and $Result.TypeOutput) {
            $failures += "Typecheck output:"
            $failures += $Result.TypeOutput
        }
    }
    if (($Result.PSObject.Properties.Name -contains "TestOk") -and ($Result.PSObject.Properties.Name -contains "TestRan") -and $Result.TestRan -and (-not $Result.TestOk)) {
        $failures += "Tests failed" + ($(if ($Result.PSObject.Properties.Name -contains "TestExitCode") { " (exit $($Result.TestExitCode))" } else { "" }))
        if ($Result.PSObject.Properties.Name -contains "TestOutput" -and $Result.TestOutput) {
            $failures += "Test output:"
            $failures += $Result.TestOutput
        }
    }
    if (($Result.PSObject.Properties.Name -contains "BuildOk") -and ($Result.PSObject.Properties.Name -contains "BuildRan") -and $Result.BuildRan -and (-not $Result.BuildOk)) {
        $failures += "Build failed" + ($(if ($Result.PSObject.Properties.Name -contains "BuildExitCode") { " (exit $($Result.BuildExitCode))" } else { "" }))
        if ($Result.PSObject.Properties.Name -contains "BuildOutput" -and $Result.BuildOutput) {
            $failures += "Build output:"
            $failures += $Result.BuildOutput
        }
    }
    if (($Result.PSObject.Properties.Name -contains "Deployed") -and ($Result.PSObject.Properties.Name -contains "DeployRan") -and $Result.DeployRan -and (-not $Result.Deployed)) {
        $note = ""
        if ($Result.PSObject.Properties.Name -contains "DeployExitCode") {
            $note = " (exit $($Result.DeployExitCode))"
        }
        $failures += "Deploy failed$note"
        if ($Result.PSObject.Properties.Name -contains "DeployOutput" -and $Result.DeployOutput) {
            $failures += "Deploy output:"
            $failures += $Result.DeployOutput
        }
    }

    return $failures
}

function Get-CheckStatuses {
    param([pscustomobject]$Result)

    $checks = @()
    if ($null -ne $Result -and $Result.PSObject.Properties.Name -contains "Clean") {
        $checks += [pscustomobject]@{ Name = "Clean working tree"; Ran = $true; Passed = [bool]$Result.Clean }
    }
    if ($null -ne $Result -and $Result.PSObject.Properties.Name -contains "LintOk") {
        $ran = $true
        if ($Result.PSObject.Properties.Name -contains "LintRan") { $ran = [bool]$Result.LintRan }
        $checks += [pscustomobject]@{ Name = "Lint"; Ran = $ran; Passed = [bool]$Result.LintOk }
    }
    if ($null -ne $Result -and $Result.PSObject.Properties.Name -contains "TypeOk") {
        $ran = $true
        if ($Result.PSObject.Properties.Name -contains "TypeRan") { $ran = [bool]$Result.TypeRan }
        $checks += [pscustomobject]@{ Name = "Typecheck"; Ran = $ran; Passed = [bool]$Result.TypeOk }
    }
    if ($null -ne $Result -and $Result.PSObject.Properties.Name -contains "TestOk") {
        $ran = $true
        if ($Result.PSObject.Properties.Name -contains "TestRan") { $ran = [bool]$Result.TestRan }
        $checks += [pscustomobject]@{ Name = "Tests"; Ran = $ran; Passed = [bool]$Result.TestOk }
    }
    if ($null -ne $Result -and $Result.PSObject.Properties.Name -contains "BuildOk") {
        $ran = $true
        if ($Result.PSObject.Properties.Name -contains "BuildRan") { $ran = [bool]$Result.BuildRan }
        $checks += [pscustomobject]@{ Name = "Build"; Ran = $ran; Passed = [bool]$Result.BuildOk }
    }
    if ($null -ne $Result -and $Result.PSObject.Properties.Name -contains "Confirmed") {
        $ran = ($null -ne $Result.Confirmed)
        if ($Result.PSObject.Properties.Name -contains "TimedOut") { $ran = $ran -or [bool]$Result.TimedOut }
        $checks += [pscustomobject]@{ Name = "User confirm"; Ran = $ran; Passed = [bool]$Result.Confirmed }
    }
    if ($null -ne $Result -and $Result.PSObject.Properties.Name -contains "Deployed") {
        $ran = $false
        if ($Result.PSObject.Properties.Name -contains "DeployRan") { $ran = [bool]$Result.DeployRan }
        $checks += [pscustomobject]@{ Name = "Deploy step"; Ran = $ran; Passed = [bool]$Result.Deployed }
    }
    return $checks
}

function Write-CheckLog {
    param(
        [pscustomobject]$Result,
        [string]$Context = "Checks"
    )

    $fails = Get-CheckFailures -Result $Result
    $checks = Get-CheckStatuses -Result $Result

    $timestamp = (Get-Date).ToString("s")
    $stampName = (Get-Date).ToString("yyyyMMddTHHmmss")
    $contextSafe = $Context.ToLower() -replace '[^a-z0-9\-]', '-'
    $runFile = Join-Path $LogDir ("{0}-{1}.txt" -f $contextSafe, $stampName)

    $status = "passed"
    if ($fails -and $fails.Count -gt 0) {
        $status = "failed"
    }

    $passedCount = ($checks | Where-Object { $_.Ran -and $_.Passed }).Count
    $ranCount    = ($checks | Where-Object { $_.Ran }).Count

    $lines = @("[$timestamp] $Context $status", "Checks run: $passedCount/$ranCount passed")
    if ($checks.Count -gt 0) {
        foreach ($c in $checks) {
            $state = "SKIP"
            if ($c.Ran -and $c.Passed) { $state = "PASS" }
            elseif ($c.Ran -and -not $c.Passed) { $state = "FAIL" }
            $lines += " - $($c.Name): $state"
        }
    }

    if ($fails -and $fails.Count -gt 0) {
        $lines += $fails | ForEach-Object { " - $_" }
    } else {
        $lines += " - No failures."
    }

    try {
        if (-not (Test-Path -Path $LogDir)) {
            New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
        }
        # Per-run file
        Set-Content -Path $runFile -Value $lines -Encoding UTF8
        # Aggregate log
        Add-Content -Path $MasterLogFile -Value $lines -Encoding UTF8
        Write-Host "Logged $Context result to $runFile" -ForegroundColor Yellow
    }
    catch {
        Write-Host "[WARN] Failed to write log: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

function Invoke-DeployPrecheck {
    $result = [pscustomobject]@{
        Clean   = $false
        LintOk  = $false
        BuildOk = $false
        TypeOk  = $false
        TestOk  = $false
        LintRan = $false
        BuildRan = $false
        TypeRan = $false
        TestRan = $false
        LintExitCode  = $null
        BuildExitCode = $null
        TypeExitCode  = $null
        TestExitCode  = $null
        LintOutput    = @()
        BuildOutput   = @()
        TypeOutput    = @()
        TestOutput    = @()
        Errors  = @()
        Paused  = $false
    }

    $result.Clean = Test-WorkingTreeClean
    if (-not $result.Clean) {
        $result.Errors += "Working tree not clean."
    }

    $result.LintOk = Invoke-NpmTask -TaskName "lint" -Description "Running lint..."
    $result.LintRan = $true
    $result.LintExitCode = $global:LastTaskExitCode
    $result.LintOutput    = $global:LastTaskOutput
    if (-not $result.LintOk) {
        $result.Errors += "Lint failed."
    }

    if (Test-NpmScript -Name "typecheck") {
        $result.TypeOk = Invoke-NpmTask -TaskName "typecheck" -Description "Running typecheck..."
        $result.TypeRan = $true
        $result.TypeExitCode = $global:LastTaskExitCode
        $result.TypeOutput    = $global:LastTaskOutput
        if (-not $result.TypeOk) {
            $result.Errors += "Typecheck failed."
        }
    }

    if (Test-NpmScript -Name "test") {
        $result.TestOk = Invoke-NpmTask -TaskName "test" -Description "Running tests..."
        $result.TestRan = $true
        $result.TestExitCode = $global:LastTaskExitCode
        $result.TestOutput    = $global:LastTaskOutput
        if (-not $result.TestOk) {
            $result.Errors += "Tests failed."
        }
    }

    $result.BuildOk = Invoke-Build
    $result.BuildRan = $true
    $result.BuildExitCode = $global:LastTaskExitCode
    $result.BuildOutput    = $global:LastTaskOutput
    if (-not $result.BuildOk) {
        $result.Errors += "Build failed."
    }

    $allPass = $result.Clean -and $result.LintOk -and $result.BuildOk `
        -and ((-not $result.TypeRan) -or $result.TypeOk) `
        -and ((-not $result.TestRan) -or $result.TestOk)

    if ($allPass) {
        Write-Host "Precheck succeeded: all checks passed. Ready to deploy." -ForegroundColor Green
    } else {
        Write-Host "Precheck completed with failures. See details above." -ForegroundColor Yellow
    }
    return $result
}

function Invoke-DeployProtocol {
    $result = [pscustomobject]@{
        Clean     = $false
        LintOk    = $false
        BuildOk   = $false
        TypeOk    = $false
        TestOk    = $false
        LintRan   = $false
        BuildRan  = $false
        TypeRan   = $false
        TestRan   = $false
        Confirmed = $false
        TimedOut  = $false
        Deployed  = $false
        Paused    = $false
        DeployRan = $false
        LintExitCode   = $null
        BuildExitCode  = $null
        DeployExitCode = $null
        TypeExitCode   = $null
        TestExitCode   = $null
        LintOutput     = @()
        BuildOutput    = @()
        DeployOutput   = @()
        TypeOutput     = @()
        TestOutput     = @()
        Errors   = @()
    }

    $result.Clean = Test-WorkingTreeClean
    if (-not $result.Clean) {
        $result.Errors += "Working tree not clean."
    }

    $result.LintOk = Invoke-NpmTask -TaskName "lint" -Description "Running lint..."
    $result.LintRan = $true
    $result.LintExitCode = $global:LastTaskExitCode
    $result.LintOutput    = $global:LastTaskOutput
    if (-not $result.LintOk) {
        $result.Errors += "Lint failed."
    }

    if (Test-NpmScript -Name "typecheck") {
        $result.TypeOk = Invoke-NpmTask -TaskName "typecheck" -Description "Running typecheck..."
        $result.TypeRan = $true
        $result.TypeExitCode = $global:LastTaskExitCode
        $result.TypeOutput    = $global:LastTaskOutput
        if (-not $result.TypeOk) {
            $result.Errors += "Typecheck failed."
        }
    }

    if (Test-NpmScript -Name "test") {
        $result.TestOk = Invoke-NpmTask -TaskName "test" -Description "Running tests..."
        $result.TestRan = $true
        $result.TestExitCode = $global:LastTaskExitCode
        $result.TestOutput    = $global:LastTaskOutput
        if (-not $result.TestOk) {
            $result.Errors += "Tests failed."
        }
    }

    $result.BuildOk = Invoke-Build
    $result.BuildRan = $true
    $result.BuildExitCode = $global:LastTaskExitCode
    $result.BuildOutput    = $global:LastTaskOutput
    if (-not $result.BuildOk) {
        $result.Errors += "Build failed."
    }

    # Only prompt/deploy if prior gates passed
    $allPass = $result.Clean -and $result.LintOk -and $result.BuildOk `
        -and ((-not $result.TypeRan) -or $result.TypeOk) `
        -and ((-not $result.TestRan) -or $result.TestOk)

    if ($allPass) {
        $confirmResult = Confirm-Deploy
        $result.TimedOut  = $confirmResult.TimedOut
        $result.Confirmed = $confirmResult.Confirmed

        if (-not $confirmResult.Confirmed) {
            if ($confirmResult.TimedOut) {
                Write-Host "Deploy cancelled (timeout)." -ForegroundColor Yellow
            } else {
                Write-Host "Deploy cancelled (input not 'deploy')." -ForegroundColor Yellow
            }
            return $result
        }

        if (Invoke-Deploy) {
            Write-Host "Build + Deploy complete." -ForegroundColor Green
            Write-Host "Live URL: https://jsharpen.github.io/uwgas/"
            $result.Deployed = $true
            $result.DeployRan = $true
        } else {
            $result.DeployExitCode = $global:LastTaskExitCode
            $result.Errors += "Deploy failed."
            $result.DeployRan = $true
            $result.DeployOutput = $global:LastTaskOutput
        }
    }

    return $result
}

# ============================================
# MAIN MENU LOOP
# ============================================

if (-not $NoMenu) {
    Initialize-Logs

    while ($true) {
    Clear-Host
    Write-Host "=============================="
    Write-Host " ANGLE SETTER DEV CONSOLE"
    Write-Host "=============================="
    Show-Status
    Write-Host ""
    Write-Host "[1] Start Dev Server (LAN)"
    Write-Host "[2] Stop Dev Server"
    Write-Host "[3] Restart Dev Server"
    Write-Host "[4] Open Dev URL in Chrome"
    Write-Host "[5] Show URLs"
    Write-Host "------------------------------"
    Write-Host "[6] Git Status (short)"
    Write-Host "[7] Start Work (switch dev & pull)"
    Write-Host "[8] Complete Work (commit & push dev)"
    Write-Host "[9] Recent commits"
    Write-Host "[10] Stash WIP"
    Write-Host "[11] Apply last stash"
    Write-Host "------------------------------"
    Write-Host "[12] Save working diff to diffs/"
    Write-Host "[13] Save staged diff to diffs/"
    Write-Host "------------------------------"
    Write-Host "[14] Build Production"
    Write-Host "[15] Deploy Precheck (clean tree + lint + build)"
    Write-Host "[16] Build + Deploy (clean tree + lint + confirm)"
    Write-Host "[17] Show LAN QR Code"
    Write-Host "[18] Exit"
    Write-Host ""

    $choice = Read-Host "Select option (1-18)"

    switch ($choice) {
        "1" { 
            Start-Server
            Start-Sleep -Milliseconds 500   # tiny cosmetic delay
            continue                        # immediately re-draw menu
        }
        "2" { Stop-Server;       Read-Host "Press ENTER to continue" | Out-Null }
        "3" { Restart-Server;    Read-Host "Press ENTER to continue" | Out-Null }
        "4" { Open-DevUrl;       Read-Host "Press ENTER to continue" | Out-Null }
        "5" { Show-Urls;         Read-Host "Press ENTER to continue" | Out-Null }
        "6" { Show-GitStatusShort; Read-Host "Press ENTER to continue" | Out-Null }
        "7" { Start-Work;          Read-Host "Press ENTER to continue" | Out-Null }
        "8" { Complete-Work;       Read-Host "Press ENTER to continue" | Out-Null }
        "9" { Show-RecentCommits;  Read-Host "Press ENTER to continue" | Out-Null }
        "10" { Save-WipStash;      Read-Host "Press ENTER to continue" | Out-Null }
        "11" { Restore-LastStash;  Read-Host "Press ENTER to continue" | Out-Null }
        "12" {
            $label = Read-Host "Optional label (leave blank for none)"
            Save-GitDiff -Label $label
            Read-Host "Press ENTER to continue" | Out-Null
        }
        "13" {
            $label = Read-Host "Optional label (leave blank for none)"
            Save-GitDiff -Staged -Label $label
            Read-Host "Press ENTER to continue" | Out-Null
        }
        "14" { 
            $buildOk = Invoke-Build
            if ($buildOk) {
                Wait-ForEnterOrTimeout -TimeoutSeconds 5
            } else {
                Read-Host "Build failed. Press ENTER to continue" | Out-Null
            }
        }
        "15" { 
            $result = Invoke-DeployPrecheck
            Show-CheckSummary -Result $result -Context "Precheck"
            Write-CheckLog -Result $result -Context "Precheck"
            if (-not ($result -and $result.Paused)) {
                Wait-ForEnterOrTimeout -TimeoutSeconds 5
            }
        }
        "16" { 
            $result = Invoke-DeployProtocol
            Show-CheckSummary -Result $result -Context "Deploy"
            Write-CheckLog -Result $result -Context "Deploy"
            if (-not ($result -and $result.Paused)) {
                Wait-ForEnterOrTimeout -TimeoutSeconds 5
            }
        }
        "17" { Show-LanQr; Read-Host "Press ENTER to continue" | Out-Null }
        "18" {
            if ($global:ViteProc -and -not $global:ViteProc.HasExited) {
                Stop-Server
            }
            break
        }
        default {
            Write-Host "Invalid choice." -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
    }

    Write-Host "Exiting Dev Console..." -ForegroundColor Cyan
}
