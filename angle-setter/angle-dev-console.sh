#!/usr/bin/env bash
# ==============================================================================
# UWGAS — ANGLE SETTER DEV CONSOLE (Fedora Linux / Bash)
# ==============================================================================
# Interactive developer console and workflow automation for UWGAS / Angle-Setter.
# Features:
#  - Persistent live dynamic status bar on all screens (server, port, URLs, git)
#  - Categorized sub-menu navigation
#  - Background Vite dev server lifecycle management (Start / Stop / Restart / Logs)
#  - Local & LAN access with terminal QR code generation
#  - Git branching workflow (dev <-> main, commits, stash, diff exports)
#  - Quality gates & GitHub Pages deploy pipeline (clean tree, lint, typecheck, build)
#  - Direct CLI argument shortcuts (e.g. ./angle-dev-console.sh start)
# ==============================================================================

# Strict mode for error trapping where appropriate, but allow interactive recovery
set -o pipefail
export GIT_DISCOVERY_ACROSS_FILESYSTEM=1

# ------------------------------------------------------------------------------
# 1. Environment & Path Resolution
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

# Auto-spawn terminal emulator if launched from GUI (e.g. double-clicked in Dolphin)
if [[ ! -t 0 ]] || [[ ! -t 1 ]]; then
    if command -v konsole >/dev/null 2>&1; then
        exec konsole --workdir "$PROJECT_DIR" -e bash "$0" "$@"
    elif command -v xdg-terminal-exec >/dev/null 2>&1; then
        exec xdg-terminal-exec bash "$0" "$@"
    elif command -v gnome-terminal >/dev/null 2>&1; then
        exec gnome-terminal --working-directory="$PROJECT_DIR" -- bash "$0" "$@"
    elif command -v xterm >/dev/null 2>&1; then
        exec xterm -e bash "$0" "$@"
    fi
fi

LOG_DIR="$PROJECT_DIR/logs"
DIFF_DIR="$PROJECT_DIR/diffs"
PID_FILE="$PROJECT_DIR/.dev-server.pid"
DEV_LOG="$LOG_DIR/dev-server.log"
DEPLOY_LOG="$LOG_DIR/master-deploy-check.log"

DEFAULT_PORT=5173
PORT="${ANGLE_PORT:-$DEFAULT_PORT}"

# Resolve Git Repository Root (could be parent folder uwgas/)
GIT_ROOT="$(git -C "$PROJECT_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$PROJECT_DIR")"

# Ensure runtime directories exist
mkdir -p "$LOG_DIR" "$DIFF_DIR"

