# Test Execution Report – Image Upload

**Test cases for item posting and image upload**


---

## Summary
| Total Tests | Passed | Failed | Blocked | Skipped |
|-------------|--------|--------|---------|---------|
| 7           |        |        |         |         |

## Test Cases

### Multi-Image Upload
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-01 | Upload 1 image (JPG/PNG, <10MB) | Preview shown; uploads successfully | ✅ |
| T-02 | Upload 5 images (maximum allowed) | 5 previews shown; all compress and save | ✅ |
| T-03 | Upload 6 images | No error shown; only first 5 images are uploaded and previewed; 6th image is silently ignored | ✅ |
| T-04 | Submit with no images | Post created successfully (images optional) | ✅ |
| T-05 | Upload 5 images → verify all images are clickable/viewable after post creation | All 5 images are clickable and display properly; thumbnails work for each | ☐ |

### Remove Images
| TC ID | Description | Expected Result | Status |
|-------|-------------|----------------|--------|
| T-06 | Upload 3 images → remove middle one | Image removed; 2 remain; remaining images shift order | ✅ |
| T-07 | Upload images → remove all images | Post can still be submitted (images optional) | ✅ |

---

## Final Verdict
- ☐ **WATING TO BE APPROVED**
