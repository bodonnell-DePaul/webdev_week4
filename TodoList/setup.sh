#!/bin/bash

# TodoList Application Setup Script

echo "🚀 Setting up TodoList Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Navigate to frontend directory
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 TodoList Application is ready!"
    echo ""
    echo "To start development server:"
    echo "  npm run dev"
    echo ""
    echo "To build for production:"
    echo "  npm run build"
    echo ""
    echo "To preview production build:"
    echo "  npm run preview"
    echo ""
    echo "📱 The application will be available at http://localhost:5173"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
