#!/bin/bash

echo "🚀 Workflow Builder - Setup Script"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL command line tools not found. Make sure PostgreSQL is installed."
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Create PostgreSQL database:"
echo "   createdb workflow_builder"
echo ""
echo "2. Configure environment variables:"
echo "   cp backend/env.example backend/.env"
echo "   # Edit backend/.env with your configuration"
echo ""
echo "3. Run database migrations:"
echo "   cd backend && npm run migrate && npm run seed"
echo ""
echo "4. Start development servers:"
echo "   # Terminal 1"
echo "   cd backend && npm run dev"
echo ""
echo "   # Terminal 2"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Open http://localhost:5173 in your browser"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo ""
echo "🎉 Setup complete!"
