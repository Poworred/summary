#!/bin/bash

# Auto-sync script
# Checks for changes every 2 seconds and pushes them to GitHub

echo "🚀 Starting Auto-Sync..."
echo "Press [CTRL+C] to stop."

while true; do
    if [[ -n $(git status -s) ]]; then
        echo "🔄  Changes detected. Syncing to GitHub..."
        git add .
        git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        echo "✅  Synced!"
    fi
    sleep 2
done
