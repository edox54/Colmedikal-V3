#!/bin/bash
# Auto-deploy for colmedikal.com, run by cPanel Cron every minute:
#   * * * * * /bin/bash $HOME/colmedikal.com/scripts/auto-deploy.sh >> $HOME/auto-deploy.log 2>&1
# Pulls the deployed branch only when GitHub has a new commit, then restarts the Node app.
# dist/ is built locally and committed — never build here (CloudLinux LVE kills `vite build`).
set -u
APP=colmedikal.com
DIR="$HOME/$APP"
BRANCH=security/jwt-tokens-and-hardening
LOCK="$HOME/.auto-deploy.lock"

# Skip if the previous run is still going
exec 9>"$LOCK"
flock -n 9 || exit 0

cd "$DIR" || exit 1
git fetch -q origin "$BRANCH" || { echo "$(date '+%F %T') fetch failed"; exit 1; }
[ "$(git rev-parse HEAD)" = "$(git rev-parse "origin/$BRANCH")" ] && exit 0

echo "$(date '+%F %T') new commit $(git rev-parse --short "origin/$BRANCH"), deploying"
OLD_LOCK=$(git rev-parse HEAD:package-lock.json 2>/dev/null)
git pull -q --ff-only origin "$BRANCH" || { echo "pull failed (local changes on server?)"; exit 1; }

if [ "$OLD_LOCK" != "$(git rev-parse HEAD:package-lock.json 2>/dev/null)" ]; then
  source "$HOME/nodevenv/$APP/20/bin/activate" && npm install --no-audit --no-fund
fi

cloudlinux-selector restart --json --interpreter nodejs --user "$(whoami)" --app-root "$APP"
echo
