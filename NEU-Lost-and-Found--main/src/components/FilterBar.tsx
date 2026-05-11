import React from 'react';
import { Search, Filter, Tag } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'all' | 'lost' | 'found';
  setActiveTab: (tab: 'all' | 'lost' | 'found') => void;
  activeCategories: string[];
  setActiveCategories: (categories: string[]) => void;
  categories: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  activeCategories,
  setActiveCategories,
  categories
}) => {
  const toggleCategory = (cat: string) => {
    if (cat === 'All') {
      setActiveCategories(['All']);
      return;
    }

    const next = activeCategories.includes(cat)
      ? activeCategories.filter(c => c !== cat)
      : [...activeCategories.filter(c => c !== 'All'), cat];

    setActiveCategories(next.length === 0 ? ['All'] : next);
  };

  return (
    <div className="sticky top-16 sm:top-20 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Main Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-full w-full lg:w-auto overflow-x-auto scrollbar-hide shrink-0 shadow-inner">
            {(['all', 'lost', 'found'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 lg:flex-none px-8 py-2 rounded-full text-sm font-bold capitalize transition-all relative whitespace-nowrap",
                  activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-blue-700 rounded-full shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full lg:flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-700 transition-colors" />
            <input 
              type="text" 
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-700 transition-all shadow-sm text-sm"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-2 pr-4">
            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-nowrap">Categories:</span>
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                  activeCategories.includes(cat) 
                    ? "bg-blue-700 border-blue-700 text-white shadow-md ring-2 ring-blue-100" 
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
