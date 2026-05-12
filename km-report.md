# NEU Found Hub — KM Conceptual Report (Part I: Foundations)

## 1. Problem Statement
Lost-and-found processes at New Era University (NEU) currently operate informally, relying on bulletin boards, word-of-mouth, or scattered social media posts. This creates a **knowledge problem**: information about lost or found items is fragmented, unstructured, and often inaccessible to those who need it most.

The primary stakeholders affected are **students, faculty, and staff** who lose personal belongings or attempt to return found items. Without a structured system, items remain unrecovered, time is wasted searching multiple channels, and trust in institutional processes diminishes.

The **consequence of not solving this problem** is a persistent gap in knowledge sharing. Tacit observations (e.g., “I saw a wallet near the canteen”) are rarely converted into explicit, retrievable records. This leads to inefficiency, frustration, and reputational risk for the university. NEU Found Hub addresses this by embedding Knowledge Management (KM) principles into a digital platform that transforms lost-and-found into a structured knowledge system.

---

## 2. KM Framework
The chosen framework is the **SECI Model** (Socialization, Externalization, Combination, Internalization), developed by Nonaka and Takeuchi (1995). It explains how tacit and explicit knowledge interact to create organizational learning.

- **Socialization (Tacit → Tacit):** Knowledge shared directly through dialogue or observation.  
- **Externalization (Tacit → Explicit):** Tacit insights articulated into explicit records.  
- **Combination (Explicit → Explicit):** Explicit records aggregated, organized, and systematized.  
- **Internalization (Explicit → Tacit):** Explicit knowledge absorbed into personal practice.  

This framework was selected because it covers the **full cycle of knowledge conversion**, aligning with NEU’s community-driven workflows. Unlike purely explicit models (e.g., codification frameworks), SECI accounts for informal exchanges and experiential learning.

**Academic Sources:**  
- Nonaka, I., & Takeuchi, H. (1995). *The Knowledge-Creating Company: How Japanese Companies Create the Dynamics of Innovation.* Oxford University Press.  
- Alavi, M., & Leidner, D. E. (2001). *Review: Knowledge Management and Knowledge Management Systems: Conceptual Foundations and Research Issues.* MIS Quarterly, 25(1), 107–136.  

---

## 3. Framework-to-App Mapping
Each SECI phase is implemented through concrete app features:

- **Socialization:** Comment threads, threaded replies, and real-time notifications replicate informal dialogue. Tacit knowledge is exchanged directly among users.  
- **Externalization:** Item submission form, Gemini AI image analysis, and Cloudinary uploads convert tacit observations into explicit, structured records.  
- **Combination:** Search, FilterBar, Resolved History archive, and admin moderation aggregate explicit records into organizational knowledge.  
- **Internalization:** Intro.js onboarding tour and browsing resolved cases allow users to absorb explicit records into tacit understanding, shaping future behavior.  

This mapping demonstrates that NEU Found Hub is not just a CRUD app but a KM system, as every SECI phase has a corresponding feature.

---

## 4. Knowledge Architecture
The architecture consolidates taxonomy, schema, and retrieval requirements:

- **Taxonomy:** Items are categorized into Electronics, Clothing, ID/Cards, Keys, Accessories, and Others. This ensures metadata consistency and supports structured retrieval.  
- **Schema:** Core tables (Items, Users, Comments) enforce audit compliance and role-based access. Soft deletes preserve history, while reports capture flagged content.  
- **Retrieval Requirements:** Six behaviors define how users access knowledge — full-text search, type/category filters, status filters, date range filters, real-time updates, and pagination.  

These choices were made to balance **usability, compliance, and KM alignment**. Taxonomy ensures clarity, schema enforces accountability, and retrieval reflects how users think about finding items.

# NEU Found Hub — KM Conceptual Report (Part II: Analysis & References)

## 5. Limitations & Future Work
While NEU Found Hub implements KM principles, some limitations remain:

- **Single-category enforcement** restricts cross-tagging of items.  
- **Search precision** is limited by lack of Boolean operators.  
- **Scalability** requires indexing as item volume grows.  
- **Community adoption** depends heavily on onboarding tour effectiveness.  

Future versions (v2.0) could add multi-tagging, advanced search operators, improved indexing, and enhanced moderation workflows to strengthen KM capabilities.

---

## 6. References
- Nonaka, I., & Takeuchi, H. (1995). *The Knowledge-Creating Company: How Japanese Companies Create the Dynamics of Innovation.* Oxford University Press.  
- Alavi, M., & Leidner, D. E. (2001). *Review: Knowledge Management and Knowledge Management Systems: Conceptual Foundations and Research Issues.* MIS Quarterly, 25(1), 107–136.  
- Supabase. (2024). *Row-Level Security Documentation.* Retrieved from https://supabase.com/docs  
