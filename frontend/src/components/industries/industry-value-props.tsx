'use client';

import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Activity,
  Utensils,
  Settings,
  Globe,
  Zap,
  Sparkles,
  Truck,
  CheckCircle2,
  Factory
} from '@/components/icons';
import { ValueProp } from './types';

// Map icon names to Lucide icons
const iconMap: Record<string, React.ComponentType<any>> = {
  Cpu,
  Activity,
  Utensils,
  ShieldCheck,
  Settings,
  Globe,
  Zap,
  Sparkles,
  Truck,
  CheckCircle2,
  Factory
};

interface IndustryValuePropsProps {
  valueProps: ValueProp[];
}

export function IndustryValueProps({ valueProps }: IndustryValuePropsProps) {
  return (
    <div className="w-full relative z-25 -mt-10 sm:-mt-12 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {valueProps.map((prop, idx) => {
          const PropIcon = iconMap[prop.iconName] || ShieldCheck;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/60 shadow-lg hover:shadow-xl transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300 p-6 flex items-start gap-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <PropIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-foreground leading-snug">{prop.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{prop.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
