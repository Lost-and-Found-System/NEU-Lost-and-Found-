# Framework Selection Memo

## 1. KM Problem
At New Era University (NEU), knowledge about found items is often lost, siloed, or hard to find. Students report lost IDs, wallets, and electronics informally through Facebook posts, bulletin boards, word-of-mouth, or guard booth logs with no digital record. This fragmented approach means knowledge exists but is inaccessible, leading to wasted time, unclaimed items, and unnecessary replacements.

## 2. Frameworks Evaluated

### Framework A: SECI Model (Nonaka & Takeuchi, 1995)
The SECI Model describes four modes of knowledge conversion:
- **Socialization (S):** Tacit → Tacit. Knowledge shared through direct interaction (e.g., a student telling another where they found an item).
- **Externalization (E):** Tacit → Explicit. Converting personal knowledge into documented form (e.g., posting a found item with a photo and description).
- **Combination (C):** Explicit → Explicit. Aggregating structured knowledge records into a searchable system (e.g., a searchable database of all posted items).
- **Internalization (I):** Explicit → Tacit. Users learning from the system through experience (e.g., a new student understanding how to use the platform through an onboarding tour).

### Framework B: Knowledge Mapping (Eppler, 2001)
Knowledge Mapping focuses on **categorization, visualization, and retrieval** of knowledge assets. It emphasizes:
- Identifying knowledge sources and flows.  
- Structuring knowledge into categories, taxonomies, or maps.  
- Supporting retrieval by making knowledge easier to locate and navigate.  

In a lost-and-found context, Knowledge Mapping would provide clear categories (e.g., electronics, clothing, documents) and retrieval pathways (search filters, metadata tags). However, it is more static and does not emphasize knowledge creation or conversion between tacit and explicit forms.  

## 3. Framework Selection: SECI Model
#### Reasons for Choosing SECI over Knowledge Mapping
- **Lifecycle coverage:** SECI covers the full knowledge lifecycle — from capture (Externalization) to retrieval (Combination) to learning (Internalization). Knowledge Mapping focuses primarily on categorization and retrieval.  
- **Dynamic knowledge creation:** SECI emphasizes the conversion of tacit knowledge into explicit records, which is critical for lost-and-found reporting. Knowledge Mapping does not address tacit knowledge flows.  
- **Feature alignment:** Every phase of the SECI cycle maps cleanly to a specific feature in the app. Knowledge Mapping provides structure but lacks direct mapping to interactive features.  
- **Holistic KM system:** SECI ensures the app is more than a database — it becomes a living KM environment where knowledge is created, shared, and reused.

## 4. SECI-to-App Feature Mapping

|  | App Feature | KM Rationale |
|----------------|-------------|--------------|
| **Socialization** | Comment thread on each item post | Students share contextual knowledge in dialogue (e.g., “I saw this near the library”). |
| **Externalization** | Item submission form + Gemini AI image analysis | A student who found an item converts tacit knowledge (appearance, location) into a structured, searchable record with title, description, category, location, and date. |
| **Combination** | Search, Filter, and Resolved History archive | Individual item records are aggregated into a filterable, searchable knowledge base. The Resolved History page creates an institutional archive of past cases. |
| **Internalization** | Onboarding tour | New users learn how to use the platform through a guided, interactive walkthrough — converting explicit instructions into tacit understanding of how to contribute knowledge. |

### References:  
- Nonaka, I., & Takeuchi, H. (1995). *The Knowledge-Creating Company*. Oxford University Press.
- Eppler, M. J. (2001). *Making Knowledge Visible Through Knowledge Maps: Concepts, Elements, Cases*. Proceedings of the 2001 International Conference on Knowledge Management. 