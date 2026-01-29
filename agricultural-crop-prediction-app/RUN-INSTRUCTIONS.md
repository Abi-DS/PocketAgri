# Run Instructions for Codespace

## Quick Start

In your Codespace terminal, run:

```bash
bash run-project.sh
```

This script will:
1. Install dfx (if not already installed)
2. Start the local IC replica
3. Deploy your canister
4. Generate TypeScript bindings

## Manual Steps (if you prefer)

```bash
# 1. Install dfx (if needed)
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
export PATH="$HOME/.local/bin:$PATH"

# 2. Verify installation
dfx --version

# 3. Start IC replica
dfx start --background

# 4. Deploy canister
dfx deploy

# 5. Generate TypeScript bindings
dfx generate backend
```

## After Deployment

You'll see output like:
```
Deployed canisters.
URLs:
  Backend: http://127.0.0.1:4943/?canisterId=...
```

## Useful Commands

- **Check canister ID**: `dfx canister id backend`
- **Stop replica**: `dfx stop`
- **View logs**: `dfx canister call backend <method_name>`
- **Check status**: `dfx canister status backend`

## Run Frontend (if available)

```bash
cd frontend
npm install
npm start
```

## Troubleshooting

If dfx is not found:
```bash
export PATH="$HOME/.local/bin:$PATH"
dfx --version
```

If port is already in use:
```bash
dfx stop
dfx start --background
```
