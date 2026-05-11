# Filter Bar

## Description

The `FilterBar` component provides a sticky header with:
- Tab navigation (`all`, `lost`, `found`)
- Search input with icon
- Category pill filters with "All" toggle logic

It's designed for item listing pages where users need to filter content by type, keyword, and category.

## Props

| Prop                 | Type                                         | Required | Default | Description                                                                 |
|----------------------|----------------------------------------------|----------|---------|-----------------------------------------------------------------------------|
| `searchQuery`        | `string`                                     | Yes      | —       | Current search input value.                                                 |
| `setSearchQuery`     | `(query: string) => void`                    | Yes      | —       | State setter for search query.                                              |
| `activeTab`          | `'all' \| 'lost' \| 'found'`                 | Yes      | —       | Currently selected main tab.                                                |
| `setActiveTab`       | `(tab: 'all' \| 'lost' \| 'found') => void`  | Yes      | —       | State setter for active tab.                                                |
| `activeCategories`   | `string[]`                                   | Yes      | —       | Array of currently selected category names.                                 |
| `setActiveCategories`| `(categories: string[]) => void`             | Yes      | —       | State setter for active categories.                                         |
| `categories`         | `string[]`                                   | Yes      | —       | Full list of available category names to display as pills.                  |

## Behavior Notes

- **Category logic:**  
  - Clicking `"All"` resets selection to `["All"]` only.  
  - Clicking any other category toggles it on/off.  
  - If no categories are selected (except `"All"`), it auto-selects `["All"]`.

- **Active tab animation:**  
  The active tab indicator uses `motion` with a spring animation (`layoutId="activeFilterTab"`).

## Usage Example

```tsx
import { useState } from 'react';
import { FilterBar } from '@/components/FilterBar';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Furniture'];

export default function ItemsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'lost' | 'found'>('all');
  const [categories, setCategories] = useState<string[]>(['All']);

  return (
    <FilterBar
      searchQuery={search}
      setSearchQuery={setSearch}
      activeTab={tab}
      setActiveTab={setTab}
      activeCategories={categories}
      setActiveCategories={setCategories}
      categories={CATEGORIES}
    />
  );
}
```

## Accessibility

- Search input includes icon placement (visual only; `Search` icon uses `aria-hidden` via lucide-react)
- Tabs and category pills are native `<button>` elements → fully keyboard accessible
- Focus states visible via `ring-4`, `ring-blue-100`, and border changes
- Motion animation is purely decorative; doesn't impact screen readers or keyboard navigation
- Color contrast meets minimum ratios (blue-700 on white, slate text on light backgrounds)
