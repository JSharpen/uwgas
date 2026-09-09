#!/bin/bash
while true; do
    clear
    echo "Time: $(date)"
    echo "1) Option 1"
    echo "0) Exit"
    echo -n "Choice: "
    read -t 2 -n 1 -r choice || true
    [[ -n "$choice" ]] && echo ""
    case "$choice" in
        "") continue ;;
        1) echo "You picked 1"; sleep 1 ;;
        0) break ;;
        *) echo "Invalid"; sleep 1 ;;
    esac
done
