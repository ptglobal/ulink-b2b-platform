'use client';

import { useState } from 'react';
import { Tile } from '@carbon/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Building, ChevronLeft, ChevronRight, User } from '@/components/icons';
import { Button } from '@/components/ui/button';

interface TestimonialItem {
  company: string;
  quote: string;
  name: string;
  role: string;
}

interface TestimonialCarouselProps {
  content: {
    eyebrow: string;
    title: string;
    subtitle: string;
    previousLabel: string;
    nextLabel: string;
    items: TestimonialItem[];
  };
}

export default function TestimonialCarousel({ content }: TestimonialCarouselProps) {
  const testimonials = content.items;
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  const nextSlide = () => setActiveIndex((current) => (current + 1) % testimonials.length);
  const previousSlide = () =>
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="w-full border-t border-border bg-muted/55 py-14 sm:py-16">
      <div className="ulink-container">
        <header className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,11fr)] lg:items-end">
          <p className="font-mono text-xs font-medium text-brand">{content.eyebrow}</p>
          <div>
            <h2 className="max-w-[30ch] text-2xl font-medium leading-tight text-foreground sm:text-3xl">
              {content.title}
            </h2>
            <p className="mt-2 text-base leading-6 text-muted-foreground">{content.subtitle}</p>
          </div>
        </header>

        <div className="hidden gap-px border border-border bg-border md:grid md:grid-cols-2">
          {testimonials.map((item) => (
            <TestimonialTile key={`${item.company}-${item.name}`} item={item} />
          ))}
        </div>

        <div className="md:hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeIndex}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -18 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.2, 0, 0.38, 0.9] }}
            >
              <TestimonialTile item={testimonials[activeIndex]} />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between border-x border-b border-border bg-card p-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="!h-11 !w-11 !min-w-11 !p-0"
              onClick={previousSlide}
              aria-label={content.previousLabel}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <span className="font-mono text-xs text-muted-foreground">
              {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="!h-11 !w-11 !min-w-11 !p-0"
              onClick={nextSlide}
              aria-label={content.nextLabel}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialTile({ item }: { item: TestimonialItem }) {
  return (
    <Tile className="!flex !min-h-80 !flex-col !rounded-none !bg-card !p-7 sm:!p-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <span className="flex h-10 w-10 items-center justify-center bg-muted text-brand">
          <Building className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-base font-semibold text-foreground">{item.company}</span>
      </div>

      <blockquote className="flex-1 py-7 text-base leading-7 text-foreground/82">
        “{item.quote}”
      </blockquote>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <span className="flex h-10 w-10 items-center justify-center bg-muted text-muted-foreground">
          <User className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{item.name}</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.role}</p>
        </div>
      </div>
    </Tile>
  );
}
