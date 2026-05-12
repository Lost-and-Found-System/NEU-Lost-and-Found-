# NEU Found Hub — KM Conceptual Report

## Section 1: Problem Statement

### The Knowledge Problem at New Era University  

New Era University's main campus in Quezon City serves thousands of students daily across multiple buildings, canteens, libraries, and outdoor spaces. Students regularly lose personal items — school identification cards, mobile phones, keys, wallets, and clothing — in any of these locations. This is not merely a matter of carelessness; it is a structural knowledge management problem.  

When a student loses an item, they possess a knowledge need: *where is my item?* When another student finds that item, they possess relevant tacit knowledge: *I know where this item is, what it looks like, and when I found it.* The critical failure is not in the existence of this knowledge — it exists — but in its transfer.  

Currently, the knowledge transfer mechanisms available to NEU students are severely limited:  

- **Facebook group posts** — knowledge is shared but quickly buried by newer posts, is unsearchable by category or date, and disappears from view within hours.  
- **Physical bulletin boards** — knowledge is location-dependent (you must physically visit the board), not searchable, and limited to text and pinned photographs.  
- **Word-of-mouth** — the most fragile mechanism; knowledge transfer depends entirely on social network proximity and is lost the moment the conversation ends.  
- **Guard booth reporting** — items are logged in a physical ledger with no digital record, no photograph, and no notification system for potential claimants.  

### Consequences of the Knowledge Gap  

The failure to transfer this knowledge has measurable consequences for NEU students:  

- **Academic disruption:** A lost school ID means a student cannot enter certain campus buildings, cannot borrow library books, and may be barred from examinations until a replacement is processed — a process that takes time and money.  
- **Financial loss:** Lost wallets, ATM cards, and mobile phones represent direct financial harm. Students from lower-income backgrounds are disproportionately affected by the inability to recover high-value items.  
- **Emotional stress:** The experience of losing a personal item — particularly one with sentimental value such as jewelry or a personalized ID — generates anxiety that affects academic performance.  
- **Institutional waste:** Items that remain unclaimed in the guard booth for weeks or months represent a waste of administrative resources and physical storage space.  

In knowledge management terms, this is a problem of **knowledge silos** and **tacit knowledge loss**. The knowledge of where found items are located is fragmented across individuals, stored in formats that cannot be searched, and lost entirely when those individuals forget, graduate, or simply move on.  

### The Knowledge Management Opportunity  

NEU Found Hub addresses this problem by creating a digital platform that converts fragmented, ephemeral tacit knowledge into structured, searchable, persistent explicit knowledge. A student who finds a wallet on the library steps can post a photograph, select a category (ID/Cards or Others), tag the location (Library Building 3), and submit the record in under two minutes. That knowledge is now searchable by every NEU student simultaneously.

## Section 2: KM Framework — The SECI Model  

### Overview  

NEU Found Hub is grounded in the SECI Model of knowledge creation, introduced by Nonaka and Takeuchi (1995) in their landmark work *The Knowledge-Creating Company.* The SECI Model describes knowledge creation as a continuous spiral through four modes of knowledge conversion, each representing a different way that tacit and explicit knowledge interact.  

This framework was selected over the Knowledge Mapping model (Eppler, 2001) because, while Knowledge Mapping emphasizes categorization, visualization, and retrieval, it is more static in nature and does not fully address tacit-to-explicit knowledge conversion. Knowledge Mapping is highly effective for structuring knowledge into taxonomies and maps, making information easier to locate, but it lacks the dynamic lifecycle coverage needed for lost-and-found reporting where knowledge must constantly move between tacit and explicit forms.  

By contrast, the SECI Model provides a feature-level mapping that directly guided the design of each component of NEU Found Hub (see Section 3). SECI ensures that tacit knowledge (e.g., “I found this wallet near the library”) is systematically converted into explicit, searchable records, aggregated into a knowledge base, and internalized by users through guided onboarding and repeated use. This makes SECI better suited to open, community-wide knowledge exchange platforms like NEU Found Hub, where knowledge creation and conversion are continuous and dynamic.


### The Four Phases of SECI  

