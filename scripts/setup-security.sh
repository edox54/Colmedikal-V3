#!/bin/bash

# Colmedikal-V3 Security Setup Script
# This script helps configure required environment variables securely

echo "================================"
echo "Colmedikal-V3 Security Setup"
echo "================================"
echo ""

# Check if .env already exists
if [ -f .env ]; then
  echo "⚠️  .env file already exists"
  read -p "Overwrite it? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 1
  fi
fi

# Generate JWT_SECRET
echo "🔐 Generating JWT_SECRET..."
JWT_SECRET=$(openssl rand -base64 32)
echo "✅ JWT_SECRET generated: ${JWT_SECRET:0:20}..."

# Get DASHBOARD_PASSWORD from user
echo ""
echo "🔑 Enter DASHBOARD_PASSWORD:"
echo "   (Minimum 16 characters, must include: uppercase, lowercase, numbers, symbols)"
read -sp "Password: " DASHBOARD_PASSWORD
echo

# Validate password strength
PASSWORD_LENGTH=${#DASHBOARD_PASSWORD}
if [ $PASSWORD_LENGTH -lt 16 ]; then
  echo "❌ Password is too short (minimum 16 characters)"
  exit 1
fi

if ! echo "$DASHBOARD_PASSWORD" | grep -q '[A-Z]'; then
  echo "❌ Password must include uppercase letters"
  exit 1
fi

if ! echo "$DASHBOARD_PASSWORD" | grep -q '[a-z]'; then
  echo "❌ Password must include lowercase letters"
  exit 1
fi

if ! echo "$DASHBOARD_PASSWORD" | grep -q '[0-9]'; then
  echo "❌ Password must include numbers"
  exit 1
fi

if ! echo "$DASHBOARD_PASSWORD" | grep -q '[!@#$%^&*()_+\-=\[\]{};:'"'"',.<>?]'; then
  echo "❌ Password must include special characters (!@#$%^&* etc)"
  exit 1
fi

echo "✅ Password strength validated"

# Create .env file
echo ""
echo "📝 Creating .env file..."
cat > .env << EOF
# ====================================
# Colmedikal-V3 Security Configuration
# ====================================

# JWT Secret for token signing (REQUIRED)
# Generated: $(date)
JWT_SECRET=$JWT_SECRET

# Dashboard Login Password (REQUIRED)
DASHBOARD_PASSWORD=$DASHBOARD_PASSWORD

# Environment mode
NODE_ENV=production

# Optional: API base URL
# API_BASE_URL=https://api.colmedikal.com
EOF

chmod 600 .env

echo "✅ .env file created with permissions 600 (read-only for owner)"

# Verify .gitignore
echo ""
echo "🔍 Checking .gitignore..."
if grep -q "\.env" .gitignore 2>/dev/null; then
  echo "✅ .env already in .gitignore"
else
  echo ".env" >> .gitignore
  echo "✅ Added .env to .gitignore"
fi

# Summary
echo ""
echo "================================"
echo "✅ Security Setup Complete!"
echo "================================"
echo ""
echo "📋 Summary:"
echo "  ✓ JWT_SECRET generated and stored in .env"
echo "  ✓ DASHBOARD_PASSWORD configured in .env"
echo "  ✓ .env permissions set to 600 (read-only)"
echo "  ✓ .env added to .gitignore"
echo ""
echo "🚀 Next steps:"
echo "  1. npm install          (install new security dependencies)"
echo "  2. npm run build        (build the application)"
echo "  3. npm start            (start the server)"
echo ""
echo "⚠️  IMPORTANT:"
echo "  - NEVER commit .env to git"
echo "  - NEVER share JWT_SECRET or DASHBOARD_PASSWORD"
echo "  - NEVER change JWT_SECRET after tokens are issued"
echo "  - Keep .env file in a secure location"
echo ""
echo "📖 For more info, read SECURITY.md or CAMBIOS-SEGURIDAD.md"
echo ""
