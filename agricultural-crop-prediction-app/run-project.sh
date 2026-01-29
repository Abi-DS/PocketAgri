#!/bin/bash

echo "=== Starting Agricultural Crop Prediction App ==="
echo ""

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "dfx not found. Installing..."
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    export PATH="$HOME/.local/bin:$PATH"
fi

# Verify dfx installation
echo "Checking dfx version..."
dfx --version

echo ""
echo "Starting local IC replica in background..."
dfx start --background

# Wait a moment for the replica to start
sleep 5

echo ""
echo "Deploying canister..."
dfx deploy

echo ""
echo "Generating TypeScript bindings..."
dfx generate backend

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your canister is deployed!"
echo ""
echo "To see canister URLs, run: dfx canister id backend"
echo ""
echo "To stop the replica, run: dfx stop"
echo ""
