'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Truck, Activity, ShieldCheck, Thermometer, Layers, Settings, Package } from 'lucide-react';

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

  // Function to handle slide change with fade effect
  const changeSlide = (index: number) => {
    if (index === activeSlide || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide(index);
      setIsTransitioning(false);
    }, 300); // match transition duration
  };

  const nextSlide = () => {
    changeSlide((activeSlide + 1) % totalSlides);
  };

  // Setup Autoplay
  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [activeSlide, isTransitioning]);

  const currentSlide = slides[activeSlide];

  // Helper to render slide-specific icons
  const getFeaturesIcons = (index: number) => {
    switch (index) {
      case 0: // Pallet Wrap
        return {
          icon1: <Activity className="h-6 w-6 text-[#1769E2] shrink-0" />,
          icon2: <Truck className="h-6 w-6 text-[#1769E2] shrink-0" />
        };
      case 1: // Industrial Gloves
        return {
          icon1: <ShieldCheck className="h-6 w-6 text-[#1769E2] shrink-0" />,
          icon2: <Truck className="h-6 w-6 text-[#1769E2] shrink-0" />
        };
      case 2: // Aluminum Tape
        return {
          icon1: <Thermometer className="h-6 w-6 text-[#1769E2] shrink-0" />,
          icon2: <Truck className="h-6 w-6 text-[#1769E2] shrink-0" />
        };
      case 3: // Cleanroom Wiper
        return {
          icon1: <Layers className="h-6 w-6 text-[#1769E2] shrink-0" />,
          icon2: <Package className="h-6 w-6 text-[#1769E2] shrink-0" />
        };
      case 4: // PE Shrink Film
      default:
        return {
          icon1: <Settings className="h-6 w-6 text-[#1769E2] shrink-0" />,
          icon2: <ShieldCheck className="h-6 w-6 text-[#1769E2] shrink-0" />
        };
    }
  };

  const { icon1, icon2 } = getFeaturesIcons(activeSlide);

  return (
    <section 
      className="w-full bg-white py-14 border-t border-slate-100"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
        
        {/* Pagination Dots (Above Carousel Box) */}
        <div className="flex justify-center items-center gap-3 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => changeSlide(i)}
              className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                activeSlide === i 
                  ? 'border-[#1769E2] w-5 h-5 bg-[#1769E2]/5' 
                  : 'border-slate-300 hover:border-[#1769E2]/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                activeSlide === i ? 'bg-[#1769E2] scale-125' : 'bg-transparent'
              }`} />
            </button>
          ))}
        </div>

        {/* Carousel Container */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 lg:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Left Column: Text & Features */}
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
              {/* Eyebrow */}
              <span className="text-[12px] font-bold text-[#1769E2] tracking-wider uppercase block mb-3">
                {currentSlide.eyebrow}
              </span>
              
              {/* Title */}
              <h2 className="text-[24px] lg:text-[28px] font-bold text-slate-900 leading-snug mb-8">
                {currentSlide.title}
              </h2>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                {/* Feature 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1769E2]/8">
                    {icon1}
                  </div>
                  <p className="text-[12px] leading-relaxed text-slate-500">
                    {currentSlide.feat1}
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1769E2]/8">
                    {icon2}
                  </div>
                  <p className="text-[12px] leading-relaxed text-slate-500">
                    {currentSlide.feat2}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/contact"
                  className="bg-[#1769E2] text-white text-[13px] font-semibold py-3 px-6 rounded-md flex items-center gap-2 hover:bg-[#1257bd] transition-colors"
                >
                  {labels.rfqButton}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/solutions"
                  className="border border-[#1769E2] text-[#1769E2] text-[13px] font-semibold py-3 px-6 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {labels.learnMore}
                </a>
              </div>
            </div>

            {/* Right Column: Visual Image */}
            <div className={`relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentSlide.image}
                alt={currentSlide.alt}
                className="h-full w-full object-cover"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
