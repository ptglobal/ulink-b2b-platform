export interface TranslatedString {
  vi: string;
  en: string;
  ja: string;
}

export interface Section {
  id: string;
  num: string;
  title: TranslatedString;
  content: TranslatedString;
  alertText?: TranslatedString;
}

export interface AISummary {
  intro: TranslatedString;
  bullets: Array<TranslatedString>;
}

export interface Author {
  name: TranslatedString;
  role: TranslatedString;
  avatar: string;
}

export interface ResourceItem {
  id: string;
  category: 'industry' | 'product' | 'guide' | 'standard' | 'case-study' | 'news' | 'event';
  badge: TranslatedString;
  title: TranslatedString;
  description: TranslatedString;
  date: string;
  image?: string;
  industryId?: 'electronics' | 'pharmaceutical' | 'cosmetics' | 'food';
  topicId?: 'cleanroom' | 'packaging' | 'esd';
  contentType?: 'article' | 'tech-doc' | 'certificate';
  author: Author;
  readTime: TranslatedString;
  sections: Section[];
  aiSummary: AISummary;
  audioDuration: string;
  audioSecs: number;
  size?: string;
  type?: string;
  downloadUrl?: string;
  isDirectDownloadOnly?: boolean;
  fileId?: string;
}
