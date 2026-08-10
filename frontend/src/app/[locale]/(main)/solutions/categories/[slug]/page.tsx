import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { CategoryProductsClient, CategoryInfo, ProductItem } from '@/components/solutions/category-products-client';
import { fetchProducts, fetchProductCategories } from '@/lib/product-data';
import { getTranslatedName, getTranslatedField } from '@/lib/i18n-content';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { ASSETS } from '@/lib/assets';

// Categories Master Metadata
const CATEGORIES_MASTER: Record<string, CategoryInfo> = {
  'cleanroom-consumables': {
    id: 1,
    name: 'Vật tư phòng sạch',
    slug: 'cleanroom-consumables',
    description: 'Trọn bộ trang thiết bị vật tư tiêu hao phòng sạch đạt tiêu chuẩn ISO 14644-1 từ Class 10 đến Class 100,000 cho các nhà máy điện tử & bán dẫn.',
    subCategories: [
      { id: 2, name: 'Găng tay phòng sạch', slug: 'cleanroom-gloves' },
      { id: 3, name: 'Khăn lau phòng sạch', slug: 'cleanroom-wipers' },
      { id: 4, name: 'Quần áo phòng sạch', slug: 'cleanroom-apparel' },
      { id: 5, name: 'Khẩu trang phòng sạch', slug: 'cleanroom-masks' },
      { id: 8, name: 'Hóa chất phòng sạch', slug: 'cleanroom-chemicals' }
    ]
  },
  'cleanroom-gloves': {
    id: 2,
    name: 'Găng tay phòng sạch',
    slug: 'cleanroom-gloves',
    description: 'Găng tay Nitrile, Latex, PU phủ đầu ngón & phủ lòng bàn tay chống tĩnh điện ESD, không bột, siêu sạch không để lại ion kim loại.',
    parentName: 'Vật tư phòng sạch'
  },
  'cleanroom-wipers': {
    id: 3,
    name: 'Khăn lau phòng sạch',
    slug: 'cleanroom-wipers',
    description: 'Khăn lau Wiper 1009D, Microfiber 4004 cắt laser chống phát sinh xơ sợi, độ thấm hút dung môi IPA tối đa.',
    parentName: 'Vật tư phòng sạch'
  },
  'cleanroom-apparel': {
    id: 4,
    name: 'Quần áo phòng sạch',
    slug: 'cleanroom-apparel',
    description: 'Quần áo phòng sạch liền thân có nón, áo blouse, nón trùm đầu, giày boot PVC/PU dệt sợi carbon chống tĩnh điện.',
    parentName: 'Vật tư phòng sạch'
  },
  'cleanroom-masks': {
    id: 5,
    name: 'Khẩu trang phòng sạch',
    slug: 'cleanroom-masks',
    description: 'Khẩu trang 3 lớp ES/MB không xơ xơ, khẩu trang than hoạt tính lọc bụi mịn 0.1 micron trong phòng sơn và phòng lab.',
    parentName: 'Vật tư phòng sạch'
  },
  'industrial-packaging': {
    id: 6,
    name: 'Bao bì công nghiệp',
    slug: 'industrial-packaging',
    description: 'Túi nhôm ESD Shielding Bag, màng PE quấn pallet, thùng nhựa Danpla PP sóng, khay nhựa định hình EPE chịu lực.',
    subCategories: [
      { id: 9, name: 'Túi chống tĩnh điện ESD', slug: 'esd-shielding-bag' },
      { id: 10, name: 'Màng PE quấn Pallet', slug: 'pe-stretch-wrap' }
    ]
  },
  'esd-supplies': {
    id: 7,
    name: 'Vật tư ESD',
    slug: 'esd-supplies',
    description: 'Dây đeo cổ tay chống tĩnh điện, thảm cao su ESD 2 lớp, nhíp inox chống tĩnh điện, quạt khử ion Ionizer khử nạp tĩnh.',
    subCategories: [
      { id: 11, name: 'Thảm cao su ESD', slug: 'esd-table-mat' },
      { id: 12, name: 'Thiết bị khử tĩnh điện', slug: 'ionizer-fan' }
    ]
  },
  'cleanroom-chemicals': {
    id: 8,
    name: 'Hóa chất phòng sạch',
    slug: 'cleanroom-chemicals',
    description: 'Dung dịch cồn IPA 99.9% Cleanroom Grade, dung dịch tẩy rửa bề mặt bo mạch SMT, chất phủ bảo vệ chống ẩm.',
    parentName: 'Vật tư phòng sạch'
  }
};

