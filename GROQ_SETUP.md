# Groq AI Integration - Quick Start Guide

## 🚀 Get Your FREE Groq API Key

### Step 1: Sign Up (30 seconds)
1. Go to: **https://console.groq.com**
2. Click "Sign Up" or "Get Started"
3. Sign in with Google/GitHub (fastest)

### Step 2: Create API Key (10 seconds)
1. Once logged in, click **"API Keys"** in the sidebar
2. Click **"Create API Key"**
3. Give it a name (e.g., "DocShield")
4. Click **"Submit"**
5. **Copy the key** (starts with `gsk_...`)

### Step 3: Add to DocShield (5 seconds)
Open `.env.local` and paste your key:

```env
GROQ_API_KEY=gsk_your_actual_key_here
```

### Step 4: Restart Dev Server
```bash
# Stop server: Ctrl+C
npm run dev
```

## ✅ That's It!

Your chatbot will now work with:
- **Llama 3.3 70B** (same model we planned for Ollama)
- **Lightning fast** responses (10x faster than others)
- **100% FREE** tier (generous limits)
- **No installation** required

## 🎯 Groq Free Tier Limits

- **Requests:** 30 requests per minute
- **Tokens:** 6,000 tokens per minute
- **Daily:** 14,400 requests per day

Perfect for development and testing! Upgrade later if needed.

## 🔧 Troubleshooting

**Error: "GROQ_API_KEY is required"**
- Make sure you added the key to `.env.local`
- Restart your dev server after adding the key

**Error: "Invalid API key"**
- Double-check you copied the full key (starts with `gsk_`)
- Make sure there are no extra spaces

## 📊 What Changed from Ollama

- ✅ No local installation needed
- ✅ Faster inference (cloud-powered)
- ✅ Same Llama 3.3 70B model
- ✅ More reliable (always available)
- ⚠️ Requires internet connection
- ⚠️ API rate limits (but generous free tier)

**Still 100% private** - Your conversations are not used for training!

---

**Ready in under 1 minute!** 🚀
