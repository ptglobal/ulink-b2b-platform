'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import HubRfqModal from './hub-rfq-modal';

interface HubData {
  id: number;
  name: string;
  slug: string;
  localizedName: string;
  zonesStr: string;
}

interface HubClusterListProps {
  hubs: HubData[];
  labels: {
    title: string;
    hubLabel: string;
    contactName: string;
    company: string;
    phone: string;
    email: string;
    note: string;
    notePlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    required: string;
    invalidEmail: string;
    invalidPhone: string;
  };
}

export default function HubClusterList({ hubs, labels }: HubClusterListProps) {
  const [selectedHub, setSelectedHub] = useState<HubData | null>(null);

  return (
    <>
      <div className="flex h-[540px] flex-col justify-between py-8">
        {hubs.map((hub, index) => (
          <div
            key={hub.id}
            className="group flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-muted"
          >
            {/* Clickable area → navigate to hub detail */}
            <Link
              href={`/regional-hubs/${hub.slug}`}
              className="flex flex-1 items-center gap-3 min-w-0"
            >
              {/* Number badge */}
              <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-primary shadow-sm group-hover:bg-brand transition-colors">
                <span className="text-[11px] font-bold text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold leading-tight text-primary group-hover:text-brand transition-colors truncate">
                  {hub.localizedName}
                </p>
                {hub.zonesStr && (
                  <p className="mt-0.5 max-w-[170px] text-[10px] leading-snug text-muted-foreground truncate">
                    {hub.zonesStr}
                  </p>
                )}
              </div>
            </Link>

            {/* ArrowRight → open RFQ modal */}
            <button
              type="button"
              onClick={() => setSelectedHub(hub)}
              className="rounded-full p-1 hover:bg-primary/10 transition-colors"
              aria-label={`${labels.title} - ${hub.localizedName}`}
            >
              <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-brand transition-all" />
            </button>
          </div>
        ))}
        {hubs.length === 0 && (
          <p className="text-[12px] text-muted-foreground text-center py-4">
            No regional hubs available
          </p>
        )}
      </div>

      {/* RFQ Modal */}
      <HubRfqModal
        hubId={selectedHub?.id ?? 0}
        hubName={selectedHub?.localizedName ?? ''}
        open={selectedHub !== null}
        onClose={() => setSelectedHub(null)}
        labels={labels}
      />
    </>
  );
}
