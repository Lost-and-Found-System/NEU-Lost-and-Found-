# 🎓 NEU Found Hub — Digital Lost & Found Platform

![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)

## 📋 Overview

NEU Found Hub is a community-driven digital lost-and-found platform exclusively for New Era University students. It allows students to post lost or found items, browse listings, comment and ask questions, and connect with each other — all in real time.

Access is restricted to **@neu.edu.ph** Google accounts only.

## 🚀 Live Demo

- **Production URL:** [https://neu-lost-and-found.vercel.app](https://neu-lost-and-found.vercel.app)

## ✨ Key Features

### Posts
- Post lost or found items with title, description, category, location, date, and photos/videos
- Upload up to 5 photos or videos per post
- AI-powered auto-fill for found items using Google Gemini
- Anonymous posting option (identity hidden, contact info still optionally available)
- Edit post details after publishing
- Mark posts as resolved when item is returned

### Comments & Q&A
- Comment and reply on posts in real time
- Edit and delete your own comments
- Report inappropriate comments via dropdown menu
- Comments disabled on archived posts

### Notifications
- Real-time toast notifications for comments on your posts
- Real-time notifications for replies to your comments
- Notification bell with unread count
- Notifications only appear for actions relevant to you

### Moderation & Admin
- Admin dashboard with Posts, Reports, and Comment Reports tabs
- Archive and restore posts
- View and resolve user-submitted post reports
- View and act on reported comments (delete or dismiss)
- Real-time report sync across all admin sessions
- See which admin resolved each report

### Super Admin
- Promote users to Admin or Super Admin
- Demote admins back to User
- Disable or re-enable user accounts
- Real-time role updates — no re-login required

### UX
- Onboarding tour for first-time users
- Clickable image/video gallery in post detail view
- Resolved post history page
- Filter your own posts by status (Active, Lost, Found, Resolved, Archived)
- Share posts via native share or clipboard

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **User** | NEU student | Post, comment, report, view listings |
| **Admin** | Moderator | All user rights + archive posts, manage reports, delete comments |
| **Super Admin** | Platform owner | All admin rights + manage user roles and access |

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Realtime) |
| Authentication | Supabase Auth (Google OAuth) |
| Media Storage | Cloudinary |
| AI Analysis | Google Gemini |
| Deployment | Vercel |
| Version Control | Git + GitHub |

## 📁 Project Structure

```
src/
  components/
    FilterBar.tsx         — Search and category filter bar
    ResolvedFilters.tsx   — Filters for resolved history
    ResolvedPostCard.tsx  — Card for resolved post history
  lib/
    supabase.ts           — Supabase client and auth helpers
    gemini.ts             — Google Gemini AI image analysis
    utils.ts              — Utility functions (cn, formatDate)
  pages/
    ResolvedHistory.tsx   — Resolved posts history page
  styles/
    resolved-history.css  — Styles for resolved history
  App.tsx                 — Main application component
  main.tsx                — React entry point
  index.css               — Global styles and Tailwind theme
```

## ⚙️ Run Locally

**Prerequisites:** Node.js

1. Clone the repository:
   ```bash
   git clone https://github.com/Lost-and-Found-System/NEU-Lost-and-Found-.git
   cd NEU-Lost-and-Found-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root folder:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

5. Open **http://localhost:3000** in your browser.

> ⚠️ Only **@neu.edu.ph** Google accounts can sign in.

## 🗄️ Supabase Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles, roles, and tour status |
| `items` | Lost and found post listings |
| `comments` | Post comments and replies |
| `reports` | User-submitted post reports |
| `comment_reports` | User-submitted comment reports |
