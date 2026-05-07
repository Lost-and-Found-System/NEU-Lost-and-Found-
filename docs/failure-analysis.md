# Failure Analysis Report: Lost and Found System

---

## Executive Summary

This report documents 3 bugs discovered during testing of the Lost and Found Knowledge Management System. Each bug includes reproduction steps, root cause analysis, resolution status, and lessons learned.

---

## Bug #1: Commenting on a post + Notifications

| Field | Details |
|-------|---------|
| **GitHub Issue #** | #3 |
| **Severity** | Critical |
| **Status** | Fixed  |

### Description 
The expected result is the comments should appear under the post and the owner should receive a notification that a user commented on her post. Neither of the two happened.

### Steps to Reproduce
1. User A logs in and creates a post
2. User B logs in
3. User B navigates to User A's post
4. User B adds comment: "I think I saw this at room M111"
5. Click "+" button to add comment
6. User A checks notifications

### Expected vs Actual

| Expected | Actual |
|----------|--------|
| Comment appears under post; User A receives a notification: "User B commented on your post." | User A did not receive the notification. |

### Root Cause Analysis


### How It Was Fixed
[Description of the fix - 2-3 sentences]

### Lesson Learned
[What will you/the team do differently to prevent this type of bug?]

### Screenshot
No new notification was received.
<img width="1919" height="869" alt="684222972_26329700940064880_530573612397513330_n" src="https://github.com/user-attachments/assets/80481903-d7c4-44e2-b8e0-43c8e35da209" />

---

## Bug #2: Google OAuth is not wired up

| Field | Details |
|-------|---------|
| **GitHub Issue #** | #4 |
| **Severity** | High |
| **Status** | Fixed |

### Description
Google OAuth is not wired up when clicking the 'Google' button to sign up.

### Steps to Reproduce
1. Navigate to the Sign up page
2. Click the "Google" button.
3. Observe the error response

### Expected vs Actual

| Expected | Actual |
|----------|--------|
| User should be redirected to Google's OAuth consent screen to sign in with their Google account. | Supabase returns a 400 error: {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"} |

### Root Cause Analysis


### How It Was Fixed


### Lesson Learned


### Screenshot
<img width="764" height="218" alt="Screenshot 2026-05-03 222535" src="https://github.com/user-attachments/assets/e0fda329-a5f2-43fd-aa2d-cb14f2450a34" />

---

## Bug #3: Users unrelated to a post are receiving comment notifications

| Field | Details |
|-------|---------|
| **GitHub Issue #** | #5 |
| **Severity** | High |
| **Status** | Not yet |

### Description
When a user comments on a post, other users who have nothing to do with that post (not the author, not the commenter) are also receiving notifications.

### Steps to Reproduce
1. User A creates a post
2. User B (unrelated to the post) is logged in
3. User C comments on User A's post: "I found this item"
4. Check User B's notifications

### Expected vs Actual

| Expected | Actual |
|----------|--------|
| Only the post owner (User A) should receive a notification about the comment. | User B (unrelated to the post) also received a notification about the comment. |

### Root Cause Analysis


### How It Was Fixed


### Lesson Learned


---

## Bug #4: Hover color on certain buttons are barely readable

| Field | Details |
|-------|---------|
| **GitHub Issue #** | #6 |
| **Severity** | Low |
| **Status** | Fixed |

### Description
When you hover your mouse on certain buttons, such as "+ Post Item", "Contact Author", and "Sign in with Google", the hover colors are too dark and barely readable. The text blends into the background, making it difficult for users to confirm which button they are about to click.

### Steps to Reproduce
1. User A hovers on the said buttons ("+ Post Item", "Contact Author", "Sign in with Google")
2. Observe the hover color and attempt to read the button text

### Expected vs Actual

| Expected | Actual |
|----------|--------|
| Hover color and font text are readable. | Texts are too dark. |

### Root Cause Analysis
The CSS hover styles generated through Google AI Studio used dark hover colors (#1e7e34, #0056b3, #a71d2a) with white text. The AI was not prompted to consider accessibility contrast ratios. 


### How It Was Fixed
Developer changed hover colors slightly lighter than the button color with a black font color.

### Lesson Learned
Always test AI-generated colors with a contrast checker before committing.


### Screenshot
<img width="778" height="825" alt="a03d0283-263c-41e6-ae55-c50c33e58cb7" src="https://github.com/user-attachments/assets/e232eb22-5ef8-4f6e-95aa-cd6234fcc1d9" />

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total bugs found | #4 |
| Critical bugs | #3 |
| High severity | #3 |
| Medium severity | #0 |
| Low severity | #1 |
| Fixed | #4 |
| Deferred to future version | [#] |

## Lessons Learned Summary

1. **[Theme 1]:** [What the team learned about this area]

2. **[Theme 2]:** [What the team learned about this area]

3. **[Theme 3]:** [What the team learned about this area]

## Recommendations for Future Sprints

1. [Specific recommendation for development process]
2. [Specific recommendation for testing approach]
3. [Specific recommendation for KM features]
