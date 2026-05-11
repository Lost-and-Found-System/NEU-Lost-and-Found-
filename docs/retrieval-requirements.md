# Retrieval Requirements  

## Overview
Retrieval requirements define how users can efficiently access lost-and-found records. They ensure the system functions as a Knowledge Management platform by enabling structured search, filtering, and role-based visibility — not just CRUD operations.

### Requirement 1: Word Search
- **Description:** A user must be able to type any word or phrase and retrieve all items where that word appears in the title, description, or location.
- **SECI Phase:** Combination (explicit knowledge retrieval)  
- **Priority:** CRITICAL
- **Rationale:** A student looking for their lost wallet might type "wallet", "brown wallet", "canteen", or "Building 3". All four should return relevant results.
- **Implementation Note for Developer:** Use Supabase `.or()` with `ilike` pattern for title, description, and location fields. Example: `title.ilike.%wallet%,description.ilike.%wallet%,location.ilike.%wallet%`.

### Requirement 2: Type and Category Filter
- **Description:** A user must be able to filter items by type (Lost / Found / All) and by one or more categories from the taxonomy.
- **SECI Phase:** Combination
- **Priority:** CRITICAL
- **Rationale:** A student who lost their ID only wants to see "Lost" posts in the "ID/Cards" category. Showing all item types wastes their time.
- **Implementation Note for Developer:** Use Supabase `.eq()` for type and category. The FilterBar supports multi-select categories, so use `.in()` for categories if multiple are selected.

### Requirement 3: Status Filter
- **Description:** The main feed must show only "active" items by default. Resolved and archived items must be hidden from the main feed but accessible in the Resolved History archive.  
- **SECI Phase:** Combination (active feed) + Combination output (resolved archive)
- **Priority:** CRITICAL
- **Rationale:** The main feed is an active knowledge board. Resolved items pollute the feed with irrelevant records. Archived items are removed from community view entirely.
- **Implementation Note for Developer:** Filter main feed with `.neq(status, archived).neq(status, resolved)`. Resolved History page queries `.eq(status, resolved)` only.

### Requirement 4: Date Range Filter
- **Description:** In the Resolved History page, users must be able to filter by a date range (from/to) on the item's date field.
- **SECI Phase:** Combination (archive browsing)
- **Priority:** MEDIUM
- **Rationale:** A student who lost something on a specific date wants to see items found around that date. The date range filter significantly improves archive retrieval precision.
- **Implementation Note for Developer:** Use Supabase `.gte(date, fromDate)` and `.lte(date, toDate)`.

### Requirement 5: Real-Time Updates
- **Description:** When a new item is posted, all connected users must see it appear in their feed without refreshing the page.  
- **SECI Phase:** Socialization (immediate knowledge sharing)  
- **Priority:** HIGH
- **Rationale:** Lost items are time-sensitive. A wallet found at 10am should be visible to the owner who is searching at 10:05am. A page refresh requirement introduces a 5-minute knowledge gap.
- **Implementation Note for Developer:** Use Supabase `postgres_changes` subscription on the items table. Re-call `fetchItems()` on any INSERT/UPDATE/DELETE event.

### Requirement 6: Pagination
- **Description:** The Resolved History archive must display items in pages of 8, with previous/next navigation.
- **SECI Phase:** Combination
- **Priority:** MEDIUM
- **Rationale:** Over time, the resolved archive may contain hundreds of items. Loading all at once would slow the page and overwhelm users.
- **Implementation Note for Developer:** Use Supabase `.range(offset, offset+7)` with a count query to compute total pages.

## KM Rationale
These retrieval requirements ensure NEU Found Hub operates as a Knowledge Management system:
- **Coverage:** Every item can be found via category, keyword, or tag.
- **Distinctiveness:** Clear separation of roles and statuses prevents confusion in visibility.
- **Retrievability:** Structured filters, search logic, and pagination transform the app into a KM platform, enabling knowledge reuse and accountability.