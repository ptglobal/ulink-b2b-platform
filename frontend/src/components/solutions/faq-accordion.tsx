'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
    <section className="w-full mt-16 lg:mt-24 border-t border-slate-100 pt-16">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F1E36] tracking-tight">
          {sectionTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
          {sectionSubtitle}
        </p>
      </div>

      {/* Accordion Container */}
      <div className="max-w-4xl mx-auto border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
        {items.map((item, index) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={`border-b border-slate-100 last:border-0 transition-colors duration-200 ${
                isOpen ? 'bg-slate-50/40' : ''
              }`}
            >
              {/* Question Button */}
              <button
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between text-left px-6 sm:px-8 py-5 hover:bg-slate-50/50 transition-colors focus:outline-none"
              >
                <span className="text-xs sm:text-sm md:text-base font-bold text-[#0F1E36] pr-4 leading-snug">
                  {index + 1}. {item.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {/* Answer Box */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 sm:px-8 pb-6 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
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
