## Sprint 3 — Polish, Documentation & Deployment

### PR #049: Intro.js Onboarding Tour (6-Step Guided Walkthrough)

#### 📝 Description
Integrates `intro.js` v8 to implement a 6-step guided onboarding tour for first-time users.

**Tour Steps & Targets:**
| Step | Target | Message |
| :--- | :--- | :--- |
| 1 | `#tour-search` | "Search for lost or found items by name, category, or location" |
| 2 | `#tour-toggle` | "Filter posts by status — All, Lost, or Found" |
| 3 | `#tour-filters` | "Use category filters to narrow down results quickly" |
| 4 | `#tour-post-card` | "Click any post to see full details, images, and comments" |
| 5 | `#tour-comments` | "Leave a comment to help identify or claim an item" |
| 6 | `#tour-add-button` | "Use this button to post a lost or found item" |

**Behavior:**
- Auto-triggers on first login (`hasSeenTour === false` and `currentView === 'home'`)
- 500ms delay ensures DOM is settled before `intro.js` queries elements
- "Skip" button triggers permanent dismissal via Supabase update (`has_seen_tour: true`)
- Tour can be replayed from Profile view via `handleContinueTour()`
- `exitOnOverlayClick: false` prevents accidental dismissal

#### 📁 Files Changed
- `src/App.tsx` (startTour, handlePermanentSkip, handleContinueTour functions + tourInstance ref)

#### 💬 Commit Messages
- `feat(tour): integrate intro.js 6-step onboarding tour with data-step targets`
- `feat(tour): implement permanent skip with Supabase has_seen_tour persistence`
- `feat(tour): add handleContinueTour() re-trigger from Profile view`

#### 🔧 Key Implementation Details
| Feature | Implementation |
| :--- | :--- |
| Library | `intro.js` v8 with `introjs.css` |
| Guard conditions | `isTourActive` `!user` `currentView !== 'home'` `hasSeenTour === true` |
| Auto-trigger | `useEffect` with dependencies: `[user, hasSeenTour, currentView, loading]` |
| Permanent skip | Update `has_seen_tour: true` in Supabase + local state |
