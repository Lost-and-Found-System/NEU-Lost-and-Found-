# NEU Lost & Found

A lost and found management platform for New Era University students—built with React 19, TypeScript, and Vite.

## Overview

This application allows students to report lost items, browse found items, and connect with campus community members to recover belongings. The app integrates with Supabase for backend services and Google's Gemini API for intelligent item description assistance.

## Prerequisites

- **Node.js** v18.17 or higher
- **npm** v9 or higher (or yarn/pnpm)
- **Supabase** account (free tier available)
- **Google Gemini API** key (free tier available at ai.google.dev)

## Tech Stack

- **Vite 6** – Build tool
- **React 19** – UI library
- **TypeScript** – Type safety
- **Tailwind CSS v3** – Styling
- **Supabase** – Backend
- **Google Gemini API** – AI assistance
- **React Router v7** – Routing
- **Framer Motion** – Animations
- **intro.js** – Guided tours

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key |

> **Important**: Variables must be prefixed with `VITE_` for Vite to expose them to the React app.

## Quick Setup

```bash
git clone https://github.com/Lost-and-Found-System/NEU-Lost-and-Found-.git
cd neu-lost-found
npm install
cp .env.example .env
```

### Configure environment variables

- VITE_SUPABASE_URL – Get from Supabase Dashboard → Project Settings → API
- VITE_SUPABASE_ANON_KEY – Get from Supabase Dashboard → Project Settings → API (anon public key)
- VITE_GEMINI_API_KEY – Get from Google AI Studio (aistudio.google.com)

### Start the development server
```
npm run dev
```

### Build for production
```
npm run build
npm run preview
```
