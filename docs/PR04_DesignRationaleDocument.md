### PR #04: Design Rationale Document (Color, Typography, Navigation)

#### 📝 Description
Commits `docs/design-rationale.md` — the 2.5-page individual deliverable for the UI/UX Designer role.

**Document Sections:**

1. **Color Palette and Typography**
   - Primary color: NEU Blue (#1A3A6B)
   - Functional color coding: Lost (dark blue), Found (light blue), Resolved (neutral grey)
   - Typography: System sans-serif + monospace for metadata

2. **Navigation Structure and Information Architecture**
   - Bottom navigation (mobile-first, thumb-reachable)
   - Sticky FilterBar (persistent access to search and filters)
   - Views: Home, My Posts, Notifications, Profile, Admin

3. **Proudest Design Decision**
   - Grayscale hover effect on ResolvedPostCard

4. **What I Would Change (Future Improvement)**
   - Integrate Resolved History into main tab navigation

5. **Usability Walkthrough Results**
   - Two changes made: anonymous toggle relabel + Resolved Archive link

6. **Accessibility Checklist (All ✅)**
   - Font sizes: minimum 12px
   - Color contrast: WCAG AA (4.8:1)
   - Navigation labels: all visible text (not icon-only)
   - ARIA roles: `role="group"` and `aria-label` on filter containers
   - Image alt text: all images have descriptive alt attributes
   - Focus states: `focus:ring-2` on all interactive elements

#### 📁 Files Changed
- `docs/design-rationale.md` (new file — full document)

#### 💬 Commit Messages
- `docs(ux): add design-rationale.md — color, typography, navigation, KM alignment`
