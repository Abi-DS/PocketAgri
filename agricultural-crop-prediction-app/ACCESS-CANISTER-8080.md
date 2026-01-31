# Accessing Your Canister on Port 8080

## Your Setup
- HTTP Gateway Port: **8080**
- Canister ID: `uxrrr-q7777-77774-qaaaq-cai`
- Forwarded Ports: 40117, 45597

## Find Which Port Maps to 8080

1. Open VS Code **"Ports"** tab
2. Look for a port that shows it's forwarding to **8080**
3. It will show something like: `8080 → 40117` or `8080 → 45597`

## Access Your Canister

Use the forwarded port URL:

**If 40117 maps to 8080:**
```
http://localhost:40117/?canisterId=uxrrr-q7777-77774-qaaaq-cai
```

**If 45597 maps to 8080:**
```
http://localhost:45597/?canisterId=uxrrr-q7777-77774-qaaaq-cai
```

## If Port 8080 Isn't Forwarded

1. In VS Code Ports tab, click **"+"**
2. Enter **8080**
3. Click **"Forward"** or **"Make Public"**
4. Use the new forwarded port URL

## Quick Test

Try both URLs in your browser:
- `http://localhost:40117/?canisterId=uxrrr-q7777-77774-qaaaq-cai`
- `http://localhost:45597/?canisterId=uxrrr-q7777-77774-qaaaq-cai`

One of them should work!

## Alternative: Use Simple Browser in VS Code

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
2. Type "Simple Browser"
3. Enter: `http://localhost:40117/?canisterId=uxrrr-q7777-77774-qaaaq-cai`
   (or try 45597 if 40117 doesn't work)
