#!/bin/bash

# Image Optimization Audit Script
# Finds all <img> tags that could be optimized

echo "🔍 Scanning for images that need optimization..."
echo ""

# Find all TSX files with <img tags
echo "📊 Image usage in components:"
echo "================================"

grep -r --include="*.tsx" "<img" src/ | \
  grep -v "OptimizedImage" | \
  grep -v "node_modules" | \
  sed 's/:.*<img/: <img/' | \
  head -n 30

echo ""
echo "================================"
echo ""

# Count total images
total=$(grep -r --include="*.tsx" "<img" src/ | grep -v "OptimizedImage" | grep -v "node_modules" | wc -l | tr -d ' ')
echo "📈 Summary:"
echo "- Total <img> tags found: $total"
echo "- Files to review: $(grep -r --include="*.tsx" -l "<img" src/ | grep -v "node_modules" | wc -l | tr -d ' ')"
echo ""

echo "💡 Recommendation:"
echo "Replace <img> with OptimizedImage component to:"
echo "  - Prevent layout shifts (CLS)"
echo "  - Enable lazy loading"
echo "  - Improve performance score"
echo ""
echo "Example replacement:"
echo "  Before: <img src={url} alt=\"text\" />"
echo "  After:  <OptimizedImage src={url} alt=\"text\" width={400} height={300} />"
echo ""
echo "📖 See LIGHTHOUSE_OPTIMIZATION.md for detailed guide"
