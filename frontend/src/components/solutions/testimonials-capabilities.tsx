'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Factory,
  Package,
  Activity,
  Truck,
  ArrowRight,
  User
} from '@/components/icons';
import { useTranslations } from 'next-intl';

interface TestimonialsCapabilitiesProps {
  locale: string;
  copy?: Record<string, string>;
}

export default function TestimonialsCapabilities({ locale, copy }: TestimonialsCapabilitiesProps) {
  const t = useTranslations('solutions');
  const label = (key: string) => copy?.[key] || t(`testimonialsCapabilities.${key}`);

  const testimonials = [
    {
      company: 'kontrastr',
      text: label('test1Text'),
      author: label('test1Author'),
      role: label('test1Role'),
      gender: 'female'
    },
    {
      company: 'ArtVenue',
      text: label('test2Text'),
      author: label('test2Author'),
      role: label('test2Role'),
      gender: 'male'
    },
    {
      company: 'LogixFlow',
      text:
        locale === 'vi'
          ? 'Dịch vụ tư vấn giải pháp đóng gói chuyên nghiệp. Giúp tối ưu hóa 25% thể tích đóng gói và giảm tỷ lệ hư hỏng hàng hóa về 0%.'
          : locale === 'ja'
            ? 'プロフェッショナルな包装ソリューションのコンサルティング。梱包容積を25%最適化し、貨物の破損率を0%に低減しました。'
            : 'Professional packaging solutions consulting. Helped optimize packaging volume by 25% and reduced cargo damage rates to 0%.',
      author:
        locale === 'vi' ? 'Lê Hoàng Long' : locale === 'ja' ? 'レ・ホアン・ロン' : 'Le Hoang Long',
      role:
        locale === 'vi'
          ? 'Giám đốc Chuỗi cung ứng'
          : locale === 'ja'
            ? 'サプライチェーンディレクター'
            : 'Supply Chain Director',
      gender: 'male'
    },
    {
      company: 'EcoPack',
      text:
        locale === 'vi'
          ? 'Chúng tôi đánh giá cao cam kết bền vững và khả năng đáp ứng đơn hàng số lượng lớn cực kỳ nhanh của ULink. Rất hài lòng!'
          : locale === 'ja'
            ? 'ULinkの持続可能性への取り組みと、大口注文への極めて迅速な対応力を高く評価しています。大満足です！'
            : 'We highly appreciate ULinks commitment to sustainability and extremely fast response to high-volume orders. Very satisfied!',
      author:
        locale === 'vi' ? 'Phan Thị Mai' : locale === 'ja' ? 'ファン・ティ・マイ' : 'Phan Thi Mai',
      role:
        locale === 'vi'
          ? 'Quản lý Thu mua'
          : locale === 'ja'
            ? '購買マネージャー'
            : 'Procurement Manager',
      gender: 'female'
    }
  ];

  const [startIndex, setStartIndex] = useState(0);

  const handleNext = () => {
    setStartIndex((prev) => (prev + 2 >= testimonials.length ? 0 : prev + 2));
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 2 < 0 ? testimonials.length - 2 : prev - 2));
  };

  return (
    <>
      {/* === SECTION: TESTIMONIALS === */}
      <section className="w-full bg-background border-t border-gray-150 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
          {/* Section Header */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-center mb-12">
            {label('testimonialHeading')}
          </h2>

          {/* Testimonial slider wrapper */}
          <div className="relative max-w-5xl mx-auto flex items-center">
            {/* Left navigation arrow */}
            <button
              onClick={handlePrev}
              className="absolute -left-4 sm:-left-12 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 sm:px-0 transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-300">
              {testimonials.slice(startIndex, startIndex + 2).map((test, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm flex flex-col items-center text-center transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:shadow-md"
                >
                  {/* Company Logo text placeholder */}
                  <div className="text-slate-700 font-extrabold text-lg tracking-tight mb-6 select-none flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-[2px]" />
                    {test.company}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-sm text-slate-600 leading-relaxed font-medium italic flex-1 mb-8">
                    &ldquo;{test.text}&rdquo;
                  </p>

                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 mb-3 overflow-hidden shrink-0">
                    <User className="h-6 w-6" />
                  </div>

                  {/* Author Name & Role */}
                  <h4 className="text-sm font-bold text-slate-900">{test.author}</h4>
                  <p className="text-xs text-slate-500 mt-1">{test.role}</p>
                </div>
              ))}
            </div>

            {/* Right navigation arrow */}
            <button
              onClick={handleNext}
              className="absolute -right-4 sm:-right-12 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* === SECTION: CORE CAPABILITIES === */}
      <section className="w-full bg-white border-t border-gray-150 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 text-center">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              {label('capabilitiesEyebrow')}
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {label('capabilitiesTitle')}
            </h2>
          </div>

          {/* Capabilities 4-column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Capability 1 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 mb-6">
                <Factory className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3">
                {label('cap1Heading')}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {label('cap1Desc')}
              </p>
            </div>

            {/* Capability 2 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 mb-6">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3">
                {label('cap2Heading')}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {label('cap2Desc')}
              </p>
            </div>

            {/* Capability 3 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 mb-6">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3">
                {label('cap3Heading')}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {label('cap3Desc')}
              </p>
            </div>

            {/* Capability 4 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 mb-6">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3">
                {label('cap4Heading')}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {label('cap4Desc')}
              </p>
            </div>
          </div>

          {/* CTA Order Button */}
          <div className="mt-16 flex justify-center">
            <Link
              href={`/${locale}/quick-order`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-6 py-3 text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              {label('order')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
