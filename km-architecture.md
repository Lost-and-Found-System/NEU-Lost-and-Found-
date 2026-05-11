# KM Architecture
## Section 1: Taxonomy
Defines the controlled vocabulary for categorizing lost-and-found items. Ensures metadata consistency and supports structured retrieval.

### Categories
- **Electronics** — phones, laptops, chargers, headphones
- **Clothing** — jackets, uniforms, shoes
- **ID/Cards** — student IDs, ATM cards, licenses
- **Keys** — house keys, padlocks, car keys
- **Accessories** — bags, watches, jewelry
- **Others** — miscellaneous items not covered above

### Standards
- Each item must belong to one category.
- Optional `tags[]` field allows cross-category classification (future enhancement).
- Categories enforced at item submission form level.

## Section 2: Data Schema
Establishes the structural foundation for storing items, users, and comments. Ensures audit compliance and role-based enforcement.

### Core Tables
- **Items** — `id`, `type`, `title`, `description`, `category`, `location`,`date`, `status`, `created_at`.
- **Users** — `id`, `name`, `role` (USER, ADMIN, SUPERADMIN), `email`, `has_seen_tour`.
- **Comments** — `id`, `item_id`, `user_id`, `content`, `parent_id`, `created_at`.

### Compliance Notes
- **Soft delete** for items and comments to preserve audit trail.
- **Role enforcement** via Supabase RLS (Row-Level Security).
- **Reports table** for flagged comments/items with snapshot fields.

## Section 3: Retrieval Requirements
Defines how users access and filter knowledge in NEU Found Hub. Written from a KM perspective, guiding developer implementation.

### Requirements
1. **Full-Text Search** — keyword search across title, description, location (`ilike` pattern).
2. **Type & Category Filter** — filter by Lost/Found/All and taxonomy categories.
3. **Status Filter** — active items in main feed; resolved/archived in Resolved History.
4. **Date Range Filter** — archive browsing by from/to dates.
5. **Real-Time Updates** — Supabase subscriptions for live feed refresh.
6. **Pagination** — Resolved History archive in pages of 8.

### KM Rationale
- Retrieval reflects how users think about finding items.
- Filters and archives transform discrete records into organizational knowledge.
- Real-time updates ensure immediate knowledge sharing.

## Section 4: Framework-to-App Mapping (SECI Model)
### Socialization (Tacit → Tacit)
- Features: Comment threads, threaded replies, real-time notifications.
- Tacit knowledge exchanged directly in dialogue.

### Externalization (Tacit → Explicit)
- Features: Item submission form, Gemini AI image analysis, Cloudinary upload.
- Tacit observations articulated into explicit records.

### Combination (Explicit → Explicit)
- Features: Search, FilterBar, Resolved History, admin moderation.
- Explicit records aggregated into structured knowledge.

### Internalization (Explicit → Tacit)
- Features: Intro.js onboarding tour, Resolved History browsing.
- Explicit records absorbed into tacit user practice.

## Section 5: KM Rationale
By consolidating taxonomy, schema, and retrieval requirements into one architecture:
- **Coverage:** Every item is categorized and retrievable.  
- **Distinctiveness:** Roles and statuses prevent confusion.  
- **Retrievability:** Structured filters and archives enable knowledge reuse.  
- **KM Alignment:** SECI phases are fully implemented, proving NEU Found Hub is a KM system.  
