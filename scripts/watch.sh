#!/bin/bash

# Configuration
WATCH_DIR="$(cd .. && pwd)"
REPO_DIR="$(pwd)"
ARTICLES_DIR="$REPO_DIR/InvesThinking/articles"

echo "Watching directory: $WATCH_DIR for markdown changes..."
echo "Syncing to: $ARTICLES_DIR"

# Wait function for debounce
debounce() {
  sleep 30
}

# Run fswatch to listen for changes
fswatch -o "$WATCH_DIR" -e "InvesThinking" -e ".git" | while read num; do
  echo "Detected changes. Waiting 30s to debounce..."
  debounce
  
  echo "Syncing markdown files..."
  rsync -av --delete --exclude 'InvesThinking' --exclude '.git' --include '*/' --include '*.md' --exclude '*' "$WATCH_DIR/" "$ARTICLES_DIR/"
  
  cd "$REPO_DIR" || exit
  git add InvesThinking/articles/
  git commit -m "📝 Update articles $(date '+%Y-%m-%d %H:%M')"
  
  echo "Pushing to GitHub..."
  git push origin main
done
