#!/bin/bash
set -e

echo "Building catd..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Clean previous builds
rm -f dist/catd

# Build the binary
echo "Compiling TypeScript to binary..."
bun build src/catd.ts --compile --outfile dist/catd

# Make it executable
chmod +x dist/catd

# Verify the build
if [ -f "dist/catd" ]; then
    echo "✅ Build successful!"
    echo "Binary created at: dist/catd"
    
    # Test the binary
    echo "Testing binary..."
    ./dist/catd --version
    
    echo ""
    echo "To install globally, run:"
    echo "  sudo cp dist/catd /usr/local/bin/"
else
    echo "❌ Build failed!"
    exit 1
fi 