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
      <div className="flex h-[640px] w-full flex-col justify-between py-8">
        {hubs.map((hub, index) => (
          <div
            key={hub.id}
            className="group flex items-center justify-between gap-4 rounded-lg border border-blue-500/10 bg-[#0E2142]/60 px-6 py-3 shadow-md shadow-black/20 backdrop-blur-md transition-all hover:border-[#00e5ff]/30 hover:bg-[#0E2142]/85 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)]"
          >
            {/* Clickable area → navigate to hub detail */}
            <Link
              href={`/regional-hubs/${hub.slug}`}
              className="flex flex-1 items-center gap-5 min-w-0"
            >
              {/* Rectangular number badge */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1769E2] shadow-sm transition-colors group-hover:bg-[#1257bd]">
                <span className="text-[16px] font-bold text-[#F5F5F5]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              {/* Text info */}
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-bold leading-tight text-white group-hover:text-[#00e5ff] transition-colors truncate">
                  {hub.localizedName}
                </p>
                {hub.zonesStr && (
                  <p className="mt-1.5 max-w-[240px] text-[12px] leading-snug text-blue-200/50 group-hover:text-blue-200/70 transition-colors truncate">
                    {hub.zonesStr}
                  </p>
                )}
              </div>
            </Link>
 
            {/* ArrowRight → open RFQ modal */}
            <button
              type="button"
              onClick={() => setSelectedHub(hub)}
              className="rounded-full p-2 hover:bg-white/5 transition-colors shrink-0"
              aria-label={`${labels.title} - ${hub.localizedName}`}
            >
              <ArrowRight className="h-5 w-5 text-[#F5F5F5]/60 group-hover:text-[#00e5ff] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        ))}
        {hubs.length === 0 && (
          <p className="text-[13px] text-blue-200/40 text-center py-8 font-mono">
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
