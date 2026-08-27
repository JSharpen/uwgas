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

# Auto-spawn terminal emulator only if launched from GUI without args (e.g. double-clicked in Dolphin)
if { [[ ! -t 0 ]] || [[ ! -t 1 ]]; } && [[ $# -eq 0 ]] && [[ -n "$DISPLAY" || -n "$WAYLAND_DISPLAY" ]]; then
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
        cd "$PROJECT_DIR" || true
        return 1
    fi

    echo -e "${TAG_INFO} Pulling latest changes from origin/dev..."
    if git pull origin dev; then
        echo -e "${TAG_OK} 'dev' branch is up to date and ready for work."
    else
        echo -e "${TAG_WARN} Git pull encountered issues or remote is not configured."
    fi
    cd "$PROJECT_DIR" || true
}

# ------------------------------------------------------------------------------
# 5.5 Autonomous Job & Commit Auto-Detection
# ------------------------------------------------------------------------------
detect_suggested_commit_info() {
    SUGGESTED_JOB_ID=""
    SUGGESTED_MSG=""
    SUGGESTED_BODY=""

    local changelog_path="$PROJECT_DIR/docs/CHANGELOG.md"
    local project_plan_path="$PROJECT_DIR/docs/PROJECT_PLAN.md"

    # Strategy 1: Parse docs/CHANGELOG.md (Active session header, job IDs, and bullet items)
    if [[ -f "$changelog_path" ]]; then
        local latest_section
        latest_section="$(awk '/^## \[/{count++} count==1{print} count==2{exit}' "$changelog_path" 2>/dev/null || true)"

        local session_title
        session_title="$(echo "$latest_section" | grep -m 1 -oP '\(Session:\s*\K[^)]+' || true)"

        # Extract all unique JOB-xxx IDs in the latest section
        local changelog_jobs
        changelog_jobs="$(echo "$latest_section" | grep -oP 'JOB-[0-9]{3}' | sort -u | paste -sd ',' - | sed 's/,/, /g' || true)"

        # Extract all top-level bullet highlights (e.g. - **Title (`JOB-xxx`)**:)
        local -a bullets=()
        while IFS= read -r line; do
            [[ -n "$line" ]] && bullets+=("$line")
        done < <(echo "$latest_section" | grep -oP '^\s*-\s*\*\*\K[^*]+' | sed -E 's/\s*:\s*$//' || true)

        if [[ -n "$changelog_jobs" ]]; then
            SUGGESTED_JOB_ID="$changelog_jobs"
        fi

        if [[ -n "$session_title" ]]; then
            SUGGESTED_MSG="$session_title"
        elif [[ ${#bullets[@]} -gt 0 ]]; then
            SUGGESTED_MSG="${bullets[0]}"
        fi

        if [[ ${#bullets[@]} -gt 0 ]]; then
            SUGGESTED_BODY="Key Changes & Highlights:"$'\n'
            for b in "${bullets[@]}"; do
                SUGGESTED_BODY+="• ${b}"$'\n'
            done
        fi
    fi

    # Strategy 2: Fallback to docs/PROJECT_PLAN.md ([IN PROGRESS] or active jobs)
    if [[ -z "$SUGGESTED_JOB_ID" || -z "$SUGGESTED_MSG" ]] && [[ -f "$project_plan_path" ]]; then
        local in_prog_line
        in_prog_line="$(grep -P '\|\s*\*\*JOB-[0-9]+\*\*\s*\|[^|]+\|\s*`?\[IN PROGRESS\]`?' "$project_plan_path" 2>/dev/null | head -n 1 || true)"

        if [[ -n "$in_prog_line" ]]; then
            local plan_job
            plan_job="$(echo "$in_prog_line" | grep -oP 'JOB-[0-9]{3}')"
            local plan_title
            plan_title="$(echo "$in_prog_line" | cut -d'|' -f3 | sed 's/^[ \t]*//;s/[ \t]*$//')"
            local plan_desc
            plan_desc="$(echo "$in_prog_line" | cut -d'|' -f6 | sed 's/^[ \t]*//;s/[ \t]*$//')"

            [[ -z "$SUGGESTED_JOB_ID" ]] && SUGGESTED_JOB_ID="$plan_job"
            [[ -z "$SUGGESTED_MSG" ]] && SUGGESTED_MSG="$plan_title"
            if [[ -z "$SUGGESTED_BODY" && -n "$plan_desc" ]]; then
                SUGGESTED_BODY="Task Overview:"$'\n'"• ${plan_desc}"$'\n'
            fi
        fi
    fi

    # Strategy 3: Scan git diff for JOB-xxx references if still empty
    if [[ -z "$SUGGESTED_JOB_ID" ]]; then
        local diff_job
        diff_job="$(git -C "$GIT_ROOT" diff --cached --unified=0 2>/dev/null | grep -m 1 -oP 'JOB-[0-9]{3}' || true)"
        if [[ -z "$diff_job" ]]; then
            diff_job="$(git -C "$GIT_ROOT" diff --unified=0 2>/dev/null | grep -m 1 -oP 'JOB-[0-9]{3}' || true)"
        fi
        if [[ -n "$diff_job" ]]; then
            SUGGESTED_JOB_ID="$diff_job"
        fi
    fi

    # Strategy 4: Fallback summary generated from changed filenames
    if [[ -z "$SUGGESTED_MSG" ]]; then
        local changed_summary
        changed_summary="$(git -C "$GIT_ROOT" status --porcelain 2>/dev/null | awk '{print $2}' | xargs -n 1 basename 2>/dev/null | grep -vE '(\.md|\.desktop|\.sh|\.pid|\.txt)$' | head -n 3 | tr '\n' ', ' | sed 's/, $//' || true)"
        if [[ -n "$changed_summary" ]]; then
            SUGGESTED_MSG="Update ${changed_summary}"
        else
            SUGGESTED_MSG="Workspace updates and improvements"
        fi
    fi

    # Fallback body from git status file list if body is still empty
    if [[ -z "$SUGGESTED_BODY" ]]; then
        local changed_file_lines
        changed_file_lines="$(git -C "$GIT_ROOT" status --porcelain 2>/dev/null | head -n 10 || true)"
        if [[ -n "$changed_file_lines" ]]; then
            SUGGESTED_BODY="Modified Files:"$'\n'
            while IFS= read -r fline; do
                [[ -n "$fline" ]] && SUGGESTED_BODY+="• ${fline}"$'\n'
            done <<< "$changed_file_lines"
        fi
    fi
}

git_commit_and_push_dev() {
    local cli_flag="${1:-}"
    local cli_custom_msg="${2:-}"

    cd "$GIT_ROOT" || exit 1
    update_live_status

    if [[ "$STATE_GIT_DIRTY" -eq 0 ]]; then
        echo -e "${TAG_INFO} Working tree is clean. Nothing to commit."
        cd "$PROJECT_DIR" || true
        return 0
    fi

    local current_branch="${STATE_GIT_BRANCH:-dev}"

    echo -e "${C_BOLD}Changed files to be committed (${C_MAGENTA}${current_branch}${C_RESET}${C_BOLD}):${C_RESET}"
    git status -s
    echo ""

    # Auto-detect Job ID, Subject & Body dynamically from docs & git changes
    detect_suggested_commit_info

    local job_id="$SUGGESTED_JOB_ID"
    local commit_msg="$SUGGESTED_MSG"
    local commit_body="$SUGGESTED_BODY"

    # Handle direct non-interactive CLI flags (e.g. ./angle-dev-console.sh commit -y or commit "msg")
    if [[ "$cli_flag" == "-y" || "$cli_flag" == "--yes" || "$cli_flag" == "--auto" ]]; then
        echo -e "${TAG_INFO} Auto-committing with detailed metadata (-y)..."
    elif [[ -n "$cli_flag" && -n "$cli_custom_msg" && "$cli_flag" =~ ^JOB-[0-9]+ ]]; then
        job_id="$cli_flag"
        commit_msg="$cli_custom_msg"
        commit_body=""
    elif [[ -n "$cli_flag" ]]; then
        commit_msg="$cli_flag"
        commit_body=""
    else
        # Interactive Mode
        echo -e "${C_CYAN}${C_BOLD}Auto-Detected Commit Details:${C_RESET}"
        if [[ -n "$SUGGESTED_JOB_ID" ]]; then
            echo -e "  • ${C_BOLD}Job ID(s):${C_RESET} ${C_YELLOW}${SUGGESTED_JOB_ID}${C_RESET} ${C_DIM}(from docs/CHANGELOG.md / PROJECT_PLAN.md)${C_RESET}"
        else
            echo -e "  • ${C_BOLD}Job ID(s):${C_RESET} ${C_DIM}(none detected)${C_RESET}"
        fi
        echo -e "  • ${C_BOLD}Subject:${C_RESET}   ${C_WHITE}${SUGGESTED_MSG}${C_RESET}"
        if [[ -n "$SUGGESTED_BODY" ]]; then
            echo -e "  • ${C_BOLD}Detailed Highlights:${C_RESET}"
            while IFS= read -r bline; do
                [[ -n "$bline" ]] && echo -e "    ${C_DIM}${bline}${C_RESET}"
            done <<< "$SUGGESTED_BODY"
        fi
        echo ""

        # 1. Job ID prompt (press Enter to accept detected Job ID)
        if [[ -n "$SUGGESTED_JOB_ID" ]]; then
            echo -en "${C_YELLOW}Job ID [press Enter for '${SUGGESTED_JOB_ID}', or type 'none'/'custom']:${C_RESET} "
            read -r input_job
            if [[ -z "$input_job" ]]; then
                job_id="$SUGGESTED_JOB_ID"
            elif [[ "$input_job" =~ ^(none|no|n|-|skip)$ ]]; then
                job_id=""
            else
                job_id="$(echo "$input_job" | tr -d '"'\''')"
            fi
        else
            echo -en "${C_YELLOW}Enter optional Job ID (e.g. JOB-006, or press Enter to skip):${C_RESET} "
            read -r input_job
            job_id="$(echo "$input_job" | tr -d '"'\''')"
        fi

        # 2. Commit Message prompt (press Enter to accept detected message)
        echo -en "${C_YELLOW}Commit subject [press Enter for '${SUGGESTED_MSG}', or type custom]:${C_RESET} "
        read -r input_msg

        if [[ -z "$input_msg" ]]; then
            commit_msg="$SUGGESTED_MSG"
        elif [[ "$input_msg" == "cancel" || "$input_msg" == "c" ]]; then
            echo -e "${TAG_WARN} Commit cancelled."
            cd "$PROJECT_DIR" || true
            return 0
        else
            commit_msg="$input_msg"
        fi

        # Build final formatted subject
        local final_msg="$commit_msg"
        if [[ -n "$job_id" ]]; then
            final_msg="[${job_id}] ${commit_msg}"
        fi

        echo ""
        echo -e "${C_CYAN}------------------------------------------------------------------------------${C_RESET}"
        echo -e "  ${C_BOLD}Commit Subject:${C_RESET} ${C_GREEN}\"${final_msg}\"${C_RESET}"
        if [[ -n "$commit_body" ]]; then
            echo -e "  ${C_BOLD}Commit Body:${C_RESET}"
            while IFS= read -r bline; do
                [[ -n "$bline" ]] && echo -e "    ${C_DIM}${bline}${C_RESET}"
            done <<< "$commit_body"
        fi
        echo -e "${C_CYAN}------------------------------------------------------------------------------${C_RESET}"
        echo -en "  ${C_YELLOW}Proceed with commit & push to origin/${current_branch}? [Y/n]:${C_RESET} "
        read -r confirm_commit

        if [[ "$confirm_commit" == "n" || "$confirm_commit" == "N" || "$confirm_commit" == "cancel" ]]; then
            echo -e "${TAG_WARN} Commit cancelled."
            cd "$PROJECT_DIR" || true
            return 0
        fi
    fi

    local final_msg="$commit_msg"
    if [[ -n "$job_id" ]]; then
        final_msg="[${job_id}] ${commit_msg}"
    fi

    echo ""
    echo -e "${TAG_INFO} Staging changes across repository..."
    git add -A

    echo -e "${TAG_INFO} Committing: \"$final_msg\"..."
    local commit_success=0
    if [[ -n "$commit_body" ]]; then
        if git commit -m "$final_msg" -m "$commit_body"; then
            commit_success=1
        fi
    else
        if git commit -m "$final_msg"; then
            commit_success=1
        fi
    fi

    if [[ $commit_success -eq 1 ]]; then
        echo -e "${TAG_OK} Committed successfully with detailed highlights!"
    else
        echo -e "${TAG_FAIL} Git commit failed."
        cd "$PROJECT_DIR" || true
        return 1
    fi

    echo -e "${TAG_INFO} Pushing to origin/${current_branch}..."
    if git push origin "$current_branch"; then
        echo -e "${TAG_OK} Successfully pushed changes to origin/${current_branch}!"
    else
        echo -e "${TAG_FAIL} Failed to push to origin/${current_branch}."
        echo -e "  ${C_DIM}Hint: Run 'git pull origin ${current_branch}' to sync remote updates first.${C_RESET}"
        cd "$PROJECT_DIR" || true
        return 1
    fi

    cd "$PROJECT_DIR" || true
}

git_promote_dev_to_main() {
    cd "$GIT_ROOT" || exit 1
    update_live_status

    echo -e "${C_YELLOW}${C_BOLD}Promote 'dev' -> 'main' Release Protocol${C_RESET}"
    echo -e "This will verify checks on 'dev', merge 'dev' into 'main', push 'main', and return to 'dev'."
    echo ""

    if [[ "$STATE_GIT_DIRTY" -eq 1 ]]; then
        echo -e "${TAG_FAIL} You have uncommitted changes. Please commit or stash them first."
        cd "$PROJECT_DIR" || true
        return 1
    fi

    echo -en "${C_YELLOW}Are you sure you want to merge 'dev' into 'main'? (y/N):${C_RESET} "
    read -r confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        echo -e "${TAG_INFO} Operation cancelled."
        cd "$PROJECT_DIR" || true
        return 0
    fi

    # Ensure we are on dev branch before running validation
    if [[ "$STATE_GIT_BRANCH" != "dev" ]]; then
        echo -e "${TAG_INFO} Switching to 'dev' branch before validation..."
        if ! git checkout dev; then
            echo -e "${TAG_FAIL} Failed to checkout 'dev' branch."
            cd "$PROJECT_DIR" || true
            return 1
        fi
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
        cd "$PROJECT_DIR" || true
        return 1
    fi

    echo -e "${TAG_INFO} Step 3/5: Pulling latest 'main'..."
    git pull origin main 2>/dev/null || true

    echo -e "${TAG_INFO} Step 4/5: Merging 'dev' into 'main'..."
    if ! git merge dev -m "Merge dev into main [Automated via Dev Console]"; then
        echo -e "${TAG_FAIL} Merge conflict encountered! Resolve conflicts manually."
        cd "$PROJECT_DIR" || true
        return 1
    fi

    echo -e "${TAG_INFO} Step 5/5: Pushing 'main' to origin..."
    if ! git push origin main; then
        echo -e "${TAG_FAIL} Failed to push 'main' to origin."
        echo -e "${TAG_INFO} Returning to 'dev' branch..."
        git checkout dev 2>/dev/null || true
        cd "$PROJECT_DIR" || true
        return 1
    else
        echo -e "${TAG_OK} Successfully pushed merged 'main' to origin!"
    fi

    echo -e "${TAG_INFO} Returning to 'dev' branch..."
    git checkout dev
    echo -e "${TAG_OK} Release promote completed successfully!"
    cd "$PROJECT_DIR" || true
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
    cd "$PROJECT_DIR" || true
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
    cd "$PROJECT_DIR" || true
}

git_stash_pop() {
    cd "$GIT_ROOT" || exit 1
    echo -e "${TAG_INFO} Applying and removing most recent stash..."
    git stash pop
    cd "$PROJECT_DIR" || true
}

git_stash_list() {
    echo -e "${C_BOLD}Saved Git Stashes (${GIT_ROOT}):${C_RESET}"
    echo ""
    git -C "$GIT_ROOT" stash list
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
        commit)       git_commit_and_push_dev "$@" ;;
        help|--help|-h)
            echo "Usage: ./angle-dev-console.sh [command] [options]"
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
            echo "  commit      Interactive commit with auto-detected Job ID & message"
            echo "  commit -y   1-command auto-commit and push with detected Job ID & message"
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
