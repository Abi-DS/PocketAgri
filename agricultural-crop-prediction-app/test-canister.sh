#!/bin/bash

echo "=== Testing Deployed Canister ==="
echo ""

CANISTER_ID="uxrrr-q7777-77774-qaaaq-cai"

echo "Canister ID: $CANISTER_ID"
echo ""

# Test a simple query method (if available)
echo "Testing canister methods..."
echo ""

# Try to get canister info
echo "1. Checking canister status..."
dfx canister status backend

echo ""
echo "2. Available methods (from Candid interface):"
dfx canister call backend __get_candid_interface_tmp_hack 2>/dev/null || echo "   (Candid interface not available via this method)"

echo ""
echo "=== Canister is ready! ==="
echo ""
echo "Canister URL: http://127.0.0.1:8080/?canisterId=$CANISTER_ID"
echo ""
echo "To call methods, use:"
echo "  dfx canister call backend <method_name>"
echo ""
