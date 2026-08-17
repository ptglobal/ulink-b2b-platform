import type { ResourceItem, Section, TranslatedString } from './types';
import type { ResourceData } from './resource-detail-client';

export function getResourceSlug(resource: Pick<ResourceItem, 'id'> | string) {
  const id = typeof resource === 'string' ? resource : resource.id;
  return id.toLowerCase();
}

export function getResourceHref(resource: Pick<ResourceItem, 'id' | 'category'>) {
  if (resource.category === 'event') return '/events';
  return `/resources/${getResourceSlug(resource)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderParagraphs(value: string) {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function renderTranslatedText(item: TranslatedString, locale: 'vi' | 'en' | 'ja') {
  return item[locale];
}

function renderSection(section: Section, locale: 'vi' | 'en' | 'ja') {
  const content = renderParagraphs(section.content[locale]);
  const alert = section.alertText
    ? `
      <div class="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p class="text-sm leading-relaxed text-slate-700">${renderParagraphs(section.alertText[locale])}</p>
      </div>
    `
    : '';

  return `
    <section class="space-y-4">
      <h2 class="text-xl font-bold text-slate-900">${escapeHtml(`${section.num} ${section.title[locale]}`)}</h2>
      <div class="prose prose-slate max-w-none text-sm leading-7 text-slate-600">
        <p>${content}</p>
      </div>
      ${alert}
    </section>
  `;
}

export function resourceToDetailData(
  resource: ResourceItem,
  locale: 'vi' | 'en' | 'ja'
): ResourceData {
  const summaryBullets = resource.aiSummary?.bullets ?? [];
  const fallbackIntro =
    locale === 'vi'
      ? 'Tài liệu này đang được cập nhật nội dung chi tiết. Vui lòng liên hệ đội ngũ ULink để nhận bản đầy đủ hoặc tài liệu liên quan.'
      : locale === 'ja'
        ? 'この資料は現在詳細コンテンツを更新中です。完全版または関連資料についてはULinkチームまでお問い合わせください。'
        : 'This document is being updated with more detailed content. Please contact the ULink team for the full version or related materials.';
  const intro =
    resource.aiSummary?.intro?.[locale] || resource.description[locale] || fallbackIntro;
  const highlights = summaryBullets.map((bullet) => bullet[locale]).filter(Boolean);
  const sectionsHtml =
    resource.sections.length > 0
      ? resource.sections.map((section) => renderSection(section, locale)).join('')
      : `
      <section class="space-y-4">
        <h2 class="text-xl font-bold text-slate-900">${escapeHtml(
          locale === 'vi'
            ? 'Tổng quan tài liệu'
            : locale === 'ja'
              ? '資料概要'
              : 'Document overview'
        )}</h2>
        <p class="text-sm leading-7 text-slate-600">${renderParagraphs(intro)}</p>
      </section>
    `;

  const summaryHtml =
    intro || highlights.length > 0
      ? `
        <section class="space-y-4">
          <h2 class="text-xl font-bold text-slate-900">${escapeHtml(
            locale === 'vi' ? 'Tóm tắt nhanh' : locale === 'ja' ? '要約' : 'Quick summary'
          )}</h2>
          ${intro ? `<p class="text-sm leading-7 text-slate-600">${renderParagraphs(intro)}</p>` : ''}
          ${
            highlights.length > 0
              ? `<ul class="space-y-2 text-sm leading-6 text-slate-600">${highlights
                  .map((item) => `<li>• ${escapeHtml(item)}</li>`)
                  .join('')}</ul>`
              : ''
          }
        </section>
      `
      : '';

  const metaHtml = `
    <section class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h2 class="text-lg font-bold text-slate-900">${escapeHtml(
        locale === 'vi' ? 'Thông tin tài liệu' : locale === 'ja' ? '資料情報' : 'Document details'
      )}</h2>
      <dl class="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt class="font-semibold text-slate-500">${escapeHtml(
            locale === 'vi' ? 'Ngày đăng' : locale === 'ja' ? '公開日' : 'Published'
          )}</dt>
          <dd>${escapeHtml(resource.date)}</dd>
        </div>
        <div>
          <dt class="font-semibold text-slate-500">${escapeHtml(
            locale === 'vi' ? 'Thời gian đọc' : locale === 'ja' ? '読了目安' : 'Read time'
          )}</dt>
          <dd>${escapeHtml(resource.readTime[locale])}</dd>
        </div>
        <div>
          <dt class="font-semibold text-slate-500">${escapeHtml(
            locale === 'vi' ? 'Tác giả' : locale === 'ja' ? '著者' : 'Author'
          )}</dt>
          <dd>${escapeHtml(resource.author.name[locale])}</dd>
        </div>
        <div>
          <dt class="font-semibold text-slate-500">${escapeHtml(
            locale === 'vi' ? 'Nhóm nội dung' : locale === 'ja' ? 'カテゴリ' : 'Category'
          )}</dt>
          <dd>${escapeHtml(resource.badge[locale])}</dd>
        </div>
      </dl>
    </section>
  `;

  return {
    slug: getResourceSlug(resource),
    type:
      resource.category === 'standard' || resource.contentType === 'certificate'
        ? 'doc'
        : resource.category === 'case-study'
          ? 'case-study'
          : 'news',
    category: renderTranslatedText(resource.badge, locale),
    title: renderTranslatedText(resource.title, locale),
    description: renderTranslatedText(resource.description, locale),
    date: resource.date,
    author: renderTranslatedText(resource.author.name, locale),
    readTime: renderTranslatedText(resource.readTime, locale),
    coverImage: resource.image || '',
    contentHtml: [metaHtml, summaryHtml, sectionsHtml].join(''),
    highlights
  };
}