**Socialization (Tacit → Tacit)**  
Socialization refers to the direct sharing of tacit knowledge between individuals through shared experience, observation, or dialogue. Nonaka and Takeuchi (1995) describe this as the most fundamental form of knowledge creation — the kind that happens when a master craftsman teaches an apprentice not through manuals but through demonstration.  
In the context of NEU Found Hub, Socialization occurs in the comment thread of each item post. A student who cannot fully describe a found item in the submission form can still share contextual knowledge through comments: *"I found this near the vending machines on the second floor of the Main Building."* This tacit knowledge — rooted in the finder's personal experience of the location — is shared directly with the potential claimant.  

**Externalization (Tacit → Explicit)**  
Externalization is the conversion of tacit knowledge into explicit, shareable form. Nonaka (1994) describes this as "the quintessential knowledge-creation process" because it is the mechanism by which personal knowledge becomes organizational knowledge.  
In NEU Found Hub, Externalization is the core function of the item submission form. When a student submits a found item, they convert their personal, tacit knowledge (what the item looks like, where they found it, when they found it) into a structured database record with defined fields, categories, and images. The Gemini AI image analysis feature assists this process by automatically generating a title, description, and category from a photograph — lowering the cognitive barrier to Externalization.  

**Combination (Explicit → Explicit)**  
Combination refers to the aggregation and synthesis of explicit knowledge from multiple sources into new explicit knowledge. This is the knowledge management function most commonly associated with databases, search engines, and information systems.  
In NEU Found Hub, Combination is implemented through the search and filter system (which aggregates all item records into a queryable knowledge base) and the Resolved History archive (which synthesizes all resolved cases into an institutional record). The FilterBar's multi-select category filter allows users to perform compound queries — for example, filtering for all active Found items in the Electronics or Keys categories simultaneously.  

**Internalization (Explicit → Tacit)**  
Internalization is the process by which explicit knowledge is absorbed into a user's tacit understanding through learning-by-doing. It is the SECI phase most directly associated with user experience design.  
In NEU Found Hub, Internalization is implemented through the intro.js onboarding tour. Rather than providing a static help page (pure explicit knowledge), the tour guides new users through the platform's features in context — teaching them how to search, filter, post, and comment through guided action. Through repeated use of the platform, students also internalize community norms: what constitutes a good item description, how quickly to post a found item, and how to communicate effectively in the comment thread.  


## Section 3: Framework-to-App Mapping  

### Overview  

This section demonstrates that each component of the SECI Model is concretely implemented in NEU Found Hub. A KM system that cannot trace its features to a theoretical framework is merely a database with a KM label. The explanations below show that NEU Found Hub was designed from the framework up — not retrofitted after the fact.  

**Socialization → Comment Thread and Real-Time Notifications**  
The item detail modal's comment thread implements Socialization by enabling live knowledge dialogue between the finder and potential claimants. Each comment is a unit of tacit knowledge being shared — the finder's memory of where the item was, what it was near, what condition it was in. Threaded replies allow this dialogue to deepen without losing context. The real-time notification system (which fires a toast when someone comments on your post or replies to your comment) ensures that knowledge exchange is not interrupted by the asynchronous nature of a web application. In a traditional lost-and-found system, this dialogue never happens — the finder leaves the item at the guard booth and walks away.  

**Externalization → Item Submission Form and Gemini AI Analysis**  
The item submission form is the primary Externalization interface. It provides structured fields (title, description, category, location, date, contact info) that convert a finder's personal experience into a retrievable record. The integration of Gemini AI image analysis is a direct enhancement of the Externalization process: when a student uploads a photograph of a found item and the title field is empty, the AI analyzes the image and generates a suggested title, description, and category. This lowers the cognitive barrier to Externalization — students who struggle to describe an item in writing can let the photograph do the work.  

**Combination → Search, FilterBar, and Resolved History**  
The FilterBar implements Combination at the retrieval layer: it allows users to query the aggregated knowledge base by type (Lost/Found), category (up to 6 categories), and keyword. The Supabase `ilike` search covers title, description, and location simultaneously, reflecting the KM Analyst's requirement that users should be able to find items using any word they associate with the loss event. The Resolved History page implements Combination at the archival layer: it aggregates all resolved cases into a paginated, filterable institutional record. Over time, this archive becomes a valuable organizational knowledge asset — a searchable history of every item that was successfully recovered at NEU.  

**Internalization → Onboarding Tour and Archive Browsing**  
The intro.js onboarding tour guides first-time users through the platform's six core functions in sequence, with step-specific instructions displayed over the relevant UI element. This is not a help page — it is learning by doing, which is precisely what Nonaka and Takeuchi (1995) describe as Internalization. Through guided action (clicking through the tour), users develop tacit familiarity with the platform that persists after the tour ends. Browsing the Resolved History archive also contributes to Internalization: students who see that detailed descriptions and clear photos lead to faster resolutions will unconsciously adjust their own posting behavior.  

