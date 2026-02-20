# OpenCode Command Templates for Propure Marketing

Ready-to-use commands for OpenCode to generate and manage marketing content.

## 🎯 Core Principle

OpenCode generates content and manages files. Python scripts handle actual posting via APIs.

---

## 📱 REDDIT CONTENT GENERATION

### Generate Comments

```
Generate 10 Reddit comments about rental property investing.

Requirements:
- Each comment 2-4 sentences
- Mix of perspectives: experienced investor (60%), curious beginner (40%)
- Conversational tone, avoid jargon
- Include specific numbers/examples when relevant
- No promotional language or links

Save to automation_scripts/content/reddit_comments.txt
Format: One comment per block, separated by ---
```

### Generate Reddit Posts

```
Generate 3 Reddit posts for r/realestateinvesting.

For each post provide:
1. Title (compelling, question or statement)
2. Body content (300-500 words)
3. Target subreddit

Topics:
- First investment property analysis
- Cash flow vs appreciation debate
- Tenant management tips

Save to automation_scripts/content/reddit_posts.txt
```

### Niche-Specific Comments

```
Generate 5 comments for each of these subreddits:
- r/AusPropertyChat (Australian property focus)
- r/realestateinvesting (general RE)
- r/financialindependence (FIRE angle)

Each comment should match the subreddit's culture and common topics.
Save to automation_scripts/content/subreddit_comments.txt with subreddit headers.
```

---

## 🐦 TWITTER CONTENT GENERATION

### Generate Thread

```
Create a Twitter thread: "5 property investment mistakes that cost me $50k"

Requirements:
- 7 tweets total (hook + 5 mistakes + CTA)
- Each tweet under 280 chars
- Use line breaks for readability
- Include relevant emojis sparingly
- End with engagement question

Save to automation_scripts/content/twitter_thread.txt
```

### Generate Tweet Batch

```
Generate 15 standalone tweets about property investing.

Mix of formats:
- 5 quick tips
- 3 controversial takes / hot takes
- 3 questions to drive engagement
- 2 motivational / mindset
- 2 stat-based / data tweets

Save to automation_scripts/content/tweets.txt
One tweet per line.
```

---

## 💼 LINKEDIN CONTENT GENERATION

### Thought Leadership Post

```
Generate a LinkedIn post about "How I analyzed my first rental property deal"

Requirements:
- Personal story format
- 1000-1300 characters
- Include specific numbers/metrics
- End with question for engagement
- 3-5 relevant hashtags at end

Save to automation_scripts/content/linkedin_post.txt
```

### Batch LinkedIn Posts

```
Generate 5 LinkedIn posts for the week.

Themes:
1. Monday: Motivation / Week goals
2. Tuesday: Educational tip
3. Wednesday: Industry insight / trend
4. Thursday: Personal story / lesson learned
5. Friday: Question to drive discussion

Save to automation_scripts/content/linkedin_weekly.txt
```

---

## 📝 LONG-FORM CONTENT

### Blog Article

```
Write a 1500-word blog article: "Complete Guide to Rental Yield Calculations"

Structure:
- Hook intro (100 words)
- What is rental yield (200 words)
- Gross vs Net yield with examples (300 words)
- Step-by-step calculation (300 words)
- Common mistakes (200 words)
- Tools and resources (200 words)
- Conclusion with CTA (200 words)

SEO keywords: rental yield, property investment, ROI, cash flow
Save to automation_scripts/content/blog_rental_yield.md
```

### Medium Article

```
Write a Medium article: "I Analyzed 100 Properties Before Buying One - Here's What I Learned"

Personal narrative style, 1200 words.
Include:
- The journey / struggle
- Key metrics I tracked
- Biggest surprises
- What I'd do differently
- Actionable takeaways

Save to automation_scripts/content/medium_100_properties.md
```

---

## 📊 DAILY AUTOMATION ROUTINES

### Morning Content Generation

```
Execute morning content generation:

1. REDDIT (save to content/reddit/):
   - 15 comments for target subreddits
   - 2 original posts with full content
   - 5 reply templates for common questions

2. TWITTER (save to content/twitter/):
   - 1 thread (7 tweets)
   - 10 standalone tweets

3. LINKEDIN (save to content/linkedin/):
   - 1 long-form post

Create folder: automation_scripts/content/$(date +%Y%m%d)/
Organize all content into platform subfolders.
Report summary when done.
```

