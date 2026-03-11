#!/bin/bash

# SCTMC Setup Script

echo "🚀 Starting SCTMC setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18+) to continue."
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm to continue."
    exit 1
fi

echo "✅ npm detected: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully."
else
    echo "❌ Failed to install dependencies."
    exit 1
fi

# Set up environment variables
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env-example..."
    cp .env-example .env
    echo "✅ .env created. Please update it with your Firebase configuration."
else
    echo "ℹ️ .env file already exists, skipping creation."
fi

echo "🎉 Setup complete! You can now run 'npm run dev' to start the application."
echo "💡 To configure Firebase, check the FIREBASE_SETUP.md file (if available) or update your .env file."
