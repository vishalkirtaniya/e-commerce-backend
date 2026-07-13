#!/usr/bin/env bash
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
EC2_USER="ubuntu"
EC2_HOST="43.205.211.233"
PEM_FILE="/home/shilpa/projects/resume/resume-autobot-key.pem"
REMOTE_DIR="~/e-com-backend"
SSH_CMD="ssh -i ${PEM_FILE} -o StrictHostKeyChecking=no"

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}▶ Syncing files to EC2...${NC}"
rsync -avz \
  --delete \
  --exclude=".git" \
  --exclude="node_modules" \
  --exclude="dist" \
  --exclude=".env" \
  --exclude=".qodo" \
  --exclude="graphify-out" \
  --exclude=".DS_Store" \
  -e "${SSH_CMD}" \
  ./ "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}"
echo -e "${GREEN}✓ Files synced${NC}"