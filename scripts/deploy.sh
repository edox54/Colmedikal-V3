#!/bin/bash
# Script de deploy con auto-incremento de versión
# Uso: bash scripts/deploy.sh

set -e

METADATA_FILE="metadata.json"

# Leer versión actual
CURRENT=$(node -e "const m=require('./${METADATA_FILE}'); console.log(m.deployVersion || '1.0');")
MAJOR=$(echo "$CURRENT" | cut -d. -f1)
MINOR=$(echo "$CURRENT" | cut -d. -f2)

# Incrementar minor: 1.1 → 1.2 → ... → 1.90 → 2.0
MINOR=$((MINOR + 1))
if [ "$MINOR" -gt 90 ]; then
  MAJOR=$((MAJOR + 1))
  MINOR=0
fi

NEW_VERSION="${MAJOR}.${MINOR}"

# Actualizar metadata.json
node -e "
const fs = require('fs');
const m = JSON.parse(fs.readFileSync('${METADATA_FILE}', 'utf-8'));
m.deployVersion = '${NEW_VERSION}';
fs.writeFileSync('${METADATA_FILE}', JSON.stringify(m, null, 2) + '\n');
console.log('✅ Version bumped: ${CURRENT} → ${NEW_VERSION}');
"

# Commit y push del bump de versión
git add "${METADATA_FILE}"
git commit -m "deploy: bump version to V${NEW_VERSION}"
git push origin "$(git rev-parse --abbrev-ref HEAD)"

echo ""
echo "🚀 Versión lista: V${NEW_VERSION}"
echo ""
echo "Ahora en el servidor ejecuta:"
echo "  git pull origin \$(git rev-parse --abbrev-ref HEAD)"
echo "  npm run build && touch tmp/restart.txt"
