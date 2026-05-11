# Resolved Filters

## Description

The `ResolvedFilters` component provides filtering controls for resolved items, including:
- Search input for text-based filtering
- Date range inputs (from / to)
- Category pill buttons

It's designed for pages that display resolved or archived items where users need to filter by keyword, date range, and category.

## Props

| Prop               | Type                       | Required | Default | Description                                      |
|--------------------|----------------------------|----------|---------|--------------------------------------------------|
| `searchQuery`      | `string`                   | Yes      | —       | Current search query value.                      |
| `setSearchQuery`   | `(val: string) => void`    | Yes      | —       | State setter for search query.                   |
| `activeCategory`   | `string`                   | Yes      | —       | Currently selected category name.                |
| `setActiveCategory`| `(val: string) => void`    | Yes      | —       | State setter for active category.                |
| `dateFrom`         | `string`                   | Yes      | —       | Start date value (YYYY-MM-DD format).            |
| `setDateFrom`      | `(val: string) => void`    | Yes      | —       | State setter for `dateFrom`.                     |
| `dateTo`           | `string`                   | Yes      | —       | End date value (YYYY-MM-DD format).              |
| `setDateTo`        | `(val: string) => void`    | Yes      | —       | State setter for `dateTo`.                       |

## Available Categories

The component uses a predefined list of categories:

```ts
['All', 'Electronics', 'Clothing', 'ID/Cards', 'Keys', 'Jewelry', 'Others']
```

## Usage Example
```tsx
import { useState } from 'react';
import { ResolvedFilters } from '@/components/ResolvedFilters';

export default function ResolvedPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  return (
    <ResolvedFilters
      searchQuery={search}
      setSearchQuery={setSearch}
      activeCategory={category}
      setActiveCategory={setCategory}
      dateFrom={dateFrom}
      setDateFrom={setDateFrom}
      dateTo={dateTo}
      setDateTo={setDateTo}
    />
  );
}
```
## Behavior Notes
-  Search input: Free-text filter – updates as the user types.
-  Date inputs: Use type="date" – browser-native date picker with YYYY-MM-DD values.
-  Category pills:
    - Clicking a category sets it as the active filter.
    - Unlike FilterBar, this is single-select (not multi-select).
    - "All" shows items from any category.

## Accessibility
- Search input has aria-label="Search items" for screen readers.
- Date inputs have aria-label="From date" and aria-label="To date".
- Category buttons use role="group" on the container and aria-pressed to indicate selection state.
- Icons (Search, Calendar) use aria-hidden="true" so they don't interfere with screen readers.
- All interactive elements are keyboard accessible with visible focus rings (focus:ring-2 focus:ring-blue-500).
- Buttons have cursor-pointer and active:scale-95 for visual feedback.

