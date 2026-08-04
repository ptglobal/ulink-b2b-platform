'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TestimonialItem {
  id: number;
  company: string;
  logo: React.ReactNode;
  quote: string;
  name: string;
  role: string;
}

interface TestimonialCarouselProps {
  labels: {
    eyebrow: string;
    title: string;
    subtitle: string;
    company1: string;
    quote1: string;
    name1: string;
    role1: string;
    company2: string;
    quote2: string;
    name2: string;
    role2: string;
  };
}

export default function TestimonialCarousel({ labels }: TestimonialCarouselProps) {
  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      company: labels.company1,
      logo: (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4A5568] text-white">
            {/* Custom SVG logo matching the circular symbol with a lightning-bolt style arrow */}
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <polygon points="11.5,3 4,12 11.5,12 11.5,21 19,11 11.5,11" />
            </svg>
          </div>
          <span className="text-[18px] font-extrabold text-[#4A5568] tracking-tight">{labels.company1}</span>
        </div>
      ),
      quote: labels.quote1,
      name: labels.name1,
      role: labels.role1
    },
    {
      id: 2,
      company: labels.company2,
      logo: (
        <div className="flex items-center gap-2">
          {/* Custom SVG logo matching the geometric parallel lines symbol */}
          <div className="flex h-8 w-8 items-center justify-center text-[#4A5568]">
            <svg className="h-7 w-7 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 18L14 6M10 18L20 6" />
            </svg>
          </div>
          <span className="text-[18px] font-extrabold text-[#4A5568] tracking-tight">{labels.company2}</span>
        </div>
      ),
      quote: labels.quote2,
      name: labels.name2,
      role: labels.role2
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="w-full bg-[#F4F6F9] py-16 sm:py-20 border-t border-slate-200/60">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
        
        {/* === Header Section === */}
        <div className="text-center mb-12">
          <span className="text-[13px] font-bold text-[#1769E2] tracking-wider uppercase block">
            {labels.eyebrow}
          </span>
          <h2 className="mt-3 text-[22px] sm:text-[26px] font-extrabold text-[#0B192C] leading-tight">
            {labels.title}
          </h2>
          <p className="mt-1 text-[20px] sm:text-[24px] font-extrabold text-[#0B192C] leading-tight">
            {labels.subtitle}
          </p>
        </div>

        {/* === Carousel Container === */}
        <div className="relative flex items-center justify-center">
          
          {/* Left Arrow */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 lg:-left-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-transparent hover:bg-slate-200/50 text-slate-600 transition-colors focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
          </button>

          {/* Slider Content Wrapper */}
          <div className="w-full overflow-hidden max-w-[1100px] px-8">
            
            {/* Desktop Grid (Always shows both, no sliding needed since exactly 2 items) */}
            <div className="hidden md:grid grid-cols-2 gap-8 justify-center">
              {testimonials.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 flex flex-col justify-between items-center text-center min-h-[320px] transition-all duration-300 hover:shadow-md"
                >
                  {/* Company Logo & Name */}
                  <div className="mb-6 flex justify-center">
                    {item.logo}
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-[13px] sm:text-[14px] leading-relaxed text-slate-600 font-medium italic px-4 flex-1">
                    {item.quote}
                  </p>

                  {/* User Profile */}
                  <div className="mt-8 flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[#F1F5F9] text-slate-400 mb-3 border border-slate-100">
                      <User className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <span className="text-[15px] font-bold text-[#0B192C]">{item.name}</span>
                    <span className="text-[12px] text-slate-500 font-medium mt-1">{item.role}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Carousel (Swipes 1 item at a time) */}
            <div className="block md:hidden relative min-h-[340px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between items-center text-center min-h-[320px] w-full"
                >
                  {/* Company Logo & Name */}
                  <div className="mb-6 flex justify-center">
                    {testimonials[activeIndex].logo}
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-[13px] sm:text-[14px] leading-relaxed text-slate-600 font-medium italic px-2 flex-1">
                    {testimonials[activeIndex].quote}
                  </p>

                  {/* User Profile */}
                  <div className="mt-8 flex flex-col items-center">
                    <div className="h-11 w-11 rounded-full flex items-center justify-center bg-[#F1F5F9] text-slate-400 mb-3 border border-slate-100">
                      <User className="h-5.5 w-5.5 stroke-[1.5]" />
                    </div>
                    <span className="text-[14px] font-bold text-[#0B192C]">{testimonials[activeIndex].name}</span>
                    <span className="text-[11px] text-slate-500 font-medium mt-1">{testimonials[activeIndex].role}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Right Arrow */}
          <button 
            onClick={nextSlide}
            className="absolute right-0 lg:-right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-transparent hover:bg-slate-200/50 text-slate-600 transition-colors focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 stroke-[2.5]" />
          </button>

        </div>

        {/* Paging Dots (Mobile Only) */}
        <div className="flex md:hidden justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                activeIndex === index ? 'bg-[#1769E2] w-4' : 'bg-slate-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
