# ADR-002: Use React Router v7 for Client-Side Routing

**Status:** Decided  
**Date:** April 10, 2026  

## Context
The app has multiple distinct views (Home, Resolved History, My Posts, Notifications, Profile, Admin). Users should be able to navigate directly to any view via URL (e.g., /resolved) and use the browser back button.

## Options Considered

### Option A: React Router v7
- Declarative client-side routing with BrowserRouter, Routes, Route, useNavigate
- Industry standard for React applications

### Option B: Manual state routing
- Single currentView state variable controlling which component renders
- No URL changes, no deep linking

## Decision: React Router v7

## Reasons
- **Deep-linking**: Users can navigate directly to /resolved, /admin, etc.
- **Browser history**: Back button works correctly between views
- **Industry standard**: Any React developer will understand the structure immediately

## Consequences
- **Easier**: Each knowledge function has a stable, shareable URL
- **Easier**: Browser back/forward navigation works
- **Harder**: Vercel deployment requires rewrite rule (/* → /index.html)

## Routes Defined
| Route | View | Knowledge Function |
|-------|------|-------------------|
| / | HomeView | Discover items |
| /my-posts | MyPostsView | Personal history |
| /resolved | ResolvedHistory | Archive |
| /notifications | NotificationsView | Alerts |
| /profile | ProfileView | User settings |
| /admin | AdminView | Curation |
