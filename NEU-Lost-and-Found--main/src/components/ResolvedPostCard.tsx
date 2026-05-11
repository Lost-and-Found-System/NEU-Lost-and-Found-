import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Camera, User } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

interface Item {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  location: string;
  date: any;
  image_urls: string[];
  author_name: string;
  status: 'active' | 'resolved' | 'archived';
  created_at: any;
  is_anonymous: boolean;
}

const Badge = ({ children, variant = 'default' }: any) => {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    lost: 'bg-blue-700 text-blue-950',
    found: 'bg-blue-200 text-blue-950 border border-blue-300',
    resolved: 'bg-slate-200 text-slate-600 border border-slate-300',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest', variants[variant as keyof typeof variants])}>
      {children}
    </span>
  );
};

export const ResolvedPostCard = ({ item }: { item: Item }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all group"
    >
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        {item.image_urls && item.image_urls[0] ? (
          <img 
            src={item.image_urls[0]} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Camera className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="resolved">Resolved</Badge>
          <Badge variant={item.type}>{item.type}</Badge>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 line-clamp-1">{item.title}</h3>
          <p className="text-slate-500 text-sm line-clamp-2">{item.description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-slate-400 text-xs font-medium gap-1">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center text-slate-400 text-xs font-medium gap-1">
            <Calendar className="w-3 h-3 text-blue-400" />
            <span>{formatDate(item.date)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              {item.is_anonymous ? 'Anonymous' : item.author_name}
            </span>
          </div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">
            Archived
          </div>
        </div>
      </div>
    </motion.div>
  );
};
