### PR #03: Usability Walkthrough (3 Testers, 2 Confusion Points Fixed)

#### 📝 Description
Conducts a usability walkthrough with 3 non-team NEU students using **think-aloud protocol**.

**Tasks Given to Testers:**
1. Find a post about a lost wallet
2. Post a found item (use the form)
3. Navigate to the Resolved History page

**Issues Found & Fixed:**

| Issue ID | Problem | Tester | Fix Applied |
| :--- | :--- | :--- | :--- |
| **U-01** | Anonymous toggle label "Post Anonymously?" read like a question about current state, not an action | Tester 1 | Relabeled to **"Hide my name and contact info"** — clear statement of what toggle does |
| **U-02** | No entry point to Resolved History from main UI (only accessible via `/resolved` route) | Testers 1 & 2 | Added **"View Resolved Archive →"** link below FilterBar on Home dashboard |

**Minor Issue Logged for Future Sprint:**
- **U-03** — My Posts 'Resolved' tab has no item count (Tester 3)

#### 📁 Files Changed
- `src/App.tsx` (anonymous toggle label + Resolved Archive link)
- `docs/usability-walkthrough.md` (new file — full walkthrough notes)

#### 💬 Commit Messages
- `fix(ux): relabel anonymous toggle from 'Post Anonymously?' to 'Hide my name'`
- `fix(ux): add 'View Resolved Archive' link to Home dashboard for discoverability`
- `docs(ux): add usability-walkthrough.md — 3 testers, 2 issues, 2 fixes`

#### 🔧 Key Implementation Details
| Fixed Item | Before | After |
| :--- | :--- | :--- |
| Anonymous toggle | "Post Anonymously?" (question, ambiguous) | "Hide my name and contact info" (statement, clear) |
| Resolved History entry | No entry point — only URL route | "View Resolved Archive →" link on Home dashboard |
