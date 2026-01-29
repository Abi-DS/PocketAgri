#!/bin/bash

echo "=== Setting up Internet Computer Development Environment ==="
echo ""

# Install dfx
echo "Installing dfx SDK..."
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Verify installation
echo ""
echo "Verifying installation..."
dfx --version

# Add dfx to PATH for this session
export PATH="$HOME/.local/bin:$PATH"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "You can now run:"
echo "  dfx start --background"
echo "  dfx deploy"
echo ""
