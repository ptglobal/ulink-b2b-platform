import { readItems } from '@directus/sdk';
import { publicDirectus } from './directus';

export type EventPerson = {
  name: string;
  role: string;
  bio: string;
  photo: string;
};

export type EventPageContent = {
  version: number;
  hero: {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    image: string;
  };
  eventList: {
    eyebrow: string;
    registerLabel: string;
    items: Array<{
      slug: string;
      title: string;
      date: string;
      time: string;
      location: string;
      image: string;
      registrationHref: string;
    }>;
    pagination: { current: number; total: number };
  };
  marketNews: {
    eyebrow: string;
    title: string;
    actionLabel: string;
    actionHref: string;
    items: Array<{
      category: string;
      title: string;
      image: string;
      href: string;
    }>;
  };
  detail: {
    breadcrumb: string[];
    slug: string;
    title: string;
    organizerShort: string;
    image: string;
    dateDay: string;
    dateYear: string;
    startTime: string;
    startTimeLabel: string;
    endTime: string;
    endTimeLabel: string;
    status: string;
    statusLabel: string;
    ticketPrice: string;
    registerLabel: string;
    registerHref: string;
    sponsors: string[];
    overviewLabel: string;
    overview: string;
    timeLabel: string;
    dateLine: string;
    timeLine: string;
    locationLabel: string;
    locationName: string;
    address: string;
    speakersLabel: string;
    speakers: EventPerson[];
    hostsLabel: string;
    hosts: EventPerson[];
    organizerLabel: string;
    organizer: { name: string; role: string; description: string };
  };
  registration: {
    breadcrumb: string[];
    title: string;
    subtitle: string;
    paymentTitle: string;
    paymentDescription: string;
    ticket: Record<string, string>;
    bankTitle: string;
    bank: Record<string, string>;
    qr: string;
    qrLabel: string;
    qrInstruction: string;
    formTitle: string;
    formDescription: string;
    fields: Record<string, string>;
    sourceOptions: string[];
    consent: string;
    submitLabel: string;
    formMessages: {
      consentRequired: string;
      submitError: string;
      errorTitle: string;
      sourcePlaceholder: string;
      submittingLabel: string;
    };
  };
  statuses: {
    pending: Record<string, string>;
    success: Record<string, string>;
    failed: Record<string, string>;
  };
};

type EventsPageRecord = { content?: EventPageContent | null };

export function eventAsset(fileId: string) {
  return `/api/files/${encodeURIComponent(fileId)}`;
}

export async function loadEventsContent(): Promise<EventPageContent | null> {
  const records = await publicDirectus
    .request(
      readItems('pages', {
        filter: { slug: { _eq: 'events' }, status: { _eq: 'published' } },
        fields: ['content'],
        limit: 1
      })
    )
    .catch((error) => {
      console.error('Unable to load CMS event content', error);
      return [];
    });

  return ((records as unknown as EventsPageRecord[])[0]?.content ?? null) as EventPageContent | null;
}
