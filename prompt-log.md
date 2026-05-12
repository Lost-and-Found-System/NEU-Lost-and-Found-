# KM Analyst Prompt Log

## Entry 1
**Date:** April 8, 2026

**Task:** Define KM Problem for NEU Found Hub

**Prompt to AI:**
“Help me articulate the KM problem for a campus lost-and-found system.”

**AI Output:**
- Highlighted fragmentation of lost-and-found knowledge
- Emphasized inefficiency, wasted time, and reduced trust
- Framed issue as tacit knowledge (“I know where your wallet is”) needing conversion into explicit, searchable records

**What I Changed / Rejected:**
- Expanded with concrete examples: Facebook posts disappearing, bulletin boards rarely checked, word-of-mouth chains breaking, guard booth records not digitized
- Reframed consequences to emphasize knowledge loss, retrieval inefficiency, and siloed information
- Strengthened narrative by showing how items remain unclaimed for weeks, forcing students to replace IDs and wallets unnecessarily

**What I Learned:**
- A strong KM problem statement must go beyond inconvenience — it must highlight how tacit knowledge is trapped in the wrong format and location.

## Entry 2
**Date:** April 9, 2026

**Task:** Selecting Appropriate KM Framework

**Prompt to AI:**
“Draft a memo comparing SECI vs. Knowledge Mapping, and recommend one.”

**AI Output:**
- Compared SECI Model (Nonaka & Takeuchi, 1995) with Knowledge Mapping (Eppler, 2001)
- Highlighted SECI’s four modes of knowledge conversion: Socialization, Externalization, Combination, Internalization
- Noted Knowledge Mapping’s strengths in categorization, visualization, and retrieval
- Recommended SECI for dynamic tacit-to-explicit conversion and lifecycle coverage

**What I Changed / Rejected:**
- Strengthened rationale for SECI by linking each phase directly to app features (e.g., onboarding tour for Internalization)
- Retained Knowledge Mapping discussion but positioned it as secondary, noting its static nature and limited tacit knowledge handling

**What I Learned:**
- Framework selection must demonstrate feature alignment — reviewers expect clear mapping from theory to implementation.
- SECI’s holistic cycle makes NEU Found Hub more than a database; it becomes a KM environment where knowledge is created, shared, and reused.
- Including alternative frameworks (Knowledge Mapping) strengthens the defense by showing evaluation, not just preference.

## Entry 3
**Date:** April 9, 2026

**Task:** Define Taxonomy Categories

**Prompt to AI:**
“Suggest taxonomy categories for lost-and-found items.”

**AI Output:**
- Proposed six categories: Personal Items, Electronics, Clothing, Documents, Accessories, Miscellaneous

**What I Changed / Rejected:**
- Replaced Personal Items with Keys to reflect the immediate practical consequences of losing dorm or vehicle keys
- Split Documents into ID/Cards to highlight urgency and sensitivity of lost IDs (e.g., school IDs, ATM cards)
- Changed Miscellaneous to Others for clarity and to serve as a catch-all category
- Noted taxonomy gap: absence of cross-category tagging (e.g., laptop bag could be Electronics and Accessory)

**What I Learned:**
- The AI was useful for generating an initial list to react to. The final taxonomy reflects my own judgment about NEU-specific item patterns, not the AI's generic university context.


## Entry 4
**Date:** April 15, 2026

**Task:** Establish Initial Data Schema

**Prompt to AI:**
“Draft schema notes for Items, Users, Comments with audit compliance.”

**AI Output:**
- Suggested normalized schema for Items, Users, and Comments tables
- Recommended soft deletes via status fields
- Proposed Reports table for flagged content
- Emphasized audit compliance and role-based enforcement

**What I Changed / Rejected:**
- Integrated the six-category taxonomy directly into the `Items.category` field instead of a generic text field
- Expanded Items table with additional fields: `image_urls[]`, `contact_info`, `is_anonymous`, and `author_photo` for richer metadata
- Adjusted Users table to include `has_seen_tour` (onboarding tracking) and `is_disabled` for account control
- Enhanced Comments table with `parent_id` to support threaded replies
- Added explicit audit & compliance notes (soft delete via status, role enforcement via `users.role`, accountability via `created_at`)

**What I Learned:**  
- Schema design must integrate taxonomy and retrieval logic from the start, not as an afterthought.
- Audit compliance is best enforced structurally (soft delete, role enforcement) rather than relying solely on application logic.
- Anticipating future scalability (indexing, moderation, cross-category tagging) strengthens schema documentation and shows foresight.

## Entry 5
**Date:** April 16, 2026

**Task:** Define Retrieval Requirements

**Prompt to AI:**
“Define retrieval requirements in KM terms.”

**AI Output:**
- Defined retrieval logic with search filters (category, location, date, status)
- Included keyword search across title/description with partial matches
- Proposed tag-based retrieval for cross-category classification
- Outlined role-based visibility (USER, ADMIN, SUPERADMIN)
- Provided retrieval examples in table format

**What I Changed / Rejected:**  
- Added explicit type and category filter requirement (Lost/Found/All + taxonomy categories)
- Clarified status filter behavior: active-only feed, resolved items in Resolved History, archived hidden from community view
- Introduced date range filter for archive browsing
- Specified pagination (8 items per page) for Resolved History archive

**What I Learned:**  
- Retrieval requirements must be documented as explicit KM behaviors, not just technical features.
- Aligning retrieval logic with SECI phases (Combination, Socialization) makes KM principles visible in implementation.