# How to Access Your Canister

## The Issue
The canister is accessed through dfx's HTTP gateway, not directly on port 8080.

## Correct Access Methods

### Method 1: Use dfx HTTP Gateway (Port 4943)

dfx runs an HTTP gateway on port **4943** (not 8080). 

1. **Forward port 4943** in VS Code:
   - Open "Ports" tab
   - Find port **4943**
   - Click "Forward" or "Make Public"

2. **Access URL:**
   ```
   http://127.0.0.1:4943/?canisterId=uxrrr-q7777-77774-qaaaq-cai
   ```

### Method 2: Check Actual Gateway Port

Run this in your Codespace to find the correct port:

```bash
cd /workspaces/PocketAgri/agricultural-crop-prediction-app
dfx canister id backend
dfx info
```

This will show you the actual gateway URL.

### Method 3: Use dfx to Get the URL

```bash
# This will show the deployment URLs
dfx deploy --no-wallet
```

Look for output like:
```
Deployed canisters.
URLs:
  Backend: http://127.0.0.1:4943/?canisterId=uxrrr-q7777-77774-qaaaq-cai
```

## Quick Fix Commands

Run these in your Codespace:

```bash
cd /workspaces/PocketAgri/agricultural-crop-prediction-app

# Check what ports dfx is using
dfx info

# Get the canister URL
dfx canister id backend

# The URL format should be:
# http://127.0.0.1:4943/?canisterId=<canister-id>
```

## Port Forwarding Setup

1. In VS Code "Ports" tab, forward:
   - **Port 4943** (dfx HTTP gateway)
   - **Port 8080** (dfx replica - optional)

2. Use the forwarded URL for port 4943

## Note
Port 8080 is for the replica control interface, not for accessing canisters. The HTTP gateway on port 4943 is what serves your canister.
