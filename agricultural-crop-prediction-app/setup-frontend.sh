#!/bin/bash

echo "=== Setting Up Frontend ==="
echo ""

# Navigate to frontend directory
cd /workspaces/PocketAgri/agricultural-crop-prediction-app/frontend

if [ ! -f "package.json" ]; then
    echo "Error: package.json not found!"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "Found frontend at: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
else
    echo "Dependencies already installed. Skipping npm install."
fi

echo ""
echo "=== Frontend Setup Complete ==="
echo ""
echo "To start the frontend, run:"
echo "  cd /workspaces/PocketAgri/agricultural-crop-prediction-app/frontend"
echo "  npm start"
echo ""
echo "The frontend will start on port 3000"
echo ""
