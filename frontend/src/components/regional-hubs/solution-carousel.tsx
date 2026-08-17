'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Truck,
  Activity,
  ShieldCheck,
  Thermometer,
  Layers,
  Settings,
  Package
} from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';

interface SlideItem {
  eyebrow: string;
  title: string;
  feat1: string;
  feat2: string;
  image: string;
  alt: string;
}

interface SolutionCarouselProps {
  slides: SlideItem[];
  labels: {
    rfqButton: string;
    learnMore: string;
  };
}

export default function SolutionCarousel({ slides, labels }: SolutionCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = slides.length;

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  }, []);

  const changeSlide = useCallback((index: number) => {
    if (index === activeSlide || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide(index);
      setIsTransitioning(false);
    }, 300);
  }, [activeSlide, isTransitioning]);

  const nextSlide = useCallback(() => {
    changeSlide((activeSlide + 1) % totalSlides);
  }, [activeSlide, changeSlide, totalSlides]);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  }, [nextSlide, stopAutoplay]);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const currentSlide = slides[activeSlide];

  // Helper to render slide-specific icons
  const getFeaturesIcons = (index: number) => {
    switch (index) {
      case 0: // Pallet Wrap
        return {
          icon1: <Activity className="h-6 w-6 text-brand shrink-0" />,
          icon2: <Truck className="h-6 w-6 text-brand shrink-0" />
        };
      case 1: // Industrial Gloves
        return {
          icon1: <ShieldCheck className="h-6 w-6 text-brand shrink-0" />,
          icon2: <Truck className="h-6 w-6 text-brand shrink-0" />
        };
      case 2: // Aluminum Tape
        return {
          icon1: <Thermometer className="h-6 w-6 text-brand shrink-0" />,
          icon2: <Truck className="h-6 w-6 text-brand shrink-0" />
        };
      case 3: // Cleanroom Wiper
        return {
          icon1: <Layers className="h-6 w-6 text-brand shrink-0" />,
          icon2: <Package className="h-6 w-6 text-brand shrink-0" />
        };
      case 4: // PE Shrink Film
      default:
        return {
          icon1: <Settings className="h-6 w-6 text-brand shrink-0" />,
          icon2: <ShieldCheck className="h-6 w-6 text-brand shrink-0" />
        };
    }
  };

  const { icon1, icon2 } = getFeaturesIcons(activeSlide);

  return (
    <section
      className="w-full border-t border-border bg-card py-12 sm:py-16"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <div className="ulink-container">
        <div className="mb-6 flex items-center border-b border-border" role="tablist" aria-label="Solution slides">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => changeSlide(i)}
              className={`flex h-11 min-w-11 items-center justify-center border-b-2 px-3 font-mono text-xs transition-colors ${
                activeSlide === i
                  ? 'border-brand bg-brand/[0.06] text-brand'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-label={`Slide ${i + 1}`}
              role="tab"
              aria-selected={activeSlide === i}
            >
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>

        {/* Carousel Container */}
        <div className="border border-border bg-background p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Column: Text & Features */}
            <div
              className={`transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
            >
              {/* Eyebrow */}
              <span className="text-[12px] font-bold text-brand tracking-wider uppercase block mb-3">
                {currentSlide.eyebrow}
              </span>

              {/* Title */}
              <h2 className="mb-8 text-2xl font-medium leading-snug text-foreground lg:text-3xl">
                {currentSlide.title}
              </h2>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                {/* Feature 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand/8">
                    {icon1}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{currentSlide.feat1}</p>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand/8">
                    {icon2}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{currentSlide.feat2}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/quick-order"
                  className={buttonVariants({ variant: 'primary', size: 'lg' })}
                >
                  {labels.rfqButton}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/solutions"
                  className={buttonVariants({ variant: 'quiet', size: 'lg' })}
                >
                  {labels.learnMore}
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Image */}
            <BrandedMedia
              src={currentSlide.image}
              alt={currentSlide.alt}
              sizes="(max-width: 1023px) 100vw, 50vw"
              className={`aspect-[4/3] border border-border bg-muted transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 ${
                isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
              }`}
              compactBrand
            />
          </div>
        </div>
      </div>
    </section>
  );
}
