import type { PagePresentation } from '@/lib/directus';

export type IndustryIconName = 'Armchair' | 'Warehouse' | 'Pill' | 'Utensils' | 'Wrench' | 'Cpu';

export interface IndustryPresentationItem {
  slug: string;
  name: string;
  icon: IndustryIconName;
  image: string;
  description: string;
  bullets: string[];
}

export interface IndustriesPresentationCopy {
  breadcrumbHome: string;
  breadcrumbCurrent: string;
  heroTitle: string;
  heroDescription: string;
  heroCta: string;
  heroAlt: string;
  sectionTitle: string;
  sectionDescription: string;
  viewDetails: string;
  industries: IndustryPresentationItem[];
}

function isIndustryItem(value: unknown): value is IndustryPresentationItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<IndustryPresentationItem>;
  return Boolean(
    item.slug &&
    item.name &&
    item.icon &&
    item.image &&
    item.description &&
    Array.isArray(item.bullets) &&
    item.bullets.length
  );
}

export function getIndustriesPresentationCopy(
  presentation: PagePresentation | null
): IndustriesPresentationCopy | null {
  const copy = presentation?.copy as unknown as Partial<IndustriesPresentationCopy> | undefined;
  if (!copy) return null;
  if (
    !copy.heroTitle ||
    !copy.heroDescription ||
    !copy.sectionTitle ||
    !copy.sectionDescription ||
    !copy.viewDetails ||
    !Array.isArray(copy.industries) ||
    copy.industries.length !== 6 ||
    !copy.industries.every(isIndustryItem)
  ) {
    return null;
  }
  return copy as IndustriesPresentationCopy;
}
