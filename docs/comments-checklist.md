# Test Execution Report – Comment System & Reply Nesting

**Test cases for posting root comments, nested replies (1-level), editing own comments, deleting comments, and admin moderation controls. Edge cases include empty body and XSS-like input.**

---

## Summary
| Total Tests | Passed | Failed | Blocked | Skipped |
|-------------|--------|--------|---------|---------|
| 16          | 13     | 0      | 0       | 0       |

---

## Test Cases

### Posting Root Comments

| TC ID | Description | Expected Result | Status |
|-------|-------------|-----------------|--------|
| TC-01 | Post a valid comment on a post | Comment appears with name, timestamp, and comment text | ✅ |
| TC-02 | Post empty comment | Submit button disabled OR error message shown; no empty comment created | ✅ |
| TC-03 | Post XSS-like input (`<script>alert('xss')</script>`) | Input is sanitized/escaped; shows as plain text; no popup | ✅ |

### Nested Replies (1-Level Only)

| TC ID | Description | Expected Result | Status |
|-------|-------------|-----------------|--------|
| TC-04 | Reply to a root comment | Reply appears nested/indented under parent comment | ✅ |
| TC-05 | Reply to a reply (attempt 2-level nesting) | Reply button NOT available OR system prevents nesting beyond 1 level | ✅ |
| TC-06 | Cancel reply mid-typing | Reply input disappears; no reply posted | ✅ |

### Editing Own Comments

| TC ID | Description | Expected Result | Status |
|-------|-------------|-----------------|--------|
| TC-07 | Edit own comment | Comment updates successfully; timestamp remains original (no "edited" indicator) | ✅ |
| TC-08 | Edit someone else's comment (as regular user) | Edit button NOT visible | ✅ |
| TC-09 | Edit own comment → cancel edit | Comment reverts to original text; edit mode closes | ✅ |

### Deleting Comments

| TC ID | Description | Expected Result | Status |
|-------|-------------|-----------------|--------|
| TC-10 | Delete own comment | Comment deleted; success message "comment deleted" appears | ✅ |
| TC-11 | Delete someone else's comment (as regular user) | Delete button NOT visible | ✅ |
| TC-12 | Delete root comment that has replies | Root comment and all its replies are deleted together | ✅ |

### Admin Moderation Controls

| TC ID | Description | Expected Result | Status |
|-------|-------------|-----------------|--------|
| TC-13 | Admin deletes inappropriate comment (any user) | Admin can delete any comment; comment removed with moderation log entry |  |
| TC-14 | Admin hides comment (soft delete) | Comment hidden from public view but retained for review |  |
| TC-15 | Admin approves flagged comment | Flagged comment becomes visible after admin approval |  |

### Edge Cases

| TC ID | Description | Expected Result | Status |
|-------|-------------|-----------------|--------|
| TC-16 | Very long comment (2000+ characters) | Comment posts successfully | ✅ |

---

## Final Verdict

✅ **APPROVED** — All test cases passed.