# ------------------------------------------------------------------------------
# 2. Styling, Colors & Icons
# ------------------------------------------------------------------------------
# Terminal color codes
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_DIM='\033[2m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_MAGENTA='\033[0;35m'
C_CYAN='\033[0;36m'
C_WHITE='\033[1;37m'
C_GRAY='\033[0;90m'

# Badges
TAG_OK="${C_GREEN}[✓ OK]${C_RESET}"
TAG_FAIL="${C_RED}[✗ FAIL]${C_RESET}"
TAG_WARN="${C_YELLOW}[⚠ WARN]${C_RESET}"
TAG_INFO="${C_CYAN}[ℹ INFO]${C_RESET}"

# ------------------------------------------------------------------------------
# 3. Live Dynamic State Detection
# ------------------------------------------------------------------------------
STATE_SERVER_STATUS="STOPPED"
STATE_SERVER_PID=""
STATE_SERVER_PORT="$PORT"
STATE_LOCAL_URL="http://localhost:$PORT"
STATE_LAN_IP=""
STATE_LAN_URL=""
STATE_GIT_BRANCH=""
STATE_GIT_STATUS="Clean"
STATE_GIT_DIRTY=0

update_live_status() {
    # 1. Check Dev Server Status
    STATE_SERVER_STATUS="STOPPED"
    STATE_SERVER_PID=""

    # Check via recorded PID file
    if [[ -f "$PID_FILE" ]]; then
        local saved_pid
        saved_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
        if [[ -n "$saved_pid" ]] && kill -0 "$saved_pid" 2>/dev/null; then
            STATE_SERVER_PID="$saved_pid"
            STATE_SERVER_STATUS="RUNNING"
        else
            rm -f "$PID_FILE"
        fi
    fi

    # Fallback: check if port is currently in use by a node/vite process
    if [[ "$STATE_SERVER_STATUS" != "RUNNING" ]]; then
        local port_pid=""
        if command -v lsof >/dev/null 2>&1; then
            port_pid="$(lsof -ti :"$PORT" -sTCP:LISTEN 2>/dev/null | head -n 1)"
        elif command -v fuser >/dev/null 2>&1; then
            port_pid="$(fuser "$PORT/tcp" 2>/dev/null | tr -s ' ' '\n' | grep -E '^[0-9]+$' | head -n 1)"
        elif command -v ss >/dev/null 2>&1; then
            port_pid="$(ss -tlpn "sport = :$PORT" 2>/dev/null | grep -o 'pid=[0-9]*' | head -n 1 | cut -d= -f2)"
        fi

        if [[ -n "$port_pid" ]] && kill -0 "$port_pid" 2>/dev/null; then
            STATE_SERVER_PID="$port_pid"
            STATE_SERVER_STATUS="RUNNING"
            echo "$port_pid" > "$PID_FILE"
        fi
    fi

    # Detect actual port Vite bound to if running
    if [[ "$STATE_SERVER_STATUS" == "RUNNING" && -f "$DEV_LOG" ]]; then
        local detected_port
        detected_port="$(grep -E -o "http://localhost:[0-9]+" "$DEV_LOG" 2>/dev/null | tail -n 1 | grep -E -o "[0-9]+$")"
        if [[ -n "$detected_port" ]]; then
            STATE_SERVER_PORT="$detected_port"
        else
            STATE_SERVER_PORT="$PORT"
        fi
    else
        STATE_SERVER_PORT="$PORT"
    fi

    # 2. Detect Active LAN IP
    STATE_LAN_IP=""
    if command -v ip >/dev/null 2>&1; then
        STATE_LAN_IP="$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+')"
    fi
    if [[ -z "$STATE_LAN_IP" ]] && command -v hostname >/dev/null 2>&1; then
        STATE_LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
    fi
    if [[ -z "$STATE_LAN_IP" ]]; then
        STATE_LAN_IP="127.0.0.1"
    fi

    STATE_LOCAL_URL="http://localhost:$STATE_SERVER_PORT"
    STATE_LAN_URL="http://${STATE_LAN_IP}:$STATE_SERVER_PORT"

    # 3. Detect Git Branch & Working Tree Status
    if git -C "$GIT_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        STATE_GIT_BRANCH="$(git -C "$GIT_ROOT" branch --show-current 2>/dev/null || echo "detached")"
        local git_changes
        git_changes="$(git -C "$GIT_ROOT" status --porcelain 2>/dev/null | wc -l)"
        if [[ "$git_changes" -gt 0 ]]; then
            STATE_GIT_STATUS="Modified (${git_changes} changes)"
            STATE_GIT_DIRTY=1
        else
            STATE_GIT_STATUS="Clean"
            STATE_GIT_DIRTY=0
        fi
    else
        STATE_GIT_BRANCH="[No Git]"
        STATE_GIT_STATUS="N/A"
        STATE_GIT_DIRTY=0
    fi
}

# ------------------------------------------------------------------------------
# 4. Persistent Status Header Renderer
# ------------------------------------------------------------------------------
render_persistent_header() {
    local screen_title="${1:-DEV CONSOLE}"
    update_live_status

    clear
    echo -e "${C_CYAN}${C_BOLD}==============================================================================${C_RESET}"
    echo -e "${C_WHITE}${C_BOLD}  UWGAS — ANGLE SETTER DEV CONSOLE  ${C_RESET}${C_DIM}|${C_RESET} ${C_YELLOW}${screen_title}${C_RESET}"
    echo -e "${C_CYAN}------------------------------------------------------------------------------${C_RESET}"

    # Server status badge
    if [[ "$STATE_SERVER_STATUS" == "RUNNING" ]]; then
        echo -e "  ${C_BOLD}Server:${C_RESET}  ${C_GREEN}${C_BOLD}● RUNNING${C_RESET}  ${C_DIM}(PID: ${STATE_SERVER_PID} | Port: ${PORT})${C_RESET}"
        echo -e "  ${C_BOLD}URLs:${C_RESET}    ${C_CYAN}${STATE_LOCAL_URL}${C_RESET}  ${C_DIM}| LAN:${C_RESET} ${C_BLUE}${STATE_LAN_URL}${C_RESET}"
    else
        echo -e "  ${C_BOLD}Server:${C_RESET}  ${C_RED}○ STOPPED${C_RESET}  ${C_DIM}(Port: ${PORT})${C_RESET}"
        echo -e "  ${C_BOLD}URLs:${C_RESET}    ${C_DIM}http://localhost:${PORT} (offline)${C_RESET}"
    fi

    # Git status badge
    if [[ "$STATE_GIT_DIRTY" -eq 1 ]]; then
        echo -e "  ${C_BOLD}Git:${C_RESET}     ${C_MAGENTA}${C_BOLD}${STATE_GIT_BRANCH}${C_RESET}  ${C_YELLOW}[${STATE_GIT_STATUS}]${C_RESET}"
    else
        echo -e "  ${C_BOLD}Git:${C_RESET}     ${C_MAGENTA}${C_BOLD}${STATE_GIT_BRANCH}${C_RESET}  ${C_GREEN}[Clean]${C_RESET}"
    fi
    echo -e "${C_CYAN}${C_BOLD}==============================================================================${C_RESET}"
    echo ""
}

pause() {
    local prompt_text="${1:-Press [ENTER] to continue...}"
    echo ""
    echo -en "${C_DIM}${prompt_text}${C_RESET} "
    read -r _
}

# ------------------------------------------------------------------------------
# 5. Dev Server Lifecycle & Tools
# ------------------------------------------------------------------------------
start_server() {
    update_live_status
    if [[ "$STATE_SERVER_STATUS" == "RUNNING" ]]; then
        echo -e "${TAG_WARN} Dev server is already running on PID ${STATE_SERVER_PID} (${STATE_LOCAL_URL})."
        return 0
    fi

    echo -e "${TAG_INFO} Starting Vite Dev Server on port ${PORT} (--host)..."
    cd "$PROJECT_DIR" || exit 1

    # Launch Vite in background with stdout/stderr redirected to dev log
    npm run dev -- --host --port "$PORT" > "$DEV_LOG" 2>&1 &
    local new_pid=$!
    echo "$new_pid" > "$PID_FILE"

    # Wait up to 10 seconds for server to bind
    local attempts=0
    local max_attempts=20
    local started=0

    echo -n "Waiting for server to become ready..."
    while [[ $attempts -lt $max_attempts ]]; do
        sleep 0.5
        echo -n "."
        if kill -0 "$new_pid" 2>/dev/null; then
            if grep -q -i "ready in" "$DEV_LOG" 2>/dev/null || grep -q -i "Local:" "$DEV_LOG" 2>/dev/null; then
                started=1
                break
            fi
        else
            break
        fi
        ((attempts++))
    done
    echo ""

    if [[ $started -eq 1 ]]; then
        update_live_status
        echo -e "${TAG_OK} Dev server started successfully!"
        echo -e "  Local: ${C_CYAN}${STATE_LOCAL_URL}${C_RESET}"
        echo -e "  LAN:   ${C_BLUE}${STATE_LAN_URL}${C_RESET}"
    else
        echo -e "${TAG_FAIL} Failed to verify dev server launch. Check log below:"
        tail -n 15 "$DEV_LOG"
    fi
}

stop_server() {
    update_live_status
    if [[ "$STATE_SERVER_STATUS" != "RUNNING" ]]; then
        echo -e "${TAG_INFO} Dev server is not running."
        rm -f "$PID_FILE"
        return 0
    fi

    echo -e "${TAG_INFO} Stopping Dev Server (PID: ${STATE_SERVER_PID})..."
    kill -SIGTERM "$STATE_SERVER_PID" 2>/dev/null || true

    # Wait up to 3 seconds for graceful shutdown
    local attempts=0
    while kill -0 "$STATE_SERVER_PID" 2>/dev/null && [[ $attempts -lt 6 ]]; do
        sleep 0.5
        ((attempts++))
    done

    # Force kill if still lingering
    if kill -0 "$STATE_SERVER_PID" 2>/dev/null; then
        echo -e "${TAG_WARN} Process lingering, sending SIGKILL..."
        kill -SIGKILL "$STATE_SERVER_PID" 2>/dev/null || true
    fi

    # Kill any other process listening on the port if left behind
    if command -v fuser >/dev/null 2>&1; then
        fuser -k -n tcp "$PORT" >/dev/null 2>&1 || true
    fi

    rm -f "$PID_FILE"
    update_live_status
    echo -e "${TAG_OK} Dev server stopped."
}

restart_server() {
    echo -e "${TAG_INFO} Restarting Dev Server..."
    stop_server
    sleep 1
    start_server
}

open_browser() {
    update_live_status
    local target_url="${STATE_LOCAL_URL}"
    echo -e "${TAG_INFO} Opening ${C_CYAN}${target_url}${C_RESET} in default browser..."

    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$target_url" >/dev/null 2>&1 &
        echo -e "${TAG_OK} Launched default browser via xdg-open."
    elif command -v google-chrome >/dev/null 2>&1; then
        google-chrome "$target_url" >/dev/null 2>&1 &
        echo -e "${TAG_OK} Launched Google Chrome."
    elif command -v firefox >/dev/null 2>&1; then
        firefox "$target_url" >/dev/null 2>&1 &
        echo -e "${TAG_OK} Launched Firefox."
    else
        echo -e "${TAG_WARN} Could not detect xdg-open or standard browser binary. Please open: ${target_url}"
    fi
}

check_firewall_status() {
    echo -e "${C_BOLD}Fedora Firewall (firewalld) Status:${C_RESET}"
    if ! command -v firewall-cmd >/dev/null 2>&1; then
        echo -e "${TAG_INFO} firewalld is not installed or active."
        return 0
    fi

    if ! systemctl is-active --quiet firewalld 2>/dev/null; then
        echo -e "${TAG_OK} firewalld is not running (all LAN ports open)."
        return 0
    fi

    local open_ports
    open_ports="$(firewall-cmd --list-ports 2>/dev/null || true)"
    if echo "$open_ports" | grep -q "${STATE_SERVER_PORT}/tcp"; then
        echo -e "${TAG_OK} Port ${STATE_SERVER_PORT}/tcp is OPEN in firewalld."
    else
        echo -e "${TAG_WARN} Port ${STATE_SERVER_PORT}/tcp is ${C_RED}BLOCKED${C_RESET} by Fedora's firewall."
        echo -e "  To allow phone/LAN access, run:"
        echo -e "    ${C_CYAN}sudo firewall-cmd --add-port=${STATE_SERVER_PORT}/tcp --permanent && sudo firewall-cmd --reload${C_RESET}"
        echo ""
        echo -en "${C_YELLOW}Would you like to open port ${STATE_SERVER_PORT}/tcp now? (y/N):${C_RESET} "
        read -r ans
        if [[ "$ans" == "y" || "$ans" == "Y" ]]; then
            sudo firewall-cmd --add-port="${STATE_SERVER_PORT}/tcp" --permanent && sudo firewall-cmd --reload
            echo -e "${TAG_OK} Port ${STATE_SERVER_PORT}/tcp is now open!"
        fi
    fi
}

show_urls_and_qr() {
    update_live_status
    echo -e "${C_BOLD}Dev Server Access Details:${C_RESET}"
    echo -e "  • Local Machine: ${C_CYAN}${STATE_LOCAL_URL}${C_RESET}"
    echo -e "  • LAN / Mobile:  ${C_BLUE}${STATE_LAN_URL}${C_RESET}"
    echo ""
    echo -e "${C_DIM}Note: Ensure your phone is on the same Wi-Fi network and uses ${C_BOLD}http://${C_RESET}${C_DIM} (not https://).${C_RESET}"
    echo ""

    if command -v qrencode >/dev/null 2>&1; then
        echo -e "${C_YELLOW}Scan QR Code with your phone/tablet:${C_RESET}"
        echo ""
        qrencode -t ANSIUTF8 "${STATE_LAN_URL}"
        echo ""
    else
        echo -e "${TAG_INFO} Tip: Install 'qrencode' (${C_CYAN}sudo dnf install qrencode${C_RESET}) to display instant terminal QR codes."
    fi

    # Check firewall status
    check_firewall_status
}

view_dev_logs() {
    if [[ ! -f "$DEV_LOG" ]]; then
        echo -e "${TAG_WARN} No dev server log file found at ${DEV_LOG}"
        return 0
    fi

    echo -e "${C_YELLOW}${C_BOLD}Viewing Dev Server Log (${DEV_LOG}):${C_RESET}"
    echo -e "${C_DIM}Press [Ctrl+C] to exit log viewer and return to menu.${C_RESET}"
    echo -e "${C_GRAY}------------------------------------------------------------------------------${C_RESET}"
    tail -n 40 -f "$DEV_LOG"
}

# ------------------------------------------------------------------------------
# 6. Git & Branching Automation
# ------------------------------------------------------------------------------
git_show_status() {
    echo -e "${C_BOLD}Git Repository Status (${GIT_ROOT}):${C_RESET}"
    echo ""
    git -C "$GIT_ROOT" status
}

git_start_work() {
    echo -e "${TAG_INFO} Preparing working branch: switching to '${C_MAGENTA}dev${C_RESET}' and pulling latest..."
    cd "$GIT_ROOT" || exit 1

    if ! git checkout dev; then
        echo -e "${TAG_FAIL} Failed to checkout 'dev' branch."
        return 1
    fi

    echo -e "${TAG_INFO} Pulling latest changes from origin/dev..."
    if git pull origin dev; then
        echo -e "${TAG_OK} 'dev' branch is up to date and ready for work."
    else
        echo -e "${TAG_WARN} Git pull encountered issues or remote is not configured."
    fi
}

git_commit_and_push_dev() {
    cd "$GIT_ROOT" || exit 1
    update_live_status

    if [[ "$STATE_GIT_DIRTY" -eq 0 ]]; then
        echo -e "${TAG_INFO} Working tree is clean. Nothing to commit."
        return 0
    fi

    echo -e "${C_BOLD}Changed files to be committed:${C_RESET}"
    git status -s
    echo ""

    echo -en "${C_YELLOW}Enter commit message (leave blank to cancel):${C_RESET} "
    read -r commit_msg

    if [[ -z "$commit_msg" ]]; then
        echo -e "${TAG_WARN} Commit cancelled."
        return 0
    fi

    echo -e "${TAG_INFO} Staging changes..."
    git add -A

    echo -e "${TAG_INFO} Committing..."
    if git commit -m "$commit_msg"; then
        echo -e "${TAG_OK} Committed: \"$commit_msg\""
    else
        echo -e "${TAG_FAIL} Git commit failed."
        return 1
    fi

    echo -e "${TAG_INFO} Pushing to origin/dev..."
    if git push origin dev; then
        echo -e "${TAG_OK} Successfully pushed changes to origin/dev!"
    else
        echo -e "${TAG_FAIL} Failed to push to origin/dev."
        return 1
    fi
}

git_promote_dev_to_main() {
    cd "$GIT_ROOT" || exit 1
    update_live_status

    echo -e "${C_YELLOW}${C_BOLD}Promote 'dev' -> 'main' Release Protocol${C_RESET}"
    echo -e "This will verify checks on 'dev', merge 'dev' into 'main', push 'main', and return to 'dev'."
    echo ""

    if [[ "$STATE_GIT_DIRTY" -eq 1 ]]; then
        echo -e "${TAG_FAIL} You have uncommitted changes in 'dev'. Please commit or stash them first."
        return 1
    fi

    echo -en "${C_YELLOW}Are you sure you want to merge 'dev' into 'main'? (y/N):${C_RESET} "
    read -r confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        echo -e "${TAG_INFO} Operation cancelled."
        return 0
    fi

    # Run quick quality validation before merging
    echo -e "${TAG_INFO} Step 1/5: Running pre-merge validation (typecheck & lint)..."
    cd "$PROJECT_DIR" || exit 1
    if ! npm run typecheck; then
        echo -e "${TAG_FAIL} Typecheck failed on 'dev'! Aborting merge to main."
        return 1
    fi
    if ! npm run lint; then
        echo -e "${TAG_FAIL} Lint failed on 'dev'! Aborting merge to main."
        return 1
    fi

    cd "$GIT_ROOT" || exit 1
    echo -e "${TAG_INFO} Step 2/5: Checking out 'main'..."
    if ! git checkout main; then
        echo -e "${TAG_FAIL} Failed to switch to 'main'."
        return 1
    fi

    echo -e "${TAG_INFO} Step 3/5: Pulling latest 'main'..."
    git pull origin main 2>/dev/null || true

    echo -e "${TAG_INFO} Step 4/5: Merging 'dev' into 'main'..."
    if ! git merge dev -m "Merge dev into main [Automated via Dev Console]"; then
        echo -e "${TAG_FAIL} Merge conflict encountered! Resolve conflicts manually."
        return 1
    fi

    echo -e "${TAG_INFO} Step 5/5: Pushing 'main' to origin..."
    if ! git push origin main; then
        echo -e "${TAG_FAIL} Failed to push 'main' to origin."
    else
        echo -e "${TAG_OK} Successfully pushed merged 'main' to origin!"
    fi

    echo -e "${TAG_INFO} Returning to 'dev' branch..."
    git checkout dev
    echo -e "${TAG_OK} Release promote completed successfully!"
}

git_recent_commits() {
    echo -e "${C_BOLD}Recent Git Commits (${GIT_ROOT}):${C_RESET}"
    echo ""
    git -C "$GIT_ROOT" log --oneline --graph --decorate -n 15
}

# ------------------------------------------------------------------------------
# 7. Diffs & Stash Helpers
# ------------------------------------------------------------------------------
save_diff_export() {
    local mode="${1:-unstaged}" # unstaged or staged
    cd "$GIT_ROOT" || exit 1

    local timestamp
    timestamp="$(date +%Y%m%d_%H%M%S)"

    echo -en "${C_YELLOW}Enter optional label for diff (or leave blank):${C_RESET} "
    read -r label
    label="$(echo "$label" | tr ' ' '_' | tr -cd '[:alnum:]_-')"

    local diff_filename
    if [[ -n "$label" ]]; then
        diff_filename="${timestamp}_${mode}_${label}.diff"
    else
        diff_filename="${timestamp}_${mode}.diff"
    fi

    local out_path="$DIFF_DIR/$diff_filename"

    if [[ "$mode" == "staged" ]]; then
        git diff --cached > "$out_path"
    else
        git diff > "$out_path"
    fi

    local line_count
    line_count="$(wc -l < "$out_path" 2>/dev/null || echo 0)"

    if [[ "$line_count" -eq 0 ]]; then
        rm -f "$out_path"
        echo -e "${TAG_WARN} No ${mode} diff found. File not created."
    else
        echo -e "${TAG_OK} Saved ${mode} diff (${line_count} lines) to:"
        echo -e "  ${C_CYAN}${out_path}${C_RESET}"
    fi
}

git_stash_wip() {
    cd "$GIT_ROOT" || exit 1
    echo -en "${C_YELLOW}Enter stash message / label (or leave blank for timestamp):${C_RESET} "
    read -r label
    local timestamp
    timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

    if [[ -z "$label" ]]; then
        label="WIP Stash $timestamp"
    fi

    echo -e "${TAG_INFO} Stashing changes: \"$label\"..."
    git stash push -u -m "$label"
    echo -e "${TAG_OK} Done."
}

git_stash_pop() {
    cd "$GIT_ROOT" || exit 1
    echo -e "${TAG_INFO} Applying and removing most recent stash..."
    git stash pop
}

git_stash_list() {
    cd "$GIT_ROOT" || exit 1
    echo -e "${C_BOLD}Saved Git Stashes:${C_RESET}"
    echo ""
    git stash list
}

# ------------------------------------------------------------------------------
# 8. Quality Checks, Build & GitHub Pages Deployment
# ------------------------------------------------------------------------------
run_lint() {
    echo -e "${TAG_INFO} Running linter (eslint)..."
    cd "$PROJECT_DIR" || exit 1
    npm run lint
}

run_typecheck() {
    echo -e "${TAG_INFO} Running TypeScript typecheck (tsc --noEmit)..."
    cd "$PROJECT_DIR" || exit 1
    npm run typecheck
}

run_build() {
    echo -e "${TAG_INFO} Running production build (tsc -b && vite build)..."
    cd "$PROJECT_DIR" || exit 1
    npm run build
}

run_deploy_precheck() {
    local -A results
    local all_pass=1
    cd "$PROJECT_DIR" || exit 1

    echo -e "${C_YELLOW}${C_BOLD}Starting Deploy Precheck Suite...${C_RESET}"
    echo ""

    # Check 1: Working tree cleanliness
    update_live_status
    if [[ "$STATE_GIT_DIRTY" -eq 0 ]]; then
        results["clean"]="PASS"
    else
        results["clean"]="FAIL (Dirty tree)"
        all_pass=0
    fi

    # Check 2: Lint
    echo -e "${C_DIM}Running Lint...${C_RESET}"
    if npm run lint >/dev/null 2>&1; then
        results["lint"]="PASS"
    else
        results["lint"]="FAIL"
        all_pass=0
    fi

    # Check 3: Typecheck
    echo -e "${C_DIM}Running Typecheck...${C_RESET}"
    if npm run typecheck >/dev/null 2>&1; then
        results["type"]="PASS"
    else
        results["type"]="FAIL"
        all_pass=0
    fi

    # Check 4: Build
    echo -e "${C_DIM}Running Production Build...${C_RESET}"
    if npm run build >/dev/null 2>&1; then
        results["build"]="PASS"
    else
        results["build"]="FAIL"
        all_pass=0
    fi

    # Render Summary Matrix
    echo ""
    echo -e "${C_CYAN}==============================================================================${C_RESET}"
    echo -e "${C_WHITE}${C_BOLD}                       PRECHECK RESULTS MATRIX                                ${C_RESET}"
    echo -e "${C_CYAN}------------------------------------------------------------------------------${C_RESET}"
    printf "  %-30s : %s\n" "Git Working Tree Clean" "$([[ "${results[clean]}" == "PASS" ]] && echo -e "${TAG_OK}" || echo -e "${TAG_FAIL} (${results[clean]})")"
    printf "  %-30s : %s\n" "Linter (eslint)" "$([[ "${results[lint]}" == "PASS" ]] && echo -e "${TAG_OK}" || echo -e "${TAG_FAIL}")"
    printf "  %-30s : %s\n" "TypeScript Typecheck" "$([[ "${results[type]}" == "PASS" ]] && echo -e "${TAG_OK}" || echo -e "${TAG_FAIL}")"
    printf "  %-30s : %s\n" "Production Build" "$([[ "${results[build]}" == "PASS" ]] && echo -e "${TAG_OK}" || echo -e "${TAG_FAIL}")"
    echo -e "${C_CYAN}==============================================================================${C_RESET}"

    # Log to deploy log
    local log_entry="[$(date '+%Y-%m-%d %H:%M:%S')] Precheck - Clean: ${results[clean]} | Lint: ${results[lint]} | Type: ${results[type]} | Build: ${results[build]} -> Overall: $([[ $all_pass -eq 1 ]] && echo 'PASS' || echo 'FAIL')"
    echo "$log_entry" >> "$DEPLOY_LOG"

    return $(( 1 - all_pass ))
}

run_deploy_protocol() {
    cd "$PROJECT_DIR" || exit 1
    echo -e "${C_YELLOW}${C_BOLD}UWGAS GitHub Pages Deployment Protocol${C_RESET}"
    echo ""

    if ! run_deploy_precheck; then
        echo ""
        echo -e "${TAG_FAIL} Precheck failed! Deployment aborted to prevent broken builds."
        return 1
    fi

    echo ""
    echo -e "${C_YELLOW}All quality and build gates PASSED.${C_RESET}"
    echo -en "${C_WHITE}${C_BOLD}Type 'deploy' to confirm deployment to GitHub Pages (or press Enter to cancel):${C_RESET} "
    read -r confirm

    if [[ "$confirm" != "deploy" ]]; then
        echo -e "${TAG_INFO} Deploy cancelled by user."
        return 0
    fi

    echo ""
    echo -e "${TAG_INFO} Executing gh-pages deployment..."
    if npm run deploy 2>&1 | tee -a "$DEPLOY_LOG"; then
        echo ""
        echo -e "${TAG_OK} ${C_GREEN}${C_BOLD}Deployment successful!${C_RESET}"
        echo -e "  Live Site URL: ${C_CYAN}https://jsharpen.github.io/uwgas/${C_RESET}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy SUCCESS -> https://jsharpen.github.io/uwgas/" >> "$DEPLOY_LOG"
    else
        echo ""
        echo -e "${TAG_FAIL} Deployment failed! Check logs at ${DEPLOY_LOG}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy FAILED" >> "$DEPLOY_LOG"
        return 1
    fi
}

# ------------------------------------------------------------------------------
# 9. Sub-Menus Navigation
# ------------------------------------------------------------------------------

# Submenu 1: Dev Server
menu_server() {
    while true; do
        render_persistent_header "DEV SERVER & PREVIEW"
        echo -e "${C_BOLD}Available Server Actions:${C_RESET}"
        echo -e "  ${C_CYAN}[1]${C_RESET} Start Dev Server (Background + LAN)"
        echo -e "  ${C_CYAN}[2]${C_RESET} Stop Dev Server"
        echo -e "  ${C_CYAN}[3]${C_RESET} Restart Dev Server"
        echo -e "  ${C_CYAN}[4]${C_RESET} Open in Default Browser (xdg-open)"
        echo -e "  ${C_CYAN}[5]${C_RESET} Show LAN Access URLs & QR Code"
        echo -e "  ${C_CYAN}[6]${C_RESET} View Live Dev Server Logs (tail -f)"
        echo ""
        echo -e "  ${C_YELLOW}[r]${C_RESET} Refresh Status"
        echo -e "  ${C_YELLOW}[0]${C_RESET} Back to Main Menu"
        echo ""
        echo -en "${C_WHITE}${C_BOLD}Select option (0-6, r):${C_RESET} "
        read -r choice

        case "$choice" in
            1) start_server; pause ;;
            2) stop_server; pause ;;
            3) restart_server; pause ;;
            4) open_browser; pause ;;
            5) show_urls_and_qr; pause ;;
            6) view_dev_logs ;;
            r|R) continue ;;
            0) break ;;
            *) echo -e "${TAG_WARN} Invalid choice."; sleep 1 ;;
        esac
    done
}

