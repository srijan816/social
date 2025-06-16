# Free Tier Social Media Setup Guide

## 🆓 Using Only Free Tiers

SocialAI Pro is designed to work with **free tiers only** - no paid social media API access required! Here's how to set it up:

## 🔑 API Keys You Have

Your `.env` file is already configured with these API keys:

### ✅ AI Content Generation (All Working)
- **Claude 4 Sonnet**: Your premium key for high-quality content
- **OpenAI GPT-4o Mini**: Cost-effective alternative
- **Gemini 2.5 Flash**: Google's free tier with 4 API keys for rate limiting
- **XAI Grok**: X's AI model for Twitter-optimized content
- **Perplexity**: For research and trending topics

### 📱 Social Media Platforms (Free Approach)

#### X (Twitter) - Free Options:
1. **Content Generation Only** (Recommended for Free)
   - Generate content using our AI
   - Copy and paste manually to Twitter
   - No API limits or costs

2. **Free Developer Account** (Optional)
   - Apply for free Twitter Developer Account
   - Get 1,500 tweets/month free
   - 50 tweets/day limit
   - Perfect for personal use

#### LinkedIn - Free Options:
1. **Content Generation Only** (Recommended)
   - Generate professional content
   - Copy and paste to LinkedIn
   - No API setup needed

2. **LinkedIn Developer** (Complex)
   - Requires company verification
   - Limited free tier
   - Not recommended for personal use

## 🚀 Recommended Free Setup

### Step 1: Content Generation Only
This is the **easiest and completely free** approach:

1. ✅ Use the app to generate content
2. ✅ Preview and edit posts 
3. ✅ Copy generated content
4. ✅ Manually post to X/LinkedIn
5. ✅ Track performance manually

**Benefits:**
- ✅ Zero social media API costs
- ✅ No rate limits
- ✅ No account approvals needed
- ✅ Works immediately

### Step 2: Optional Twitter API (Free Tier)
Only if you want automatic posting:

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Apply for free developer account
3. Create new app
4. Get these keys:
   - API Key
   - API Key Secret
   - Access Token
   - Access Token Secret
5. Add to Settings in the app

**Free Limits:**
- ✅ 1,500 tweets/month
- ✅ 50 tweets/day
- ✅ Read tweets
- ✅ Perfect for personal brands

## 💰 Cost Breakdown

### Current Setup (Monthly):
- **Claude API**: ~$10-50 (depending on usage)
- **OpenAI API**: ~$5-20 (GPT-4o mini is cheap)
- **Gemini API**: FREE (large free tier)
- **XAI API**: ~$5-15 (competitive pricing)
- **Perplexity**: $20/month (or use free tier)
- **X/Twitter**: FREE (free developer tier)
- **LinkedIn**: FREE (manual posting)

### Total: $20-70/month for full AI automation
### Free Option: $0/month (manual posting)

## 🎯 Recommended Strategy

### For Personal Use (FREE):
1. Use Gemini for most content (free tier)
2. Use Claude for premium content occasionally
3. Generate content in batches
4. Manual posting to platforms
5. **Total Cost: $0/month**

### For Small Business ($20-30/month):
1. Mix of Gemini (free) + Claude/OpenAI
2. Automatic Twitter posting
3. Manual LinkedIn posting
4. Research with Perplexity
5. **Total Cost: $20-30/month**

## 🛠️ Platform-Specific Free Setup

### X (Twitter) Free Developer Setup:
```
1. Visit: https://developer.twitter.com/en/portal/dashboard
2. Click "Sign up for free account"
3. Fill out use case (personal automation)
4. Wait for approval (usually 1-2 days)
5. Create new project/app
6. Generate keys in app settings
7. Add keys to SocialAI Pro settings
```

### LinkedIn Manual Posting:
```
1. Generate content in SocialAI Pro
2. Copy professional content
3. Go to LinkedIn.com
4. Create new post
5. Paste content
6. Add relevant hashtags
7. Post manually
```

## 📊 Free Tier Limitations

### Twitter API Free Tier:
- ✅ 1,500 tweets/month
- ✅ Read your tweets
- ✅ Basic user info
- ❌ No advanced analytics
- ❌ No premium endpoints

### Gemini Free Tier:
- ✅ 15 requests/minute
- ✅ 1,500 requests/day
- ✅ 1 million tokens/month
- ✅ Perfect for content generation

### Manual Posting Benefits:
- ✅ No API limits
- ✅ No account approvals
- ✅ Full platform features
- ✅ Better engagement control
- ✅ Platform-native experience

## 🎨 Content Generation Strategy

### Use Multiple AI Providers:
```javascript
// In the app, select different providers:
- Gemini: For bulk content (free)
- Claude: For premium posts (paid but high quality)
- OpenAI: For quick iterations (cheap)
- XAI: For Twitter-specific content
```

### Batch Generation:
1. Generate 10-20 posts at once
2. Save as drafts
3. Schedule manually throughout week
4. Use free AI providers primarily

## 🔍 Testing Your Setup

1. **Start the app**: `npm start`
2. **Register account**: Create new user
3. **Generate content**: Try different AI providers
4. **Copy content**: Use for manual posting
5. **Optional**: Add Twitter API keys for automation

## 💡 Pro Tips for Free Usage

1. **Use Gemini first**: Free tier is generous
2. **Batch generate**: Create multiple posts at once
3. **Manual posting**: Often better engagement
4. **Track manually**: Note which content performs best
5. **Mix providers**: Each AI has different strengths
6. **Save favorites**: Use templates for successful posts

## 🆘 If You Get Rate Limited

### Gemini Rate Limits:
- App automatically rotates between 4 API keys
- Uses different keys for each request
- Rarely hit limits with this setup

### Fallback Strategy:
- App tries providers in order: Claude → Gemini → OpenAI → XAI
- If one fails, automatically tries next
- Always have backup options

Your setup is optimized for cost-effectiveness while maintaining high content quality!