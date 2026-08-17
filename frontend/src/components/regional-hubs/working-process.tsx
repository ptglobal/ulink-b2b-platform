import React from 'react';
import { FileCheck, Users, Settings, Truck } from '@/components/icons';
import type { RegionalHubsPageCopy } from '@/lib/regional-hubs-content';

const ICONS = {
  document: FileCheck,
  users: Users,
  settings: Settings,
  truck: Truck
} as const;

export default function WorkingProcess({
  content
}: {
  content: RegionalHubsPageCopy['workingProcess'];
}) {
  return (
    <section className="w-full border-t border-border bg-card py-14 sm:py-16">
      <div className="ulink-container">
        <header className="mb-10 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,11fr)] lg:items-end">
          <h2 className="text-2xl font-medium leading-tight text-foreground sm:text-3xl">{content.title}</h2>
          <p className="max-w-[68ch] text-sm leading-6 text-muted-foreground">{content.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {content.steps.map((step, index) => {
            const IconComponent = ICONS[step.icon] ?? FileCheck;
            return (
              <article
                key={`${step.number}-${step.title}`}
                className="cds--tile flex min-h-[17rem] flex-col bg-card p-6 transition-colors hover:bg-muted/70"
              >
                <div className="mb-5 flex items-center justify-between border-b border-border pb-5">
                  <span className="flex h-11 w-11 items-center justify-center bg-muted text-brand">
                    <IconComponent className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-start">
                  <span className="block text-xs font-medium text-brand">{step.number}</span>
                  <h3 className="mt-2 text-base font-semibold leading-tight text-foreground">{step.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs font-medium text-muted-foreground">{step.kpiLabel}</span>
                  <span className="font-mono text-sm font-semibold text-brand">{step.kpiValue}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
