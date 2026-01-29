# Setup with GitHub Codespaces (Easiest Method!)

## Step-by-Step Guide

### 1. Push Code to GitHub

If you haven't already:

```powershell
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Create Codespace

1. Go to your GitHub repo
2. Click the green **"Code"** button
3. Click **"Codespaces"** tab
4. Click **"Create codespace on main"**
5. Wait 2-3 minutes for setup

### 3. Install dfx in Codespace

Once Codespace opens, in the terminal:

```bash
# Install dfx
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Verify
dfx --version

# Navigate to your project (if needed)
cd /workspaces/YOUR_REPO_NAME

# Start IC replica
dfx start --background

# Deploy
dfx deploy
```

### 4. Generate Frontend Bindings

```bash
dfx generate backend
```

### 5. Run Frontend (if you have one)

```bash
cd frontend
npm install
npm start
```

## Benefits

- ✅ No local installation needed
- ✅ Works on Windows/Mac/Linux
- ✅ Free tier: 60 hours/month
- ✅ Pre-configured Linux environment
- ✅ Full dfx functionality
- ✅ Can access from any browser

## Cost

- **Free:** 60 hours/month for personal accounts
- **Paid:** $0.18/hour after free tier

For development/testing, the free tier is usually enough!
