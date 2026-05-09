# Setup Guide

## 1. Install Node.js
Download from [nodejs.org](https://nodejs.org/) (LTS version)

## 2. Clone and install
```bash
git clone https://github.com/Lost-and-Found-System/NEU-Lost-and-Found-.git
cd neu-lost-found
npm install
```

## 3. Get Supabase keys
1. Sign up at supabase.com
2. Create project → Project Settings → API
3. Copy: Project URL + anon public key

## 4. Get Gemini key
1. Go to aistudio.google.com
2. Click "Get API key" → Create → Copy

## 5. Create .env file

```
cp .env.example .env
```

Open .env and replace the placeholders with the actual keys:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
VITE_GEMINI_API_KEY=your_actual_gemini_key
```

## 6. Run
```
npm run dev
```