# Submenu 2: Git Workflow
menu_git() {
    while true; do
        render_persistent_header "GIT & BRANCH WORKFLOW"
        echo -e "${C_BOLD}Available Git Actions:${C_RESET}"
        echo -e "  ${C_CYAN}[1]${C_RESET} Git Status (Detailed)"
        echo -e "  ${C_CYAN}[2]${C_RESET} Start Work (Checkout & pull latest 'dev')"
        echo -e "  ${C_CYAN}[3]${C_RESET} Commit & Push (Stage, prompt message, push dev)"
        echo -e "  ${C_CYAN}[4]${C_RESET} Promote dev -> main (Verify checks, merge to main & push)"
        echo -e "  ${C_CYAN}[5]${C_RESET} Show Recent Commits (Graph view)"
        echo ""
        echo -e "  ${C_YELLOW}[r]${C_RESET} Refresh Status"
        echo -e "  ${C_YELLOW}[0]${C_RESET} Back to Main Menu"
        echo ""
        echo -en "${C_WHITE}${C_BOLD}Select option (0-5, r):${C_RESET} "
        read -r choice

        case "$choice" in
            1) git_show_status; pause ;;
            2) git_start_work; pause ;;
            3) git_commit_and_push_dev; pause ;;
            4) git_promote_dev_to_main; pause ;;
            5) git_recent_commits; pause ;;
            r|R) continue ;;
            0) break ;;
            *) echo -e "${TAG_WARN} Invalid choice."; sleep 1 ;;
        esac
    done
}

