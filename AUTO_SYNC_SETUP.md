# Auto-Sync Setup - Complete Remote Workflow

This setup enables a **completely remote deployment workflow** where all changes are automatically synced to GitHub and trigger GitHub Actions workflows.

## How It Works

1. **File Auto-Save**: VSCode is configured to auto-save files after 1 second of inactivity
2. **Auto-Commit & Push**: A background watcher monitors your repository for changes
3. **GitHub Actions**: Once changes are pushed, GitHub Actions automatically triggers build and deployment workflows
4. **Remote Execution**: All builds, tests, and deployments run on GitHub's infrastructure

## Setup Instructions

### Step 1: Start the Auto-Sync Watcher

Run this command in PowerShell (from the smasher directory or anywhere):

```powershell
powershell -ExecutionPolicy Bypass -NoProfile -File "d:\Dev\smasher\start-auto-sync.ps1"
```

This will:
- Launch a new PowerShell window
- Start the auto-sync watcher in the background
- Keep the window open so you can see what's happening

**That's it!** The watcher will now automatically:
- Detect file changes
- Commit changes with timestamps
- Push to GitHub
- Trigger GitHub Actions workflows

### Step 2: Work Normally in VSCode

Just edit your files as usual:
- Make changes in VSCode
- Files auto-save after 1 second
- Changes are automatically detected and committed
- Changes are automatically pushed to GitHub
- GitHub Actions workflows run remotely

### VSCode Configuration

The following files were created/updated:

- `.vscode/settings.json` - Enables auto-save (1 second delay)
- `.vscode/tasks.json` - Task for running auto-sync
- `auto-sync.ps1` - The watcher script
- `start-auto-sync.ps1` - Startup script

## Monitoring Deployment

To see your builds and deployments:

1. **GitHub Actions**: https://github.com/honkyhank82/Smasher/actions
2. **Workflow Runs**: Each commit will trigger the relevant workflows (Android build, Web deploy, etc.)
3. **Logs**: Click on any workflow run to see detailed logs

## Stopping Auto-Sync

Simply close the PowerShell window that's running the auto-sync watcher.

## Restart Auto-Sync

If you close the watcher window, just run the startup script again:

```powershell
powershell -ExecutionPolicy Bypass -NoProfile -File "d:\Dev\smasher\start-auto-sync.ps1"
```

## Workflow Overview

```
You edit file in VSCode
            ↓
File auto-saves (1 sec delay)
            ↓
Auto-sync watcher detects change
            ↓
Git commit with timestamp
            ↓
Git push to GitHub
            ↓
GitHub Actions triggers
            ↓
Build/Deploy runs on GitHub
            ↓
Results visible at github.com/honkyhank82/Smasher/actions
```

## Troubleshooting

### Changes aren't being committed
- Check the auto-sync PowerShell window for error messages
- Ensure your git is configured with credentials (run: `git config credential.helper`)
- Verify GitHub credentials are saved

### Git push failing
- Run `git push origin master` manually to diagnose
- Check GitHub authentication
- Verify your SSH key or personal access token is configured

### No workflows triggering
- Go to https://github.com/honkyhank82/Smasher/actions
- Check if workflows are enabled
- Review the workflow files in `.github/workflows/`

---

**Status**: Complete Remote Workflow Enabled  
**Everything runs remotely on GitHub Actions**