# NEU Found Hub

A digital lost-and-found platform for New Era University students to post lost/found items, browse listings, and connect with each other.

## Features

- 🔍 Search and filter lost & found posts
- 📸 Photo upload with AI-powered item analysis
- 💬 Comments & Q&A with reply support
- 🔔 Real-time notifications
- 🛡️ Admin dashboard with report management
- 📦 Archived posts management
- 👤 Anonymous posting option

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth, Database, Realtime)
- **Image Upload:** Cloudinary
- **AI Analysis:** Google Gemini

## Run Locally

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

> ⚠️ Only **@neu.edu.ph** accounts can sign in.