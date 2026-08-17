'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';

interface GalleryImage {
  src: string;
  alt: string;
  label?: string;
}

interface ProductImageGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  // If product has NO images in Database
  if (!images || images.length === 0) {
    return (
      <BrandedMedia
        src={null}
        alt={`Hình minh họa ${productName}`}
        className="aspect-square w-full border border-border"
      />
    );
  }

  const currentImage = images[activeIndex] || images[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* MAIN SLIDE STAGE */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-sm flex items-center justify-center group">
        {/* Main Image */}
        <div
          onClick={() => setZoomOpen(true)}
          className="relative w-full h-full cursor-zoom-in p-6 sm:p-8 transition-transform duration-300"
        >
          <BrandedMedia
            src={currentImage.src}
            alt={currentImage.alt || productName}
            className="absolute inset-0"
            imageClassName="object-contain p-6 transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority
          />
        </div>

        {/* Previous Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:bg-brand hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Previous Image"
          >
            <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
          </button>
        )}

        {/* Next Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:bg-brand hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Next Image"
          >
            <ChevronRight className="h-5 w-5 stroke-[2.5]" />
          </button>
        )}

        {/* Slide Counter Badge Top Left */}
        {images.length > 1 && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-900/70 text-white text-[11px] font-extrabold backdrop-blur-md shadow-xs">
            {activeIndex + 1} / {images.length}
          </span>
        )}

        {/* Zoom Icon Button Bottom Right */}
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="absolute bottom-16 right-3 z-20 flex min-h-11 cursor-pointer items-center gap-1.5 border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:bg-brand hover:text-white"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          <span>Phóng to</span>
        </button>
      </div>

      {/* SLIDE THUMBNAILS CAROUSEL BAR */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          {images.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden border-2 bg-white transition-[color,background-color,border-color,box-shadow,opacity,transform] shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-blue-600 ring-2 ring-blue-600/30 scale-102 shadow-sm'
                    : 'border-slate-200/80 hover:border-slate-400 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt || `Thumbnail ${idx + 1}`}
                  fill
                  className="object-contain p-2"
                  sizes="88px"
                />
                {img.label && (
                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[9px] font-bold text-center py-0.5 truncate">
                    {img.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX ZOOM MODAL */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] aspect-square flex flex-col items-center justify-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-blue-400 text-sm font-bold flex items-center gap-1 cursor-pointer"
            >
              ✕ Đóng (Esc)
            </button>

            {/* Modal Image */}
            <div className="relative w-full h-full">
              <Image
                src={currentImage.src}
                alt={currentImage.alt || productName}
                fill
                className="object-contain p-4"
                sizes="100vw"
                priority
              />
            </div>

            {/* Modal Navigation Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-[color,background-color,border-color,box-shadow,opacity,transform] cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6 stroke-[3]" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-[color,background-color,border-color,box-shadow,opacity,transform] cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6 stroke-[3]" />
                </button>
              </>
            )}

            <p className="text-white/80 text-xs font-semibold mt-4 text-center">
              {currentImage.alt} ({activeIndex + 1}/{images.length})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
