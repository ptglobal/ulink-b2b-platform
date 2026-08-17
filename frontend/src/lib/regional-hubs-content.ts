import type { ContentMedia } from '@/lib/directus';
import { getPagePresentation } from '@/lib/page-presentation';

export interface RegionalHubMetricCopy {
  label: string;
  unit?: string;
  note: string;
  value?: string;
}

export interface RegionalHubContactCopy {
  label: string;
  heading: string;
  description: string;
  formTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  subjectRfq: string;
  subjectSupply: string;
  subjectTechnical: string;
  subjectOther: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  submitErrorTitle: string;
  contactDetailsLabel: string;
  officeLabel: string;
  hotlineLabel: string;
  emailContactLabel: string;
  mapTitle: string;
  addressFallback: string;
}

export interface RegionalHubResourcesCopy {
  eyebrow: string;
  sectionTitle: string;
  sectionSubTitle: string;
  viewAllNews: string;
  readMore: string;
  docsEyebrow: string;
  docsTitle: string;
  supportTitle: string;
  documentTypeLabels: Record<string, string>;
  supportItems: Array<{ title: string; description: string }>;
}

export interface RegionalHubsPageCopy {
  eyebrow: string;
  title: string;
  description: string;
  network: {
    eyebrow: string;
    title: string;
    subtitle: string;
    liveLabel: string;
    signature: string;
    emptyLabel: string;
    hubs: Array<{
      id: string;
      number: string;
      name: string;
      zones: string;
      slug: string;
      href: string;
      lat: number;
      lon: number;
    }>;
  };
  stats: {
    distance: RegionalHubMetricCopy;
    delivery: RegionalHubMetricCopy;
    zones: RegionalHubMetricCopy;
  };
  dashboard: {
    title: string;
    sourceLabel: string;
    capacity: RegionalHubMetricCopy;
    onTime: RegionalHubMetricCopy;
    hubs: RegionalHubMetricCopy;
    warehouse: RegionalHubMetricCopy;
  };
  hubRfq: {
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
    cancel: string;
    close: string;
  };
  featuredProducts: {
    title: string;
    subtitle: string;
    viewAll: string;
    emptyLabel: string;
  };
  carousel: {
    rfqButton: string;
    learnMore: string;
    slides: Array<{
      eyebrow: string;
      title: string;
      feat1: string;
      feat2: string;
      image: string;
      alt: string;
    }>;
  };
  capabilities: {
    title: string;
    description: string;
    learnMore: string;
    items: Array<{
      icon: 'factory' | 'clock' | 'award';
      title: string;
      description: string;
      href: string;
    }>;
  };
  featuredHub: {
    slug: string;
    displayName?: string;
    eyebrow: string;
    title: string;
    description?: string;
    descriptionTemplate: string;
    primaryAction: { label: string; href: string };
    secondaryAction: { label: string; href: string };
    imageRole: string;
    imageAlt: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    subtitle: string;
    previousLabel: string;
    nextLabel: string;
    items: Array<{ company: string; quote: string; name: string; role: string }>;
  };
  workingProcess: {
    title: string;
    subtitle: string;
    steps: Array<{
      icon: 'document' | 'users' | 'settings' | 'truck';
      number: string;
      title: string;
      description: string;
      kpiLabel: string;
      kpiValue: string;
    }>;
  };
  resources: RegionalHubResourcesCopy;
  contact: RegionalHubContactCopy;
}

export interface RegionalHubsPageContent {
  copy: RegionalHubsPageCopy;
  media: ContentMedia[];
}

function isRegionalHubsCopy(value: unknown): value is RegionalHubsPageCopy {
  if (!value || typeof value !== 'object') return false;
  const copy = value as Partial<RegionalHubsPageCopy>;
  return Boolean(
    copy.title &&
    copy.description &&
    copy.network?.title &&
    copy.network?.hubs?.length &&
    copy.stats?.distance &&
    copy.dashboard?.capacity &&
    copy.featuredProducts?.title &&
    copy.carousel?.slides?.length &&
    copy.capabilities?.items?.length &&
    copy.featuredHub?.slug &&
    copy.testimonials?.items?.length &&
    copy.workingProcess?.steps?.length &&
    copy.resources?.sectionTitle &&
    copy.contact?.heading
  );
}

export async function getRegionalHubsPageContent(
  locale: string
): Promise<RegionalHubsPageContent | null> {
  const presentation = await getPagePresentation('regional-hubs', locale);
  if (!presentation || !isRegionalHubsCopy(presentation.copy)) return null;

  return {
    copy: presentation.copy,
    media: [presentation.heroMedia, ...(presentation.supportingMedia ?? [])].filter(
      (item): item is ContentMedia => Boolean(item)
    )
  };
}

export function getRegionalHubMedia(media: ContentMedia[], role: string): ContentMedia | null {
  return media.find((item) => item.role === role) ?? null;
}
