# Item Posting

**Test cases for item posting and image upload**

---

## Summary
| Total Tests | Passed | Failed | Blocked | Skipped |
|-------------|--------|--------|---------|---------|
| 10          |   10   |        |         |         |

## Test Cases

### Create Post – Happy Path
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-01 | Create lost post – all required fields (title, description, category, location, date) | Post created successfully; appears in user's "My Posts" | ✅ |
| T-02 | Create found post – all valid fields | Post created successfully; type = Found | ✅ |

### Anonymous Posting
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-03 | Check "Post anonymously" and submit without contact number | Post created; author shown as "Anonymous"; no contact number displayed | ✅ |
| T-04 | Uncheck "Post anonymously" and submit with contact info | Author name and contact information visible to others | ✅ |

### Category Selection
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-05 | Select each category from dropdown (Electronics, Clothing, Documents, etc.) | Each selection saves correctly | ✅ |

### Form Validation
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-06 | Uncheck anonymous → cannot submit with missing contact number | Error: "Contact number is required for non-anonymous posts" | ✅ |
| T-06a | Check anonymous → submit without contact number | Post created successfully (contact number optional) | ✅ |
| T-07 | Submit with no images | Post created successfully (images optional) | ✅ |
| T-08 | Title = 1 char is enough | Error: minimum 1 / maximum 100 characters | ✅ |
| T-09 | Description is optional | No error; post created successfully with empty description | ✅ |

### Edit Post (Post-Creation)
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-10 | Navigate to My Posts → edit existing post → modify fields → save | Changes saved; updated post displayed | ✅ |

---

## Final Verdict
- ✅ **APPROVED**
