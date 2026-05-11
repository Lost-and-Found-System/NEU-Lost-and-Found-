## Sprint 2 — Core Feature Development

### PR #02: Item Card Grid (Responsive Layout & Animations)

#### 📝 Description
Implements the responsive item card grid inside `App.tsx`. Each card is a `motion.div` with staggered entry animations (Framer Motion), a hover lift effect, and responsive columns (1 col mobile → 3 col lg).

**Card Features:**
- Image with Camera icon fallback
- Type badge (blue-700 for Lost, blue-200 for Found)
- Title (`line-clamp-1`)
- Description (`line-clamp-2`)
- Location with MapPin icon
- Formatted date with Calendar icon
- Author avatar (photo or initial fallback)
- Category badge

Clicking any card sets `selectedItem` state and opens the detail modal.

#### 📁 Files Changed
- `src/App.tsx` (card grid section added to HomeView render)

#### 💬 Commit Messages
- `feat(ux): implement item card grid with responsive columns and hover lift`
- `feat(ux): add Framer Motion staggered entry animation to card grid`
- `feat(ux): add image fallback, badge variants, and author avatar to cards`

#### 🔧 Key Implementation Details
| Feature | Implementation |
| :--- | :--- |
| Grid layout | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` |
| Entry animation | `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` |
| Stagger delay | `transition={{ delay: index * 0.04 }}` |
| Hover effect | `hover:shadow-lg hover:scale-[1.01] transition-all duration-300` |
| Exit animation | `exit={{ opacity: 0, scale: 0.95 }}` wrapped in `AnimatePresence` |