### Weekly Content Planning

```
Create content calendar for next 7 days:

For each day generate:
- 3 Reddit comments
- 2 tweets
- 1 LinkedIn post (Mon/Wed/Fri only)

Theme the week around: [INSERT THEME - e.g., "First-time investor mistakes"]

Save to automation_scripts/content/weekly_calendar.md
Include posting times (spread throughout day).
```

---

## 🔄 CONTENT REPURPOSING

### Repurpose Blog to Social

```
Read: automation_scripts/content/blog_rental_yield.md

Repurpose into:
- 3 Reddit posts (different angles, different subreddits)
- 2 Twitter threads
- 5 standalone tweets
- 2 LinkedIn posts
- 3 Instagram captions

Save to automation_scripts/content/repurposed/
```

### Thread to Carousel

```
Read: automation_scripts/content/twitter_thread.txt

Convert to Instagram carousel format:
- Slide 1: Hook
- Slides 2-6: Key points (1 per slide, 20-30 words each)
- Slide 7: CTA

Save to automation_scripts/content/instagram_carousel.txt
```

---

## 🤖 SCRIPT EXECUTION

### Run Reddit Automation

```
Read the comments from automation_scripts/content/reddit_comments.txt
Then run: python automation_scripts/reddit_automation.py

Pass the comments as input to the script.
Log results to automation_scripts/logs/$(date +%Y%m%d).log
```

### Prepare Manual Posting Queue

```
Read all content from automation_scripts/content/$(date +%Y%m%d)/

Create a posting checklist:
- [ ] Platform: [content preview] - Post at [time]

Save to automation_scripts/content/posting_queue.md
Sort by optimal posting times per platform.
```

---

## 📈 ANALYTICS & OPTIMIZATION

### Content Performance Review

```
Read: automation_scripts/logs/

Analyze last 7 days:
- Total posts per platform
- Any failures or errors
- Patterns in successful vs failed posts
- Recommendations for improvement

Save analysis to automation_scripts/logs/weekly_review.md
```

### Generate New Ideas

```
Based on property investment trends, generate:
- 20 Reddit post titles
- 10 Twitter thread hooks
- 5 controversial hot takes
- 5 educational topic ideas

Focus on: [Australian market / first-time investors / cash flow strategies]
Save to automation_scripts/content/idea_bank.md
```

---

## 💡 PLATFORM-SPECIFIC TEMPLATES

### Reddit AMA Prep

```
Generate an AMA (Ask Me Anything) post for r/realestateinvesting:

Title: "I own 5 rental properties in Australia. AMA about property investing down under"

Create:
- Opening post (500 words, credibility + invite questions)
- 20 anticipated questions with detailed answers
- Follow-up engagement replies

Save to automation_scripts/content/reddit_ama.md
```

### Twitter Engagement

```
Generate reply templates for common Twitter scenarios:

1. Someone asking about getting started (5 variations)
2. Someone sharing a win (5 congratulatory replies)
3. Someone sharing a struggle (5 supportive replies)
4. Disagreement on strategy (5 diplomatic responses)
5. Request for resources (5 helpful replies)

Save to automation_scripts/content/twitter_replies.md
```

---

## 🚀 QUICK COMMANDS

### Fast Content

```
> Quick: Generate 5 Reddit comments about [topic]
> Quick: Generate 3 tweets about [topic]
> Quick: Generate 1 LinkedIn post about [topic]
```

### Full Routine

```
> Execute full daily marketing content generation. Save to dated folder.
```

### Run Script

```
> Run reddit_automation.py with today's content
```

### Status Check

```
> Read logs from today. Summarize what was posted.
```

---

## ⚡ BEST PRACTICES

1. **Vary Content**: Never post identical content across accounts
2. **Batch Generate**: Create week's content in one session
3. **Natural Timing**: Space posts 5-30 minutes apart
4. **Platform Voice**: Reddit casual, LinkedIn professional, Twitter punchy
5. **Track Everything**: Log all posts for analysis
6. **Iterate**: Use weekly reviews to improve prompts

---

## 🔐 SAFETY NOTES

- Build account karma before promotional posts
- Follow each platform's rules
- Use unique content per account
- Space activities naturally
- Don't automate engagement (likes, follows) - risk of bans
