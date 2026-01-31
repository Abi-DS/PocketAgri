#!/bin/bash

echo "=== Getting Canister Access URL ==="
echo ""

cd /workspaces/PocketAgri/agricultural-crop-prediction-app 2>/dev/null || cd agricultural-crop-prediction-app 2>/dev/null || pwd

echo "1. Checking dfx info..."
dfx info

echo ""
echo "2. Getting canister ID..."
CANISTER_ID=$(dfx canister id backend 2>/dev/null)
if [ -z "$CANISTER_ID" ]; then
    echo "   Canister ID not found. Is it deployed?"
else
    echo "   Canister ID: $CANISTER_ID"
fi

echo ""
echo "3. Checking dfx processes..."
ps aux | grep dfx | grep -v grep || echo "   No dfx processes found"

echo ""
echo "=== Access URL ==="
if [ ! -z "$CANISTER_ID" ]; then
    echo ""
    echo "Your canister URL should be:"
    echo "  http://127.0.0.1:4943/?canisterId=$CANISTER_ID"
    echo ""
    echo "Or if using a different port (check dfx info above):"
    echo "  http://127.0.0.1:<PORT>/?canisterId=$CANISTER_ID"
    echo ""
    echo "Make sure to forward port 4943 in VS Code Ports tab!"
else
    echo "   Cannot determine URL - canister may not be deployed"
fi
