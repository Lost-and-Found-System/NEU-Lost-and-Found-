### PR #050: Bottom Navigation Bar (My Posts, Notifications, Profile Views)

#### 📝 Description
Implements persistent bottom navigation bar shown to authenticated users.

**Navigation Items (lucide-react icons):**
| Item | Icon | Destination | Condition |
| :--- | :--- | :--- | :--- |
| Home | `House` | Home dashboard | Always |
| My Posts | `User` | User's own items | Always |
| Alerts | `Bell` | Notifications (with unread count badge) | Always |
| Profile | `GraduationCap` | User profile + settings | Always |
| Admin | `Shield` | Admin dashboard | `userRole === 'admin'` only |

**Views Implemented:**
- **My Posts** — Current user's items filtered by 'all', 'lost', 'found', 'resolved'
- **Notifications** — Lists `AppNotification` records with "Mark all read" and "Clear" buttons
- **Profile** — Shows user avatar, name, email, role badge, and "Restart Tour" button

#### 📁 Files Changed
- `src/App.tsx` (BottomNav, MyPostsView, NotificationsView, ProfileView render blocks)

#### 💬 Commit Messages
- `feat(ux): implement bottom navigation bar with icons, labels, unread badge`
- `feat(ux): implement My Posts view with filter tabs and status badges`
- `feat(ux): implement Notifications and Profile views`

#### 🔧 Key Implementation Details
| Feature | Implementation |
| :--- | :--- |
| Positioning | `fixed bottom-0 left-0 right-0 z-50` |
| Styling | `bg-white/95 backdrop-blur-md border-t safe-area-inset-bottom` |
| Active indicator | `bg-blue-700 text-white` when `currentView === viewName` |
| Unread badge | Red circle with count (shows "9+" if >9) |