const ALL_CATEGORIES_LIST = [
  { id: 1, name: 'Vật tư phòng sạch', slug: 'cleanroom-consumables' },
  { id: 2, name: 'Găng tay phòng sạch', slug: 'cleanroom-gloves' },
  { id: 3, name: 'Khăn lau phòng sạch', slug: 'cleanroom-wipers' },
  { id: 4, name: 'Quần áo phòng sạch', slug: 'cleanroom-apparel' },
  { id: 5, name: 'Khẩu trang phòng sạch', slug: 'cleanroom-masks' },
  { id: 6, name: 'Bao bì công nghiệp', slug: 'industrial-packaging' },
  { id: 7, name: 'Vật tư ESD', slug: 'esd-supplies' },
  { id: 8, name: 'Hóa chất phòng sạch', slug: 'cleanroom-chemicals' }
];

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'cleanroom-consumables': ASSETS.home.productCutGloves,
  'cleanroom-gloves': ASSETS.home.productCutGloves,
  'cleanroom-wipers': ASSETS.home.solutionPackaging,
  'cleanroom-apparel': ASSETS.about.heroWarehouse,
  'cleanroom-masks': ASSETS.about.qualityLab,
  'industrial-packaging': ASSETS.home.productCustomPkg,
  'esd-supplies': ASSETS.home.productHvacTape,
  'cleanroom-chemicals': ASSETS.home.solutionCleanroom
};

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'sticky-mat-30-layers': ASSETS.about.qualityLab,
  'sticky-roller-12-inch': ASSETS.home.productCutGloves,
  'cleanroom-pen-esd': ASSETS.about.heroWarehouse,
  'cleanroom-paper-a4-72g': ASSETS.home.solutionPackaging,
  'nitrile-cleanroom-gloves': ASSETS.home.productCutGloves,
  'pu-fingertip-esd-gloves': ASSETS.home.productCutGloves,
  'sterile-latex-cleanroom-gloves': ASSETS.home.productCutGloves,
  'polyester-cleanroom-wipers': ASSETS.home.solutionPackaging,
  'microfiber-cleanroom-wiper-m3': ASSETS.home.solutionPackaging,
  'tyvek-cleanroom-coverall': ASSETS.about.heroWarehouse,
  'esd-pvc-cleanroom-boot': ASSETS.about.qualityLab,
  'cleanroom-face-mask-3ply': ASSETS.about.qualityLab,
  'esd-shielding-bag': ASSETS.home.solutionPackaging,
  'pe-stretch-wrap': ASSETS.home.productCustomPkg,
  'esd-wrist-strap': ASSETS.about.qualityLab,
  'esd-table-mat-2layer': ASSETS.home.productHvacTape,
  'ipa-cleanroom-grade-999': ASSETS.home.solutionCleanroom
};

export default async function CategoryProductsPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // 1. Fetch real DB products & categories directly from Directus / PostgreSQL DB
  const { products: dbProducts } = await fetchProducts({ limit: 100 });
  const dbCategories = await fetchProductCategories();

  // 2. Find matching DB category if available
  const currentDbCat = dbCategories.find((c) => c.slug === slug);

  // 3. Resolve Category Info
  const categoryInfo: CategoryInfo = {
    id: currentDbCat?.id ?? CATEGORIES_MASTER[slug]?.id ?? 99,
    name: (currentDbCat ? getTranslatedName(currentDbCat, locale) : null) || currentDbCat?.name || CATEGORIES_MASTER[slug]?.name || 'Danh mục Sản phẩm',
    slug,
    description: CATEGORIES_MASTER[slug]?.description || 'Danh mục các sản phẩm vật tư công nghiệp tiêu chuẩn phòng sạch & ESD ULink.',
    subCategories: CATEGORIES_MASTER[slug]?.subCategories
  };

  // 4. Map Products ONLY from Database
  const products: ProductItem[] = dbProducts.map((p) => {
    const firstSku = p.skus?.find((s) => s.status === 'published') || p.skus?.[0];
    const catObj = typeof p.category === 'object' && p.category !== null ? (p.category as any) : null;
    const categoryName = catObj ? (getTranslatedName(catObj, locale) || catObj.name) : categoryInfo.name;

    const resolvedImage = p.hero
      ? `${getDirectusUrl()}/assets/${p.hero}`
      : (PRODUCT_IMAGE_MAP[p.slug] || CATEGORY_IMAGE_MAP[slug] || ASSETS.home.solutionCleanroom);

    return {
      id: p.id,
      name: getTranslatedName(p, locale) || p.name,
      slug: p.slug,
      brand: p.brand || 'ULink',
      categoryName,
      categorySlug: catObj?.slug || slug,
      shortDescription: getTranslatedField(p, 'short_description', locale) || p.short_description || '',
      stockStatus: (firstSku?.stock_status as any) || 'in_stock',
      image: resolvedImage,
      unit: firstSku?.unit ?? '',
      packSize: firstSku?.pack_size ?? '',
      specs: ['Tiêu chuẩn ISO / ESD', 'Chính hãng 100%']
    };
  });

  // 5. Dynamic Categories list from DB
  const categoriesList = dbCategories.length > 0
    ? dbCategories.map((c) => ({ id: c.id, name: getTranslatedName(c, locale) || c.name, slug: c.slug }))
    : ALL_CATEGORIES_LIST;

  return (
    <CategoryProductsClient
      category={categoryInfo}
      products={products}
      allCategories={categoriesList}
      locale={locale}
    />
  );
}
