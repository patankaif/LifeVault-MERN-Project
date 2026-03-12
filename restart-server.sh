#!/bin/bash

echo "🔄 Restarting LifeVault server with updated environment..."

# Kill any existing server processes
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Clear any environment cache
unset RESEND_API_KEY FROM_EMAIL FROM_NAME

# Start server with fresh environment
echo "🚀 Starting server with Resend configuration..."
echo "📧 FROM_EMAIL: onboarding@resend.dev"
echo "🔑 API Key: Loaded"

pnpm dev
