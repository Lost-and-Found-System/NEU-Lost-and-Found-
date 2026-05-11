### PR #02: Item Detail Modal (Image Gallery, Metadata, Contact)

#### 📝 Description
Implements a full-screen item detail modal in `App.tsx`. Triggered when `selectedItem` state is set. Uses `AnimatePresence` with a backdrop (opacity 0→1) and a panel (y: 50→0).

**Content Sections:**
- Image gallery with left/right nav arrows and index counter
- Title + badge header
- Metadata row (MapPin location, Calendar date, Tag category)
- Description block
- Author section (avatar + name, anonymous-aware)
- Contact sub-modal trigger (only if not anonymous)
- Resolve/archive action buttons (gated by authorship or admin role)
- Full comment thread

#### 📁 Files Changed
- `src/App.tsx` (ItemDetailModal render block)

#### 💬 Commit Messages
- `feat(ux): implement item detail modal with image gallery and metadata`
- `feat(ux): add contact sub-modal and anonymous author handling`
- `feat(ux): add resolve/archive buttons with author/admin permission guard`

#### 🔧 Key Implementation Details
| Feature | Implementation |
| :--- | :--- |
| Backdrop animation | `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` |
| Panel animation | `initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}` with spring bounce |
| Close behavior | Click outside → `setSelectedItem(null)` |
| Permission guard | `user?.id === selectedItem.author_uid || userRole === 'admin'` |
