"""
Reddit Automation Script for Propure Marketing

Setup:
    pip install praw python-dotenv

Usage:
    python reddit_automation.py                      # Interactive mode
    python reddit_automation.py --file comments.txt  # Read from file
    python reddit_automation.py --dry-run            # Test without posting
"""

import praw
import random
import time
import os
import argparse
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

TARGET_SUBREDDITS = [
    "realestateinvesting",
    "RealEstate",
    "investing",
    "financialindependence",
    "AusPropertyChat",
    "AusFinance",
    "passive_income",
]


def get_reddit_accounts():
    accounts = []
    i = 1
    while True:
        client_id = os.getenv(f"REDDIT_CLIENT_ID_{i}")
        if not client_id:
            break
        accounts.append({
            "username": os.getenv(f"REDDIT_USERNAME_{i}"),
            "password": os.getenv(f"REDDIT_PASSWORD_{i}"),
            "client_id": client_id,
            "client_secret": os.getenv(f"REDDIT_CLIENT_SECRET_{i}"),
        })
        i += 1
    return accounts


def create_reddit_instance(account_config):
    return praw.Reddit(
        client_id=account_config["client_id"],
        client_secret=account_config["client_secret"],
        username=account_config["username"],
        password=account_config["password"],
        user_agent="PropureMarketing/2.0 (OpenCode Integration)"
    )


def find_relevant_post(reddit, subreddit_name, max_posts=20):
    subreddit = reddit.subreddit(subreddit_name)
    
    for submission in subreddit.hot(limit=max_posts):
        submission.comments.replace_more(limit=0)
        already_commented = any(
            comment.author and comment.author.name == reddit.user.me().name 
            for comment in submission.comments.list()
        )
        if already_commented:
            continue
        if submission.locked or submission.archived:
            continue
        return submission
    
    return None


def post_comment(reddit, subreddit_name, comment_text, dry_run=False):
    submission = find_relevant_post(reddit, subreddit_name)
    
    if not submission:
        print(f"  ⚠️  No suitable posts found in r/{subreddit_name}")
        return False
    
    if dry_run:
        print(f"  [DRY RUN] Would comment on: {submission.title[:60]}...")
        print(f"  [DRY RUN] Comment: {comment_text[:100]}...")
        return True
    
    try:
        submission.reply(comment_text)
        print(f"  ✓ Commented on: {submission.title[:60]}...")
        return True
    except Exception as e:
        print(f"  ✗ Error posting comment: {e}")
        return False


def post_submission(reddit, subreddit_name, title, content, dry_run=False):
    subreddit = reddit.subreddit(subreddit_name)
    
    if dry_run:
        print(f"  [DRY RUN] Would post to r/{subreddit_name}: {title[:60]}...")
        return None
    
    try:
        submission = subreddit.submit(title, selftext=content)
        print(f"  ✓ Posted: {title[:60]}...")
        return submission
    except Exception as e:
        print(f"  ✗ Error posting: {e}")
        return None


def load_comments_from_file(filepath):
    if not os.path.exists(filepath):
        print(f"Error: File not found: {filepath}")
        return []
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    comments = [c.strip() for c in content.split('---') if c.strip()]
    return comments


def log_activity(message, log_dir=None):
    if log_dir is None:
        log_dir = Path(__file__).parent / "logs"
    
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"{datetime.now().strftime('%Y%m%d')}.log"
    
    timestamp = datetime.now().strftime('%H:%M:%S')
    with open(log_file, 'a') as f:
        f.write(f"[{timestamp}] {message}\n")


def daily_routine(account_config, comments, dry_run=False):
    reddit = create_reddit_instance(account_config)
    username = account_config['username']
    
    print(f"\n{'='*60}")
    print(f"Account: {username} {'[DRY RUN]' if dry_run else ''}")
    print(f"{'='*60}\n")
    
    log_activity(f"Starting routine for {username}")
    
    comments_posted = 0
    subreddits_used = []
    
    shuffled_subreddits = TARGET_SUBREDDITS.copy()
    random.shuffle(shuffled_subreddits)
    
    for i, subreddit in enumerate(shuffled_subreddits):
        if comments_posted >= len(comments):
            break
        
        comment = comments[comments_posted]
        print(f"[{comments_posted + 1}/{len(comments)}] Posting to r/{subreddit}")
        
        if post_comment(reddit, subreddit, comment, dry_run=dry_run):
            comments_posted += 1
            subreddits_used.append(subreddit)
            log_activity(f"Posted comment in r/{subreddit}")
            
            if comments_posted < len(comments) and not dry_run:
                delay_seconds = random.randint(120, 300)
                print(f"  ⏳ Waiting {delay_seconds // 60}m {delay_seconds % 60}s before next comment...")
                time.sleep(delay_seconds)
    
    print(f"\n{'='*60}")
    print(f"✓ Routine complete for {username}")
    print(f"  Posted: {comments_posted}/{len(comments)} comments")
    print(f"  Subreddits: {', '.join(subreddits_used)}")
    print(f"{'='*60}\n")
    
    log_activity(f"Completed: {comments_posted} comments in {', '.join(subreddits_used)}")
    
    return comments_posted


def main():
    parser = argparse.ArgumentParser(description='Reddit automation for Propure marketing')
    parser.add_argument('--file', '-f', help='Path to file with comments (separated by ---)')
    parser.add_argument('--dry-run', action='store_true', help='Test without actually posting')
    parser.add_argument('--account', '-a', type=int, default=1, help='Account number to use (default: 1)')
    args = parser.parse_args()
    
    accounts = get_reddit_accounts()
    
    if not accounts:
        print("⚠️  No Reddit accounts configured!")
        print("\nSetup Instructions:")
        print("1. Create Reddit app at: https://www.reddit.com/prefs/apps")
        print("2. Choose 'script' as app type")
        print("3. Create .env file in automation_scripts/ with:")
        print("   REDDIT_CLIENT_ID_1=your_client_id")
        print("   REDDIT_CLIENT_SECRET_1=your_client_secret")
        print("   REDDIT_USERNAME_1=your_username")
        print("   REDDIT_PASSWORD_1=your_password")
        return
    
    if args.file:
        comments = load_comments_from_file(args.file)
    else:
        today = datetime.now().strftime('%Y%m%d')
        default_path = Path(__file__).parent / "content" / today / "reddit_comments.txt"
        
        if default_path.exists():
            comments = load_comments_from_file(str(default_path))
        else:
            comments = [
                "Great question! When I started investing, I found that focusing on cash flow first gave me more flexibility. The numbers really matter - I always aim for at least 5% gross yield.",
                "I had a similar experience with my first property. The key lesson was to factor in all expenses - not just the obvious ones. Maintenance costs can really eat into your returns.",
                "Interesting perspective. In my market (Australia), we're seeing similar trends. The key is understanding local vacancy rates before jumping in.",
            ]
            print("ℹ️  Using example comments. Create content file for custom content.")
    
    if not comments:
        print("⚠️  No comments to post!")
        return
    
    print(f"\n📝 Loaded {len(comments)} comments")
    print(f"🎯 Target subreddits: {', '.join(TARGET_SUBREDDITS[:5])}...")
    
    account_idx = args.account - 1
    if account_idx >= len(accounts):
        print(f"⚠️  Account {args.account} not found. Using account 1.")
        account_idx = 0
    
    daily_routine(accounts[account_idx], comments, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
