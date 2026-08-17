'use client';

import React, { useState } from 'react';
import { ChevronDown } from '@/components/icons';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  sectionTitle: string;
  sectionSubtitle: string;
  items: FaqItem[];
}

export default function FaqAccordion({ sectionTitle, sectionSubtitle, items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(1); // default first item open

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full border-t border-[#e5e9f0] bg-[#f4f6fa] py-12 sm:py-14 lg:py-16">
      <div className="mx-auto mb-8 max-w-3xl px-4 text-center sm:px-8">
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-foreground sm:text-[28px]">
          {sectionTitle}
        </h2>
        <p className="mt-2 text-[12px] leading-5 text-muted-foreground sm:text-[13px]">
          {sectionSubtitle}
        </p>
      </div>

      <div className="mx-auto w-[calc(100%_-_2rem)] max-w-[50rem] overflow-hidden rounded-[3px] border border-[#dfe5ef] bg-white sm:w-[calc(100%_-_4rem)]">
        {items.map((item, index) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={`border-b border-[#e5e9f0] last:border-0 transition-colors duration-200 ${
                isOpen ? 'bg-[#fbfcfe]' : ''
              }`}
            >
              {/* Question Button */}
              <button
                onClick={() => toggle(item.id)}
                className="flex min-h-14 w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[#f7f9fc] focus:outline-none sm:px-5"
              >
                <span className="pr-4 text-[12px] font-semibold leading-snug text-foreground sm:text-[13px]">
                  {index + 1}. {item.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-brand' : ''
                  }`}
                />
              </button>

              {/* Answer Box */}
              <div
                className={`grid transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 text-[11px] leading-5 text-muted-foreground sm:px-5 sm:text-[12px]">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