## Section 4: Knowledge Architecture  

### 4.1 Taxonomy Design  

The six-category taxonomy (Electronics, Clothing, ID/Cards, Keys, Accessories, Others) was designed using two principles: **coverage** (every lost campus item must fit into at least one category) and **distinctiveness** (categories must be mutually exclusive enough for confident single-category assignment).  

The taxonomy directly drives three system components: the FilterBar category pills (retrieval), the item submission category dropdown (classification), and the Gemini AI category mapping (automated classification). By maintaining consistency across all three, the system ensures that the same category label is used whether the item was manually classified by the poster or automatically classified by the AI.  

### 4.2 Knowledge Lifecycle  

Each item record in NEU Found Hub has a status field with three values that represent the knowledge lifecycle:  

- **active:** The item record is an open knowledge claim or contribution. It appears in the main feed and is searchable.  
- **resolved:** The item has been successfully matched and the case is closed. The record moves to the Resolved History archive — it is no longer shown in the main feed but remains searchable as institutional memory.  
- **archived:** The record has been removed from community view by an administrator. This status is used for duplicate posts, spam, or items that were never actually lost/found. Archived items are visible only to administrators.  

### 4.3 Anonymous Posting  

The `is_anonymous` boolean field supports a privacy model that is essential for knowledge contribution quality. Some finders of sensitive items (school IDs, ATM cards, personal documents) may be uncomfortable sharing their identity publicly — particularly if the item belongs to someone they know personally. By allowing anonymous posting, NEU Found Hub lowers the barrier to Externalization for these edge cases. Anonymous posts display "Anonymous" as the author name and hide the contact info field entirely — claimants must use the comment thread to make contact.  

### 4.4 Known Limitation: Missing Tags Field  

The current Item schema does not include a `tags` field for cross-category classification. This means an item like a laptop bag (which belongs to both Electronics and Clothing) must be assigned to one category only. This is a known limitation documented in `docs/km-architecture.md`. Future versions of the platform should implement a `tags[]` array field and a tag-based search filter.  

## Section 5: Limitations and Future Work  

### 5.1 Current Limitations  

**Limitation 1: No Direct Messaging**  
All communication between posters and claimants is public through the comment thread. For sensitive items (found personal IDs, wallets with personal information), public comments may expose claimant information to other users. The current `contact_info` sub-modal provides a partial solution (contact info is hidden behind a button) but does not enable private conversation.  
*Future solution:* Implement a direct messaging feature using Supabase Realtime channels, allowing posters and claimants to exchange messages privately.  

**Limitation 2: No AI-Powered Item Matching**  
The system has no mechanism for automatically suggesting that a "found wallet" post may correspond to a "lost wallet" post. Users must search manually. In a platform with hundreds of active posts, this manual matching is inefficient.  
*Future solution:* Use Supabase's `pgvector` extension to generate text embeddings of item descriptions and perform semantic similarity searches. A "possible match" notification could be sent automatically when a new post's embedding is close to an existing post.  

**Limitation 3: No Cross-Category Tagging**  
As documented in Section 4, the Item schema lacks a `tags` field for cross-category classification. This means a laptop bag must be assigned to a single category, reducing retrieval precision for items that span multiple categories.  
*Future solution:* Add a `tags[]` string array field to the Item interface and a tag-based search filter to the FilterBar.  

### 5.2 Future Work  
 
- **Version 2.0 Priority 1:** Direct messaging between posters and claimants using Supabase Realtime  
- **Version 2.0 Priority 2:** AI-powered semantic matching using `pgvector` embeddings  
- **Version 2.0 Priority 3:** Cross-category tagging with tag-based FilterBar search  

## Section 6: References
- Nonaka, I. (1994). A dynamic theory of organizational knowledge creation. *Organization Science, 5*(1), 14–37.  
- Nonaka, I., & Takeuchi, H. (1995). *The knowledge-creating company: How Japanese companies create the dynamics of innovation.* Oxford University Press.  
- Eppler, M. J. (2001). *Making Knowledge Visible Through Knowledge Maps: Concepts, Elements, Cases.* Proceedings of the 2001 International Conference on Knowledge Management.  