# Submenu 3: Quality & Deployment
menu_quality() {
    while true; do
        render_persistent_header "QUALITY & DEPLOYMENT"
        echo -e "${C_BOLD}Available Quality & Deployment Actions:${C_RESET}"
        echo -e "  ${C_CYAN}[1]${C_RESET} Run Linter (eslint)"
        echo -e "  ${C_CYAN}[2]${C_RESET} Run TypeScript Typecheck (tsc --noEmit)"
        echo -e "  ${C_CYAN}[3]${C_RESET} Build Production Bundle (tsc -b && vite build)"
        echo -e "  ${C_CYAN}[4]${C_RESET} Full Deploy Precheck Suite (clean tree + lint + typecheck + build)"
        echo -e "  ${C_CYAN}[5]${C_RESET} Build & Deploy to GitHub Pages (gh-pages)"
        echo ""
        echo -e "  ${C_YELLOW}[r]${C_RESET} Refresh Status"
        echo -e "  ${C_YELLOW}[0]${C_RESET} Back to Main Menu"
        echo ""
        echo -en "${C_WHITE}${C_BOLD}Select option (0-5, r):${C_RESET} "
        read -r choice

        case "$choice" in
            1) run_lint; pause ;;
            2) run_typecheck; pause ;;
            3) run_build; pause ;;
            4) run_deploy_precheck; pause ;;
            5) run_deploy_protocol; pause ;;
            r|R) continue ;;
            0) break ;;
            *) echo -e "${TAG_WARN} Invalid choice."; sleep 1 ;;
        esac
    done
}

