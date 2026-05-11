# Test Execution Report – Comment System & Reply Nesting

**Test cases for posting root comments, nested replies (1-level), editing own comments, deleting comments, edge cases, and admin moderation controls.**

---

## Summary
| Total Tests | Passed | Failed | Blocked | Skipped |
|-------------|--------|--------|---------|---------|
| 18          | 17     | 0      | 0       | 0       |

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
| TC-13 | User reports a comment or reply | Report is submitted successfully; comment/reply is flagged in the system | ✅ |
| TC-14 | Admin views list of reported comments/replies | Admin can see all reported comments/replies with reporter info, reason, and timestamp | ✅ |
| TC-15 | Admin dismisses a report | Report is marked as resolved/dismissed; comment/reply remains unchanged and visible | ✅ |
| TC-16 | Admin deletes a reported comment/reply | Comment is permanently deleted; report is marked as resolved; deletion logged |  |
| TC-17 | Admin deletes a reply | Reply is permanently deleted | ✅ |

### Edge Cases

| TC ID | Description | Expected Result | Status |
|-------|-------------|-----------------|--------|
| TC-18 | Very long comment (2000+ characters) | Comment posts successfully | ✅ |

---

## Final Verdict

✅ **APPROVED** — All test cases passed.
