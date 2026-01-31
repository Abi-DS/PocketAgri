#!/bin/bash

echo "=== Starting Frontend ==="
echo ""

cd /workspaces/PocketAgri/agricultural-crop-prediction-app/build-template/src/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies first..."
    npm install
fi

echo ""
echo "Starting frontend dev server..."
echo "The frontend will be available on port 3000"
echo "Make sure to forward port 3000 in VS Code Ports tab!"
echo ""

npm start