# Submenu 4: Diffs & Stashes
menu_diffs() {
    while true; do
        render_persistent_header "DIFFS & STASH HELPERS"
        echo -e "${C_BOLD}Available Diff & Stash Actions:${C_RESET}"
        echo -e "  ${C_CYAN}[1]${C_RESET} Save Unstaged Working Tree Diff to diffs/"
        echo -e "  ${C_CYAN}[2]${C_RESET} Save Staged Diff to diffs/"
        echo -e "  ${C_CYAN}[3]${C_RESET} Stash Current WIP (with timestamp/message)"
        echo -e "  ${C_CYAN}[4]${C_RESET} Apply / Pop Last Stash"
        echo -e "  ${C_CYAN}[5]${C_RESET} List All Saved Stashes"
        echo ""
        echo -e "  ${C_YELLOW}[r]${C_RESET} Refresh Status"
        echo -e "  ${C_YELLOW}[0]${C_RESET} Back to Main Menu"
        echo ""
        echo -en "${C_WHITE}${C_BOLD}Select option (0-5, r):${C_RESET} "
        read -r choice

        case "$choice" in
            1) save_diff_export "unstaged"; pause ;;
            2) save_diff_export "staged"; pause ;;
            3) git_stash_wip; pause ;;
            4) git_stash_pop; pause ;;
            5) git_stash_list; pause ;;
            r|R) continue ;;
            0) break ;;
            *) echo -e "${TAG_WARN} Invalid choice."; sleep 1 ;;
        esac
    done
}

