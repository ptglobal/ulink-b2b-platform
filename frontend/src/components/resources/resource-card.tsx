'use client';

import { motion } from 'framer-motion';
import { Calendar } from '@/components/icons';
import Image from 'next/image';
import { ResourceItem } from './types';

interface ResourceCardProps {
  resource: ResourceItem;
  locale: 'vi' | 'en' | 'ja';
  onClick: () => void;
  readDetailsLabel: string;
}

export function ResourceCard({ resource, locale, onClick, readDetailsLabel }: ResourceCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ulink-media-zoom group flex cursor-pointer flex-col rounded-none border border-slate-100 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-md"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden rounded-none">
        {resource.image ? (
          <Image
            src={resource.image}
            alt={resource.title[locale]}
            fill
            sizes="(max-width: 770px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute top-2 left-2 z-10 bg-blue-600/90 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none">
          {resource.badge[locale]}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{resource.date}</span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-2">
            {resource.title[locale]}
          </h3>

          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 font-normal">
            {resource.description[locale]}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1">
            {readDetailsLabel}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
