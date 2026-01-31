#!/bin/bash

echo "=== Fixing dfx startup issues ==="
echo ""

# Stop any running dfx processes
echo "Stopping any running dfx processes..."
dfx stop 2>/dev/null || true
pkill -f dfx 2>/dev/null || true
sleep 2

# Clean up .dfx directory (optional - comment out if you want to keep state)
echo "Cleaning up .dfx directory..."
rm -rf .dfx
mkdir -p .dfx

# Set dfx to use standard replica (not PocketIC)
echo "Configuring dfx to use standard replica..."
export DFX_REPLICA_PORT=8080

# Start dfx with standard replica
echo "Starting dfx with standard replica..."
dfx start --host 127.0.0.1:8080 --background

# Wait for replica to be ready
echo "Waiting for replica to start..."
sleep 10

# Check if dfx is running
if pgrep -f "dfx start" > /dev/null; then
    echo "✓ dfx replica is running!"
    echo ""
    echo "Now you can deploy:"
    echo "  dfx deploy"
else
    echo "✗ dfx failed to start. Trying alternative method..."
    echo ""
    echo "Trying to start with explicit configuration..."
    dfx start --host 127.0.0.1:8080 --clean
fi
