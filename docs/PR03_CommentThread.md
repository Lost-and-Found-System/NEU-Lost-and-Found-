### PR #03: Comment Thread UI (Reply Flow, Edit/Delete, Optimistic Rendering)

#### 📝 Description
Implements the comment thread UI inside the item detail modal.

**Features:**
- Comments in chronological order
- Replies indented under parent comments using `CornerDownRight` icon
- Each comment shows: avatar, author name (or "Anonymous"), timestamp, content, and edit/delete menu (author only)
- "Reply" button shows "Replying to [name]" banner above input
- Editing replaces comment with inline textarea and Save/Cancel buttons
- **Optimistic rendering:** comments appear instantly before Supabase sync completes
- Empty/whitespace submissions rejected client-side

#### 📁 Files Changed
- `src/App.tsx` (comment thread section inside ItemDetailModal)

#### 💬 Commit Messages
- `feat(ux): implement comment thread with indented reply UI`
- `feat(ux): add MoreVertical dropdown with edit/delete for comment author`
- `feat(ux): block empty/whitespace comment submissions client-side`

#### 🔧 Key Implementation Details
| Feature | Implementation |
| :--- | :--- |
| Reply indentation | `className="flex gap-3 ml-10"` with `CornerDownRight` icon |
| Kebab menu | Dropdown with Edit2 and Trash2 icons, positioned absolutely |
| Optimistic update | Local state update before async Supabase call |
| Validation | `!commentText.trim()` disables submit button |