# ------------------------------------------------------------------------------
# 10. Main Menu Interactive Loop
# ------------------------------------------------------------------------------
menu_main() {
    while true; do
        render_persistent_header "MAIN MENU"
        echo -e "${C_BOLD}Categories & Workflows:${C_RESET}"
        echo -e "  ${C_CYAN}[1]${C_RESET} Dev Server & Preview    ${C_DIM}→ Start, Stop, Restart, Browser, Logs, QR${C_RESET}"
        echo -e "  ${C_CYAN}[2]${C_RESET} Git & Branch Workflow   ${C_DIM}→ Status, Commit/Push, Merge dev->main, Commits${C_RESET}"
        echo -e "  ${C_CYAN}[3]${C_RESET} Quality & Deployment    ${C_DIM}→ Lint, Typecheck, Build, Deploy to gh-pages${C_RESET}"
        echo -e "  ${C_CYAN}[4]${C_RESET} Diffs & Stash Helpers   ${C_DIM}→ Save Diffs to diffs/, Stash WIP, Pop Stash${C_RESET}"
        echo ""
        echo -e "  ${C_YELLOW}[r]${C_RESET} Refresh Live Status"
        echo -e "  ${C_RED}[0]${C_RESET} Exit Console"
        echo ""
        echo -en "${C_WHITE}${C_BOLD}Select Category (1-4, r, 0):${C_RESET} "
        read -r main_choice

        case "$main_choice" in
            1) menu_server ;;
            2) menu_git ;;
            3) menu_quality ;;
            4) menu_diffs ;;
            r|R) continue ;;
            0)
                clear
                echo -e "${C_CYAN}Exiting Angle Setter Dev Console. Have a productive session!${C_RESET}"
                exit 0
                ;;
            *)
                echo -e "${TAG_WARN} Invalid selection. Please enter 1-4, r, or 0."
                sleep 1
                ;;
        esac
    done
}

