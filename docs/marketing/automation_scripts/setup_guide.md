# Propure Marketing Automation Setup Guide (OpenCode)

This guide will help your team set up the complete automation system using **OpenCode** for zero-budget marketing at scale.

---

## 🎯 SETUP OVERVIEW

**What you'll build:**

- AI-powered content generation at scale
- Automated posting via Python scripts + Playwright
- Multi-account management across platforms
- Complete hands-off marketing execution

**Time to setup:** 1-2 hours
**Technical skill required:** Basic (can copy/paste commands)

---

## 📋 STEP 1: INSTALL REQUIRED SOFTWARE

### 1.1 Install OpenCode CLI

```bash
# Install OpenCode globally
npm install -g opencode

# Verify installation
opencode --version
```

### 1.2 Install Python Dependencies

```bash
# Check if Python is installed:
python3 --version

# If not installed, download from: https://www.python.org/downloads/
# Install version 3.10 or higher

# Install required packages
pip install praw playwright aiohttp python-dotenv

# Install Playwright browsers (for browser automation)
playwright install chromium
```

### 1.3 Setup Environment Variables

Create `.env` file in `automation_scripts/`:

```bash
# Reddit API Credentials (per account)
REDDIT_CLIENT_ID_1=your_client_id
REDDIT_CLIENT_SECRET_1=your_client_secret
REDDIT_USERNAME_1=your_username
REDDIT_PASSWORD_1=your_password

# Add more accounts as needed
REDDIT_CLIENT_ID_2=...
```

---

## 📋 STEP 2: CONFIGURE OPENCODE

### 2.1 Project Setup

OpenCode will automatically read `AGENTS.md` in the project root for context.

### 2.2 Verify OpenCode is Working

```bash
# Start OpenCode
opencode

# Test with a simple command
> Generate a Reddit comment about property investing
```

---

## 📋 STEP 3: CREATE ACCOUNTS

### 3.1 Reddit API Setup (Required for Automation)

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - **Name:** PropureMarketing
   - **Type:** script
   - **Redirect URI:** http://localhost:8080
4. Note down `client_id` (under app name) and `client_secret`
5. Add to `.env` file

### 3.2 Account Tracking

Use `account_tracker_template.csv` to track all accounts:

- Update credentials after creating each account
- Track karma/follower counts weekly
- Mark inactive accounts

---

## 📋 STEP 4: CONTENT GENERATION WORKFLOW

### 4.1 Generate Content with OpenCode

```bash
# Start OpenCode
opencode

# Generate Reddit comments
> Generate 10 unique Reddit comments about rental property investing.
> Each should be 2-3 sentences, conversational, and provide genuine value.
> Vary the perspectives: some as experienced investor, some as beginner asking follow-ups.
> Save to automation_scripts/content/reddit_comments_$(date +%Y%m%d).txt

# Generate Twitter content
> Generate 5 Twitter threads about property investment mistakes.
> Each thread should be 5-7 tweets, with hooks and CTAs.
> Save to automation_scripts/content/twitter_threads_$(date +%Y%m%d).txt
```

### 4.2 Batch Content Generation

```bash
# In OpenCode:
> Execute daily content generation routine:
> 1. Generate 20 Reddit comments (mix of helpful advice and questions)
> 2. Generate 10 Reddit post ideas with full content
> 3. Generate 5 Twitter threads
> 4. Generate 3 LinkedIn posts
> Save all to automation_scripts/content/[date]/ folder
```

---

## 📋 STEP 5: AUTOMATED POSTING

### 5.1 Reddit Posting (via Python Script)

```bash
# Edit reddit_automation.py with your credentials
# Then run:
python automation_scripts/reddit_automation.py

# Or tell OpenCode to run it:
> Run reddit_automation.py with the comments from content/reddit_comments_20260116.txt
```

### 5.2 Manual Posting Workflow

For platforms without API access (Instagram, TikTok, LinkedIn):

1. OpenCode generates content and saves to files
2. You copy/paste content to platforms
3. Track posts in activity log

---

## 📋 STEP 6: DAILY WORKFLOW

### 6.1 Morning Routine (In OpenCode)

```
> Execute morning marketing routine:

1. CONTENT GENERATION:
   - Generate 15 Reddit comments for different subreddits
   - Generate 3 Reddit posts with titles and content
   - Generate 5 tweets

2. SAVE CONTENT:
   - Save to automation_scripts/content/$(date +%Y%m%d)/

3. PREPARE POSTING:
   - Create posting schedule with timestamps
   - Assign accounts to each piece of content

Report when ready.
```

### 6.2 Execute Posting

```bash
# Run the Reddit automation script
python automation_scripts/reddit_automation.py

# Or manually post other platform content from saved files
```

### 6.3 Evening Review

```
> Review today's marketing activity:
> 1. Check automation_scripts/logs/ for posting results
> 2. Summarize what was posted where
> 3. Note any errors or issues
> 4. Prepare tomorrow's content queue
```

---

## 📋 STEP 7: MONITORING & OPTIMIZATION

### 7.1 Daily Check-In

```
> Marketing status report:
> - Read logs from automation_scripts/logs/
> - Count posts by platform
> - Note any failures
> - Recommendations for improvement
```

### 7.2 Weekly Review

```
> Weekly marketing analysis:
> - Analyze last 7 days of logs
> - Which content types worked best?
> - Which platforms had issues?
> - Generate 10 new content ideas based on patterns
> - Create next week's content themes
```

---

## 🎯 QUICK START COMMANDS (OpenCode)

### Generate Content Only

```
> Generate 10 Reddit comments about [topic]. Save to file.
```

### Full Daily Routine

```
> Execute full daily marketing content generation.
> Save all content to automation_scripts/content/[today's date]/
> Create posting schedule.
```

### Run Automation Script

```
> Run reddit_automation.py with content from today's folder
```

---

## 🔧 TROUBLESHOOTING

### Issue: Reddit API errors

**Solution:**

- Verify client_id and client_secret are correct
- Check account isn't rate-limited
- Ensure OAuth setup is for "script" type app

### Issue: Content sounds too AI

**Solution:**

- Ask OpenCode to rewrite with more casual tone
- Add specific personal anecdotes in prompts
- Use "sound like a real Reddit user" in generation prompts

### Issue: Accounts getting banned

**Solution:**

- Increase delays between posts (5-10 min minimum)
- Reduce volume by 50%
- Build karma on generic subreddits first
- Don't post identical content across accounts

---

## 📂 FOLDER STRUCTURE

```
automation_scripts/
├── setup_guide.md          # This file
├── mcp_prompts.md          # OpenCode command templates
├── reddit_automation.py    # Reddit posting script
├── account_tracker_template.csv
├── .env                    # Your credentials (git-ignored)
├── content/                # Generated content
│   └── YYYYMMDD/          # Daily folders
│       ├── reddit_comments.txt
│       ├── reddit_posts.txt
│       ├── twitter_threads.txt
│       └── linkedin_posts.txt
└── logs/                   # Automation logs
    └── YYYYMMDD.log
```

---

## ✅ YOU'RE READY!

You now have a complete marketing automation system that:

- ✅ Generates content at scale using OpenCode
- ✅ Automates Reddit posting via Python
- ✅ Organizes content for manual posting on other platforms
- ✅ Tracks all accounts in one place
- ✅ Costs $0 in tools
- ✅ Runs with minimal daily effort

Just tell OpenCode: **"Execute daily marketing routine"** and you're set! 🎉
