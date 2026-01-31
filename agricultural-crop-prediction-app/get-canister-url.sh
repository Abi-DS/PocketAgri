#!/bin/bash

echo "=== Getting Canister Access URL ==="
echo ""

cd /workspaces/PocketAgri/agricultural-crop-prediction-app 2>/dev/null || cd agricultural-crop-prediction-app 2>/dev/null || pwd

echo "1. Getting HTTP gateway port..."
GATEWAY_PORT=$(dfx info webserver-port 2>/dev/null | tr -d '\n' || echo "4943")
echo "   HTTP Gateway Port: $GATEWAY_PORT"

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
    echo "Your canister URL (internal):"
    echo "  http://127.0.0.1:$GATEWAY_PORT/?canisterId=$CANISTER_ID"
    echo ""
    echo "To access from browser:"
    echo "  1. Forward port $GATEWAY_PORT in VS Code Ports tab"
    echo "  2. Use the forwarded port URL (e.g., http://localhost:40117/?canisterId=$CANISTER_ID)"
    echo ""
    echo "Check VS Code Ports tab to see which port maps to $GATEWAY_PORT"
else
    echo "   Cannot determine URL - canister may not be deployed"
fi
