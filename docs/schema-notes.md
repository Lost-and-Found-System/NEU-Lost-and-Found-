# Data Schema
## Overview
The data schema defines how lost-and-found records are stored, categorized, and retrieved in NEU Found Hub. It integrates the six-category taxonomy and enforces audit compliance through soft deletes and role-based access.

## Core Tables
### Items
- **Primary Key:** `id` (uuid, default `gen_random_uuid()`)
- **Columns:**
  - `type` (text, CHECK: 'lost' or 'found')
  - `title` (text, required)
  - `description` (text)
  - `category` (text, taxonomy category: Electronics, Clothing, ID/Cards, Keys, Accessories, Others)
  - `location` (text)
  - `date` (timestamp with time zone)
  - `image_urls` (text[], default empty array)
  - `author_uid` (uuid, FK → `auth.users.id`)
  - `author_name` (text)
  - `author_photo` (text)
  - `status` (text, default 'active', CHECK: 'active', 'resolved', 'archived')
  - `contact_info` (text)
  - `is_anonymous` (boolean, default false)
  - `created_at` (timestamp with time zone, default `now()`)

### Users
- **PK:** `id` (uuid, FK → `auth.users.id`)
- **Columns:**
  - `display_name` (text)
  - `email` (text, unique)
  - `avatar_url` (text)
  - `role` (text, default 'user', CHECK: 'user', 'admin', 'super_admin')
  - `created_at` (timestamp with time zone, default `now()`)
  - `has_seen_tour` (boolean, default false)
  - `is_disabled` (boolean, default false)

### Comments
- **PK:** `id` (uuid, default `uuid_generate_v4()`)
- **Columns:**
  - `item_id` (uuid, FK → `items.id`)
  - `author_uid` (uuid)
  - `author_name` (text)
  - `author_photo` (text)
  - `content` (text)
  - `created_at` (timestamp with time zone, default `now()`)
  - `parent_id` (text, supports threaded replies)

## Relationships
- `comments.item_id` → `items.id`  
- `items.author_uid` → `auth.users.id`  
- `users.id` → `auth.users.id`  

## Audit & Compliance Notes
- **Soft Delete:** Implemented via `status` (items) and `is_disabled` (users).  
- **Role Enforcement:** `users.role` enforces SUPERADMIN, ADMIN, and USER privileges.  
- **Accountability:** `created_at` timestamps ensure traceability of records.  

## Limitations
- **Cross-category tagging gap:** Items currently store a single `category` text field. Future schema should fully implement `tags[]`.  
- **Moderation:** Comments may require reporting and moderation features in later versions.  
- **Scalability:** Indexing on `category`, `status`, and `created_at` will be required as item volume grows.  