# ------------------------------------------------------------------------------
# 11. CLI Argument / Subcommand Dispatcher
# ------------------------------------------------------------------------------
if [[ $# -gt 0 ]]; then
    cmd="$1"
    shift
    case "$cmd" in
        start)        start_server ;;
        stop)         stop_server ;;
        restart)      restart_server ;;
        status)
            update_live_status
            echo -e "Server: $STATE_SERVER_STATUS (PID: ${STATE_SERVER_PID:-N/A})"
            echo -e "Local:  $STATE_LOCAL_URL"
            echo -e "LAN:    $STATE_LAN_URL"
            echo -e "Git:    $STATE_GIT_BRANCH [$STATE_GIT_STATUS]"
            ;;
        open)         open_browser ;;
        qr)           show_urls_and_qr ;;
        logs)         view_dev_logs ;;
        lint)         run_lint ;;
        typecheck)    run_typecheck ;;
        build)        run_build ;;
        check)        run_deploy_precheck ;;
        deploy)       run_deploy_protocol ;;
        commit)       git_commit_and_push_dev ;;
        help|--help|-h)
            echo "Usage: ./angle-dev-console.sh [command]"
            echo ""
            echo "Commands:"
            echo "  (no args)   Launch interactive categorized menu"
            echo "  start       Start background dev server"
            echo "  stop        Stop background dev server"
            echo "  restart     Restart background dev server"
            echo "  status      Display live status summary"
            echo "  open        Open default browser to local dev URL"
            echo "  qr          Show URLs and mobile QR code"
            echo "  logs        Tail dev server logs"
            echo "  lint        Run ESLint"
            echo "  typecheck   Run TypeScript check"
            echo "  build       Run production build"
            echo "  check       Run full deploy precheck matrix"
            echo "  deploy      Run prechecks and deploy to GitHub Pages"
            echo "  commit      Prompt and push commit to dev branch"
            ;;
        *)
            echo "Unknown command: $cmd"
            echo "Run './angle-dev-console.sh --help' for available CLI commands."
            exit 1
            ;;
    esac
    exit 0
fi

# Launch Interactive Loop
menu_main
