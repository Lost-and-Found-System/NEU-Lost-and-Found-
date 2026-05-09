import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ResolvedPostCard } from '../components/ResolvedPostCard';
import { ResolvedFilters } from '../components/ResolvedFilters';
import { cn } from '../lib/utils';

export const ResolvedHistory = ({ user }: { user: any }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchResolvedItems();
  }, [page, activeCategory, searchQuery, dateFrom, dateTo]);

  const fetchResolvedItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('items')
        .select('*', { count: 'exact' })
        .eq('status', 'resolved')
        .order('created_at', { ascending: false });

      if (activeCategory !== 'All') {
        query = query.eq('category', activeCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      if (dateFrom) {
        query = query.gte('date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('date', dateTo);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      setItems(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching resolved items:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-blue-600 mb-1">
                <History className="w-6 h-6" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Archive Hall</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 font-serif tracking-tight">Resolved</h1>
              <p className="text-slate-500 max-w-lg">
                Browsing the community's successful returns and resolutions. These records are archived and read-only.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">{totalCount}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolutions</div>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <Info className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Filters */}
        <div className="mb-10 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <ResolvedFilters 
            searchQuery={searchQuery}
            setSearchQuery={(v) => { setSearchQuery(v); setPage(1); }}
            activeCategory={activeCategory}
            setActiveCategory={(v) => { setActiveCategory(v); setPage(1); }}
            dateFrom={dateFrom}
            setDateFrom={(v) => { setDateFrom(v); setPage(1); }}
            dateTo={dateTo}
            setDateTo={(v) => { setDateTo(v); setPage(1); }}
          />
        </div>

        {/* List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-4"
            >
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Archives...</p>
            </motion.div>
          ) : items.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {items.map((item) => (
                <ResolvedPostCard key={item.id} item={item} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <History className="w-8 h-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No resolved posts found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search query.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "w-12 h-12 rounded-2xl font-bold transition-all",
                    page === i + 1 
                      ? "bg-slate-900 text-white shadow-lg" 
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
