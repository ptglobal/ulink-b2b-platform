'use client';

import { motion } from 'framer-motion';
import { Calendar, FileDown } from 'lucide-react';
import Image from 'next/image';
import { ResourceItem } from './types';

interface ResourceCardProps {
  resource: ResourceItem;
  locale: 'vi' | 'en' | 'ja';
  onClick: () => void;
  readDetailsLabel: string;
  onDownload?: (resource: ResourceItem) => void;
}

export function ResourceCard({ resource, locale, onClick, readDetailsLabel, onDownload }: ResourceCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group flex flex-col border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer rounded-none"
      onClick={onClick}
    >
      {/* Image Box */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden rounded-none">
        <Image
          src={resource.image}
          alt={resource.title[locale]}
          fill
          sizes="(max-w-770px) 100vw, (max-w-1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Custom category badge on the top-left */}
        <div className="absolute top-2 left-2 z-10 bg-blue-600/90 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none">
          {resource.badge[locale]}
        </div>
      </div>

      {/* Content Box */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Date */}
          <div className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{resource.date}</span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-2">
            {resource.title[locale]}
          </h3>

          {/* Description */}
          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 font-normal">
            {resource.description[locale]}
          </p>
        </div>

        {/* Read more link at bottom */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1">
            {readDetailsLabel}
          </div>
          {resource.downloadUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDownload) {
                  onDownload(resource);
                }
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:border-blue-300 border border-slate-200 bg-slate-50 transition-colors rounded-none"
              title={locale === 'vi' ? 'Tải tài liệu' : locale === 'ja' ? 'ダウンロード' : 'Download'}
            >
              <FileDown className="h-3.5 w-3.5 text-blue-600" />
              {resource.size && <span className="font-mono text-[9px]">{resource.size}</span>}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
