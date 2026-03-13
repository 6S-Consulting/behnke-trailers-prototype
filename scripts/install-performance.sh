#!/bin/bash

# Performance Optimization Setup Script
# This script installs required dependencies for performance monitoring

echo "🚀 Installing performance optimization dependencies..."

# Install web-vitals for Core Web Vitals tracking
npm install web-vitals

# Optional: Install terser for better minification (if not already included)
npm install -D terser

echo "✅ Dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm run build' to build with optimizations"
echo "2. Run 'npm run preview' to preview the build"
echo "3. Run Lighthouse on http://localhost:4173/"
echo ""
echo "📖 See LIGHTHOUSE_OPTIMIZATION.md for detailed guide"
