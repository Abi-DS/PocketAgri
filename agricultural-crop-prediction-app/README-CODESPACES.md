# GitHub Codespaces Setup Guide

## Quick Start (3 Steps!)

### Step 1: Push to GitHub

If you haven't already, initialize git and push:

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit - Agricultural Crop Prediction App"

# Create a new repository on GitHub (github.com/new)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Create Codespace

1. Go to your GitHub repository page
2. Click the green **"Code"** button (top right)
3. Click the **"Codespaces"** tab
4. Click **"Create codespace on main"**
5. Wait 2-3 minutes for the environment to set up

### Step 3: Install dfx and Run

Once your Codespace opens, run this in the terminal:

```bash
# Run the setup script
bash codespaces-setup.sh

# Or install manually:
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Verify it worked
dfx --version

# Start the local IC replica
dfx start --background

# Deploy your canister
dfx deploy

# Generate TypeScript bindings for frontend
dfx generate backend
```

## That's It! 🎉

Your project is now running in the cloud. You can:
- Access it from any browser
- No local installation needed
- Full dfx functionality

## Next Steps

### Run the Frontend (if available)

```bash
cd frontend
npm install
npm start
```

### Access Your Canister

After `dfx deploy`, you'll see output like:
```
Deployed canisters.
URLs:
  Backend: http://127.0.0.1:4943/?canisterId=...
```

## Tips

- **Free Tier:** 60 hours/month free for personal accounts
- **Auto-setup:** The `.devcontainer/devcontainer.json` will auto-install dfx when Codespace starts
- **Extensions:** Motoko language support is pre-configured
- **Persistence:** Your work is saved automatically

## Troubleshooting

If dfx isn't found after setup:
```bash
export PATH="$HOME/.local/bin:$PATH"
dfx --version
```

## Cost

- **Free:** 60 hours/month
- **After free tier:** $0.18/hour
- For development, free tier is usually enough!

---

**Need help?** Check the terminal output or see `SETUP.md` for more details.
