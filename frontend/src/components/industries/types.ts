import React from 'react';
import type { Product } from '@/lib/directus';

export interface CategoryItem {
  name: string;
  image: string;
  slug?: string;
}

export interface CaseStudyItem {
  title: string;
  description: string;
  image: string;
  badge: string;
}

export interface ValueProp {
  title: string;
  desc: string;
  iconName: string;
}

export interface ChallengeItem {
  title: string;
  desc?: string;
  iconName: string;
}

export interface IndustryData {
  slug: string;
  name: string;
  title: string;
  description: string;
  iconName: string;
  gradient: string;
  bannerImage: string;
  valueProps: ValueProp[];
  challengesIntro: string;
  challenges: ChallengeItem[];
  cleanroomIntro: string;
  cleanroomCategories: CategoryItem[];
  cleanroomViewAll: string;
  packagingIntro: string;
  packagingCategories: CategoryItem[];
  packagingViewAll: string;
  casesTitle: string;
  cases: CaseStudyItem[];
  whyUsTitle: string;
  whyUsList: string[];
  standardsTitle: string;
  standards: Array<{ name: string; detail: string }>;
  resourcesTitle: string;
  catalogue: {
    title: string;
    info: string;
    url: string;
  };
}

export interface IndustryDetailClientProps {
  industryData: IndustryData;
  products: Product[];
  locale: string;
  currentSlug: string;
  translations: {
    home: string;
    resources: string;
    overview: string;
    cleanroomSol: string;
    packagingSol: string;
    cases: string;
    recommendedProducts: string;
    resourceTab: string;
    seeAll: string;
    contactSupport: string;
    noProductDesc: string;
  };
}
