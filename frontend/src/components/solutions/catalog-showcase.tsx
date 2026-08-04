import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bookmark, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface CatalogShowcaseProps {
  locale: string;
}

export default async function CatalogShowcase({ locale }: CatalogShowcaseProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });

  const categoriesData = [
    {
      titleKey: 'catalogSection.cat1Title',
      viewAllHref: `/${locale}/solutions?category=industrial-packaging`,
      products: [
        {
          name: locale === 'vi' ? 'Màng quấn Pallet - Đóng kiện hàng.' : locale === 'ja' ? 'パレットストレッチフィルム - 梱包用' : 'Pallet Stretch Wrap - Packaging',
          price: '39.500đ - 43.000đ',
          unit: 'kg',
          moq: '500 kg',
          isCustom: true,
          image: '/images/home/section2/solution-packaging.webp'
        },
        {
          name: locale === 'vi' ? 'Màng co PE - Shrink Film Block Chai' : locale === 'ja' ? 'PE熱収縮フィルム - ボトルブロック用' : 'PE Shrink Film - Bottle Block Packaging',
          price: '50.000đ - 55.000đ',
          unit: 'kg',
          moq: '500 kg',
          isCustom: true,
          image: '/images/home/section2/solution-packaging.webp'
        },
        {
          name: locale === 'vi' ? 'Túi PE - Nhiều kích thước' : locale === 'ja' ? 'PE袋 - 各種サイズ' : 'PE Bag - Various Sizes',
          price: '35.000đ - 39.000đ',
          unit: 'kg',
          moq: '500 kg',
          isCustom: true,
          image: '/images/home/section2/product-custom-pkg.webp'
        },
        {
          name: locale === 'vi' ? 'Túi Ziper - Nhiều kích thước' : locale === 'ja' ? 'ジッパーバッグ - 各種サイズ' : 'Zipper Bag - Various Sizes',
          price: '59.500đ - 65.000đ',
          unit: 'kg',
          moq: '500 kg',
          isCustom: true,
          image: '/images/home/section2/product-custom-pkg.webp'
        }
      ]
    },
    {
      titleKey: 'catalogSection.cat2Title',
      viewAllHref: `/${locale}/solutions?category=cleanroom-consumables`,
      products: [
        {
          name: locale === 'vi' ? 'Băng Keo Nhôm - HVAC' : locale === 'ja' ? 'アルミテープ - HVAC用' : 'Aluminum Foil Tape - HVAC',
          price: '39.500đ - 43.000đ',
          unit: 'kg',
          moq: '500 kg',
          isCustom: true,
          image: '/images/home/section2/product-hvac-tape.webp'
        },
        {
          name: locale === 'vi' ? 'Màng quấn Pallet - Đóng kiện hàng.' : locale === 'ja' ? 'パレットストレッチフィルム - 梱包用' : 'Pallet Stretch Wrap - Packaging',
          price: '39.500đ - 43.000đ',
          unit: 'kg',
          moq: '500 kg',
          isCustom: true,
          image: '/images/home/section2/product-hvac-tape.webp'
        },
        {
          name: locale === 'vi' ? 'Màng quấn Pallet - Đóng kiện hàng.' : locale === 'ja' ? 'パレットストレッチフィルム - 梱包用' : 'Pallet Stretch Wrap - Packaging',
          price: '39.500đ - 43.000đ',
          unit: 'kg',
          moq: '500 kg',
          isCustom: true,
          image: '/images/home/section2/product-hvac-tape.webp'
        },
        {
          name: locale === 'vi' ? 'Băng dính - Sản xuất theo yêu cầu' : locale === 'ja' ? '粘着テープ - 受注生産' : 'Adhesive Tape - Manufactured on demand',
          price: '39.500đ - 43.000đ',
          unit: 'kg',
          moq: '500 kg',
          isCustom: true,
          image: '/images/home/section2/product-hvac-tape.webp'
        }
      ]
    },
    {
      titleKey: 'catalogSection.cat3Title',
      viewAllHref: `/${locale}/solutions?category=cleanroom-consumables`,
      products: [
        {
          name: locale === 'vi' ? 'Găng tay Nitrile - Class 1000' : locale === 'ja' ? 'ニトリル手袋 - クラス1000' : 'Nitrile Gloves - Class 1000',
          price: '2.000đ - 2.500đ',
          unit: 'pcs',
          moq: '50K pcs',
          isCustom: false,
          image: '/images/home/section2/product-cut-gloves.webp'
        },
        {
          name: locale === 'vi' ? 'Găng tay Nitrile - Dùng trong Y tế, Spa' : locale === 'ja' ? 'ニトリル手袋 - 医療・スパ用' : 'Nitrile Gloves - Medical & Spa',
          price: '2.500đ - 3.000đ',
          unit: 'pcs',
          moq: '30K pcs',
          isCustom: false,
          image: '/images/home/section2/product-cut-gloves.webp'
        },
        {
          name: locale === 'vi' ? 'Thảm Phòng sạch - Nhiều kích thước' : locale === 'ja' ? 'クリーンルームマット - 各種サイズ' : 'Cleanroom Sticky Mat - Various Sizes',
          price: '150.000đ - 180.000đ',
          unit: 'sheet',
          moq: '500 sheet',
          isCustom: true,
          image: '/images/about/quality-hero-bg.webp'
        },
        {
          name: locale === 'vi' ? 'Khăn lau phòng sạch - Wiper' : locale === 'ja' ? 'クリーンルーム用ワイパー' : 'Cleanroom Wipes - Wiper',
          price: '400.000đ - 430.000đ',
          unit: 'Carton',
          moq: '10 Carton',
          isCustom: false,
          image: '/images/about/quality-hero-bg.webp'
        }
      ]
    }
  ];

  return (
    <section className="w-full bg-[#FAFAFA] border-t border-gray-150 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col items-start border-b border-gray-100 pb-8 mb-12">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1.5 bg-blue-600 rounded-full shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('catalogSection.eyebrow')}
            </span>
          </div>
          <p className="mt-4 text-lg font-bold text-slate-700 leading-snug">
            {t('catalogSection.subtitle')}
          </p>
        </div>

        {/* Rows of categories */}
        <div className="space-y-16">
          {categoriesData.map((cat, catIdx) => (
            <div key={catIdx} className="flex flex-col">
              {/* Category Title bar */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 bg-blue-600 rounded-full shrink-0" />
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {t(cat.titleKey)}
                  </h3>
                </div>
                <Link
                  href={cat.viewAllHref}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t('catalogSection.viewAll')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cat.products.map((prod, prodIdx) => (
                  <div
                    key={prodIdx}
                    className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Product Image block */}
                    <div className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-103 duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>

                    {/* Product Content body */}
                    <div className="p-4 flex flex-col flex-1">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors">
                        {prod.name}
                      </h4>
                      <p className="mt-2 text-sm font-extrabold text-slate-900">
                        {prod.price} <span className="text-xs font-normal text-slate-500">/per {prod.unit}</span>
                      </p>

                      {/* MOQ Info */}
                      <p className="mt-2 text-[11px] text-slate-500 flex flex-wrap items-center gap-1">
                        <span className="font-semibold text-slate-800">MOQ: {prod.moq}</span>
                        <span className="text-slate-300">|</span>
                        <span>
                          {prod.isCustom ? t('catalogSection.manufactureOnDemand') : t('catalogSection.availableInStock')}
                        </span>
                      </p>

                      {/* Location metadata */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{t('catalogSection.hanam')}, {t('catalogSection.vietnam')}</span>
                      </div>

                      {/* Order and Bookmark buttons */}
                      <div className="mt-4 flex items-center gap-2">
                        <Link
                          href={`/${locale}/rfq`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors text-center shadow-sm"
                        >
                          {t('catalogSection.order')}
                        </Link>
                        <button
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
                          title="Bookmark"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
