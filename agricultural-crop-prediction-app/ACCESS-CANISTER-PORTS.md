# Accessing Your Canister via Forwarded Ports

## Understanding the Ports

The ports you see (40117, 45597) are **forwarded ports** in Codespaces. They map to internal ports.

## Finding the Correct Canister URL

### Step 1: Get the Internal Gateway Port

Run this in your Codespace terminal:

```bash
cd /workspaces/PocketAgri/agricultural-crop-prediction-app
dfx info
```

Look for output like:
```
Local network configuration:
  bind: 127.0.0.1:8080
  http gateway: http://127.0.0.1:4943
```

The HTTP gateway port is usually **4943**.

### Step 2: Check Forwarded Ports

1. In VS Code, open the **"Ports"** tab
2. Look for a port that maps to **4943** (the dfx HTTP gateway)
3. If port 4943 isn't forwarded, add it:
   - Click the **"+"** button
   - Enter **4943**
   - Click "Forward"

### Step 3: Use the Forwarded URL

If port 4943 is forwarded to port 40117 (for example), use:

```
http://localhost:40117/?canisterId=uxrrr-q7777-77774-qaaaq-cai
```

Or if it's forwarded to 45597:

```
http://localhost:45597/?canisterId=uxrrr-q7777-77774-qaaaq-cai
```

## Quick Check Script

Run this to find the correct URL:

```bash
cd /workspaces/PocketAgri/agricultural-crop-prediction-app
bash get-canister-url.sh
```

## Alternative: Check Deployment Output

When you ran `dfx deploy`, it should have shown:

```
Deployed canisters.
URLs:
  Backend: http://127.0.0.1:4943/?canisterId=uxrrr-q7777-77774-qaaaq-cai
```

Then:
1. Forward port **4943** in VS Code Ports tab
2. Use the forwarded port URL (e.g., `http://localhost:40117/?canisterId=...`)

## Note

- Port **8080** = Replica control (not for canister access)
- Port **4943** = HTTP gateway (for canister access)
- Ports **40117, 45597** = Forwarded ports (check which maps to 4943)
