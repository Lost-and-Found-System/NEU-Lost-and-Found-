import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

const categories = ['All', 'Electronics', 'Clothing', 'ID/Cards', 'Keys', 'Jewelry', 'Others'];

interface ResolvedFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  dateTo: string;
  setDateTo: (val: string) => void;
}

export const ResolvedFilters = ({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo
}: ResolvedFiltersProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
          <input 
            placeholder="Search resolved items..." 
            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search items"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-40">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" aria-hidden="true" />
            <input 
              type="date"
              className="w-full pl-10 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="From date"
            />
          </div>
          <div className="relative flex-1 md:w-40">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" aria-hidden="true" />
            <input 
              type="date"
              className="w-full pl-10 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="To date"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border cursor-pointer active:scale-95 focus:ring-2 focus:ring-blue-500 focus:outline-none',
              activeCategory === cat
                ? 'bg-slate-700 text-white border-slate-700 shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
