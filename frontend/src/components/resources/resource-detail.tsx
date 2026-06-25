'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Star,
  Calendar,
  Award,
  Clock,
  ArrowLeft,
  FileDown,
  ShieldCheck,
  Facebook,
  Linkedin,
  Link2,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Printer,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ResourceItem } from './types';

interface ResourceDetailProps {
  resource: ResourceItem;
  locale: 'vi' | 'en' | 'ja';
  onBack: () => void;
  relatedArticles: ResourceItem[];
  onSelectRelated: (item: ResourceItem) => void;
  labels: any;
  handleShare: (resource: ResourceItem) => void;
  onDownload?: (resource: ResourceItem) => void;
}

export function ResourceDetail({
  resource,
  locale,
  onBack,
  relatedArticles,
  onSelectRelated,
  labels,
  handleShare,
  onDownload
}: ResourceDetailProps) {
  // Table of Contents Section States
  const [activeSectionId, setActiveSectionId] = useState('sec-1');
  
  // Audio Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioTime, setAudioTime] = useState(0); // in seconds
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Audio Time ticking
  useEffect(() => {
    if (isPlaying) {
      audioIntervalRef.current = setInterval(() => {
        setAudioTime((prev) => {
          const nextVal = prev + audioSpeed;
          if (nextVal >= resource.audioSecs) {
            setIsPlaying(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            return 0;
          }
          return nextVal;
        });
      }, 1000);
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }

    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, [isPlaying, audioSpeed, resource]);

  // Reset audio when resource changes
  useEffect(() => {
    setIsPlaying(false);
    setAudioTime(0);
    setActiveSectionId('sec-1');
  }, [resource]);

  // Audio helper: format seconds to MM:SS
  const formatAudioTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkipForward = () => {
    setAudioTime((prev) => Math.min(prev + 10, resource.audioSecs));
  };

  const handleSkipBackward = () => {
    setAudioTime((prev) => Math.max(prev - 10, 0));
  };

  const toggleSpeed = () => {
    setAudioSpeed((prev) => {
      if (prev === 1) return 1.5;
      if (prev === 1.5) return 2;
      return 1;
    });
  };

  return (
    <motion.div
      key="detail-view"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-8"
    >
      {/* Top Breadcrumb & Back Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-8">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="hover:text-blue-600 transition-colors cursor-pointer" onClick={onBack}>
            {labels.home[locale]}
          </span>
          <span>/</span>
          <button
            onClick={onBack}
            className="hover:text-blue-600 transition-colors"
          >
            {labels.resources[locale]}
          </button>
          <span>/</span>
          <span className="text-slate-500 font-medium line-clamp-1 max-w-[200px] sm:max-w-xs">
            {resource.title[locale]}
          </span>
        </div>
      </div>

      {/* Main Detail Grid Layout (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Column 1: Left Column (2/12) - Back Button & TOC & Download PDF */}
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24">
          {/* Back button */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{labels.backToList[locale]}</span>
          </button>

          {/* Table of Contents */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
              {labels.tocTitle[locale]}
            </h4>

            <nav className="flex flex-col space-y-3.5">
              {resource.sections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSectionId(sec.id);
                      const el = document.getElementById(sec.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={cn(
                      "text-[11px] text-left leading-normal pl-3 transition-all",
                      isActive
                        ? "border-l-2 border-blue-600 text-blue-600 font-bold"
                        : "border-l border-slate-100 text-slate-400 hover:text-slate-800 hover:border-slate-300"
                    )}
                  >
                    {sec.num} {sec.title[locale]}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* PDF Download Button */}
          {resource.downloadUrl && (
            <button
              onClick={() => onDownload && onDownload(resource)}
              className="w-full flex items-center justify-center gap-2 h-11 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors rounded-none mt-4"
            >
              <FileDown className="h-4 w-4 text-blue-600" />
              <span>{labels.downloadPdf[locale]} {resource.size ? `(${resource.size})` : ''}</span>
            </button>
          )}
        </div>

        {/* Column 2: Center Content Column (7/12) - Main Article Content */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Information */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 text-xs">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 border border-blue-100 rounded-none uppercase">
                <Star className="h-3 w-3 fill-blue-600" />
                {resource.badge[locale]}
              </span>
              {/* Date */}
              <span className="text-slate-400 font-mono">{resource.date}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {resource.title[locale]}
            </h1>

            {/* Short Description */}
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
              {resource.description[locale]}
            </p>

            {/* Author Box & Social sharing */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-100">
                  <Image
                    src={resource.author.avatar}
                    alt={resource.author.name[locale]}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-800">{resource.author.name[locale]}</div>
                  <div className="text-slate-400 mt-0.5">{resource.author.role[locale]}</div>
                </div>
              </div>

              {/* Share widgets */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">{labels.shareArticle[locale]}</span>
                <button
                  onClick={() => alert('Chia sẻ lên Facebook')}
                  className="h-8 w-8 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors rounded-none"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => alert('Chia sẻ lên LinkedIn')}
                  className="h-8 w-8 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors rounded-none"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleShare(resource)}
                  className="h-8 w-8 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors rounded-none"
                  title="Copy Link"
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Big Cover Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-slate-100 rounded-none bg-slate-50">
            <Image
              src={resource.image}
              alt={resource.title[locale]}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Content Sections */}
          <div className="space-y-8 pt-4">
            {resource.sections.map((sec) => (
              <div key={sec.id} id={sec.id} className="space-y-3.5 scroll-mt-24">
                {/* Section Title */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {sec.num} {sec.title[locale]}
                </h2>

                {/* Section Content Text */}
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-normal">
                  {sec.content[locale]}
                </p>

                {/* Optional Alert Box inside section */}
                {sec.alertText && (
                  <div className="p-4 bg-blue-50/50 border border-blue-100/70 flex gap-3 text-xs sm:text-sm text-slate-700 rounded-none">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-normal">
                      {sec.alertText[locale]}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Related Articles Widget */}
          {relatedArticles.length > 0 && (
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center pb-1">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {labels.relatedTitle[locale]}
                </h3>
                <button
                  onClick={onBack}
                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <span>{labels.seeAll[locale]}</span>
                  <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectRelated(art)}
                    className="flex gap-3 items-start cursor-pointer group p-3 border border-slate-100 hover:border-slate-300 transition-all bg-slate-50/30 hover:bg-white rounded-none"
                  >
                    <div className="relative h-14 w-14 shrink-0 bg-slate-100 overflow-hidden border border-slate-100 rounded-none">
                      <Image
                        src={art.image}
                        alt={art.title[locale]}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {art.title[locale]}
                      </h4>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono mt-1">
                        <span>{art.date}</span>
                        <span>•</span>
                        <span>{art.readTime[locale]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Right Column (3/12) - AI Summary, Audio Player & Related Articles */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
          
          {/* AI Summary Card */}
          <div className="border border-slate-100 bg-[#F8FAFC] p-5 rounded-none space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                {labels.aiSummaryTitle[locale]}
                <span className="text-[8px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-none uppercase">
                  BETA
                </span>
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              {resource.aiSummary.intro[locale]}
            </p>

            {/* Bullet points */}
            <ul className="space-y-2.5">
              {resource.aiSummary.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-2 items-start text-xs text-slate-600 font-normal">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{bullet[locale]}</span>
                </li>
              ))}
            </ul>

            {/* Two Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => alert(resource.aiSummary.intro[locale])}
                className="h-10 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-blue-600 rounded-none transition-colors"
              >
                {labels.summaryBtn[locale]}
              </button>
              <button
                onClick={() => setIsPlaying(true)}
                className="h-10 bg-[#0F1E36] hover:bg-[#1769E2] text-white text-xs font-bold flex items-center justify-center gap-1.5 rounded-none transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>{labels.readToMe[locale]}</span>
              </button>
            </div>
          </div>

          {/* Audio Reader Player Card */}
          <div className="border border-slate-100 bg-white p-5 rounded-none space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              {labels.readArticleAudio[locale]}
            </h3>

            {/* Simulated Waveform Graphic */}
            <div className="h-12 flex items-end justify-between gap-[2px] px-2 py-1 bg-slate-50/50 border border-slate-100/50">
              {Array.from({ length: 32 }).map((_, idx) => {
                const heights = [
                  12, 18, 24, 32, 18, 14, 20, 28, 40, 26, 16, 22, 34, 44, 30, 18, 
                  12, 22, 28, 38, 22, 14, 18, 26, 36, 24, 16, 20, 30, 42, 28, 12
                ];
                const height = heights[idx] || 20;
                const progress = audioTime / resource.audioSecs;
                const barFraction = idx / 32;
                const isPlayed = barFraction <= progress;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "w-[3px] transition-colors rounded-none",
                      isPlayed ? "bg-blue-600" : "bg-slate-200"
                    )}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={handleSkipBackward}
                className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-10 w-10 flex items-center justify-center bg-[#0F1E36] hover:bg-[#1769E2] text-white rounded-full transition-colors shadow-sm"
              >
                {isPlaying ? (
                  <Pause className="h-4.5 w-4.5 fill-white" />
                ) : (
                  <Play className="h-4.5 w-4.5 fill-white ml-0.5" />
                )}
              </button>

              <button
                onClick={handleSkipForward}
                className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                title="Forward 10s"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              <button
                onClick={toggleSpeed}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors min-w-[32px] text-right"
              >
                {audioSpeed.toFixed(1)}x
              </button>
            </div>

            {/* Time Tracker Row */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-2">
              <span>{formatAudioTime(audioTime)}</span>
              <span>{resource.audioDuration}</span>
            </div>
          </div>



          {/* Modal Footer Actions (Extra actions for details) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-100 px-5 py-4 bg-slate-50">
            <div className="flex gap-2">
              <button
                onClick={() => handleShare(resource)}
                className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors rounded-none"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                {labels.modalShare[locale]}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors rounded-none"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                {labels.modalPrint[locale]}
              </button>
              {resource.downloadUrl && (
                <button
                  onClick={() => onDownload && onDownload(resource)}
                  className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors rounded-none"
                >
                  <FileDown className="h-3.5 w-3.5 text-blue-600" />
                  {labels.modalDownload ? labels.modalDownload[locale] : (locale === 'vi' ? 'Tải về máy' : locale === 'ja' ? 'ダウンロード' : 'Download')}
                </button>
              )}
            </div>
            
            <button
              onClick={onBack}
              className="border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors rounded-none"
            >
              {labels.modalClose[locale]}
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
