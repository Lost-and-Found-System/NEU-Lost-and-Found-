# Test Execution Report – Google OAuth Sign-in Flow

**PR #02: QA checklist for Google OAuth sign-in flow**

**Execution Date:** May 9, 2026

---

## Summary
| Total Tests | Passed | Failed | Blocked | Skipped |
|-------------|--------|--------|---------|---------|
| 7           | 7      | 0      | 0       | 0       |

## Test Cases

### Happy Path
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-01  | Click Sign in with Google → select valid account | Logged in, sees dashboard | ✅ |
| T-02  | Refresh page after sign-in | Auth persists, remains logged in | ✅ |

### Redirect Flow
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-03  | User cancels Google account selection | Redirects back to login page, no error | ✅ |

### Error States
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-04  | Network failure during OAuth | Shows network error message | ✅ |
| T-05  | Sign in with non-@neu.edu.ph account | Shows friendly error message | ✅ |

### Auth State Persistence
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-06  | Close tab → reopen app | Session persists | ✅ |
| T-07  | Clear cookies/storage | Logged out, must re-authenticate | ✅ |

---

## Final Verdict
- ✅ **APPROVED**
