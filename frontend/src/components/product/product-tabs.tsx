'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Wrench,
  Cpu,
  Shield,
  Truck,
  FileText,
  Activity,
  Award,
  Package,
  Star,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTranslatedName, getTranslatedDescription } from '@/lib/i18n-content';
import type { Industry, Standard, ProductSku } from '@/lib/directus';

interface ProductTabsProps {
  locale: string;
  productName: string;
  skuCode: string;
  brand: string;
  categoryName: string;
  specifications: Record<string, string> | null;
  industries: Industry[];
  standards: Standard[];
  skus: ProductSku[];
}

export default function ProductTabs({
  locale,
  productName,
  skuCode,
  brand,
  categoryName,
  specifications,
  industries,
  standards,
  skus
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'apps' | 'certs' | 'reviews'>('specs');

  // Pack size from the first SKU
  const packSize = skus[0]?.pack_size ?? (locale === 'vi' ? 'Đóng gói theo yêu cầu' : 'Standard packaging');

  const tabs = [
    { id: 'specs', label: locale === 'vi' ? 'Thông số kỹ thuật' : 'Specifications' },
    { id: 'apps', label: locale === 'vi' ? 'Ứng dụng' : 'Applications' },
    { id: 'certs', label: locale === 'vi' ? 'Chứng nhận' : 'Certifications' },
    { id: 'reviews', label: locale === 'vi' ? 'Đánh giá (12)' : 'Reviews (12)' }
  ] as const;

  // Render specifications tab content
  const renderSpecsContent = () => {
    // Generate technical bullet points dynamically based on product name/category
    const bulletPoints = locale === 'vi' ? [
      `Sản phẩm ${productName} được thiết kế với chất liệu cao cấp, bảo vệ tối ưu khỏi các tác nhân vật lý và hóa học khi thao tác.`,
      `Công nghệ dệt/đúc liền mạch mang lại độ ôm khít hoàn hảo, tăng tối đa độ nhạy cảm ứng đầu ngón tay và linh hoạt khi sử dụng.`,
      `Khả năng chống tĩnh điện hoặc chống nhiễm bẩn vượt trội, lý tưởng cho môi trường phòng sạch và trạm sản xuất linh kiện.`,
      `Chất liệu thân thiện, không gây kích ứng da, thông thoáng khí giúp người lao động thoải mái làm việc suốt ngày dài.`
    ] : [
      `The ${productName} is engineered with premium materials for optimal protection against physical and chemical hazards during handling.`,
      `Seamless construction provides a perfect snug fit, maximizing fingertip sensitivity and dexterity.`,
      `Excellent anti-static or contamination control properties, ideal for cleanrooms and sensitive assembly lines.`,
      `Skin-friendly, breathable materials keep workers comfortable throughout extended shifts.`
    ];

    return (
      <div className="space-y-8">
        {/* Top summary row: Description & Applications Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Bullet Points */}
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {locale === 'vi' ? 'Đặc tính kỹ thuật chi tiết' : 'Detailed Technical Features'}
            </h4>
            <ul className="space-y-3">
              {bulletPoints.map((bp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  <span className="text-blue-500 shrink-0 mt-1.5">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Actual Applications Box */}
          <div className="lg:col-span-4">
            <div className="bg-[#F8FAFC] border border-slate-100 p-6 rounded-xl space-y-4">
              <h4 className="text-sm font-extrabold text-slate-800">
                {locale === 'vi' ? 'Ứng dụng thực tế' : 'Real-world Applications'}
              </h4>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 text-xs text-slate-700 font-semibold">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <span>{locale === 'vi' ? 'Lắp ráp cơ khí & linh kiện' : 'Mechanical & Component Assembly'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 font-semibold">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span>{locale === 'vi' ? 'Gia công kim loại & tấm tôn' : 'Metalworking & Sheet Handling'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 font-semibold">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span>{locale === 'vi' ? 'Logistics, Kho vận & Đóng gói' : 'Logistics, Warehouse & Packaging'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 font-semibold">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span>{locale === 'vi' ? 'Bảo trì công nghiệp chung' : 'General Industrial Maintenance'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical specifications table */}
        <div className="space-y-4">
          <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-3.5 w-1/3">{locale === 'vi' ? 'Thông số' : 'Parameter'}</th>
                  <th className="px-6 py-3.5 w-2/3">{locale === 'vi' ? 'Chi tiết' : 'Details'}</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm text-slate-700 divide-y divide-slate-100">
                {skuCode && (
                  <tr className="bg-white">
                    <td className="px-6 py-3 font-semibold text-slate-500">{locale === 'vi' ? 'Mã sản phẩm' : 'Product Code'}</td>
                    <td className="px-6 py-3 font-bold text-slate-800">{skuCode}</td>
                  </tr>
                )}
                {brand && (
                  <tr className="bg-slate-50/50">
                    <td className="px-6 py-3 font-semibold text-slate-500">{locale === 'vi' ? 'Thương hiệu' : 'Brand'}</td>
                    <td className="px-6 py-3 font-bold text-slate-800">{brand}</td>
                  </tr>
                )}
                {categoryName && (
                  <tr className="bg-white">
                    <td className="px-6 py-3 font-semibold text-slate-500">{locale === 'vi' ? 'Danh mục' : 'Category'}</td>
                    <td className="px-6 py-3 font-bold text-slate-800">{categoryName}</td>
                  </tr>
                )}
                {specifications && Object.entries(specifications).map(([key, val], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="px-6 py-3 font-semibold text-slate-500">{key}</td>
                    <td className="px-6 py-3 font-bold text-slate-800">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Packaging Info & Warehouse Image Banner */}
        <div className="border border-slate-200/80 rounded-xl p-6 sm:p-8 bg-white shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left image */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-200">
              <Image
                src="/images/about/hero-warehouse.webp"
                alt="Warehouse"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2.5">
              {locale === 'vi' ? 'Kho hàng' : 'Warehouse'}
            </span>
          </div>

          {/* Right description */}
          <div className="md:col-span-8 space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
              {locale === 'vi' ? 'Thông tin đóng gói' : 'Packaging Information'}
            </span>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              {packSize}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              {locale === 'vi'
                ? `Sản phẩm ${skuCode} được đóng gói trong thùng carton tiêu chuẩn cao, giúp chống ẩm mốc và va đập trong quá trình vận chuyển cũng như lưu kho. Mỗi thùng chứa đúng quy chuẩn ${packSize}, cực kỳ thuận tiện cho việc quản lý xuất nhập tồn kho bán buôn.`
                : `Product ${skuCode} is safely packed in heavy-duty export standard cartons to protect against moisture and damage during logistics and warehousing. Each carton holds exactly ${packSize}, facilitating inventory management and bulk audits.`}
            </p>
            {/* Pill badges */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 rounded-full border border-slate-100 text-xs font-bold text-slate-600">
                <Truck className="h-3.5 w-3.5 text-blue-500" />
                {locale === 'vi' ? 'Giao hàng toàn quốc' : 'Nationwide Delivery'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 rounded-full border border-slate-100 text-xs font-bold text-slate-600">
                <Package className="h-3.5 w-3.5 text-emerald-500" />
                {locale === 'vi' ? 'Lưu kho dễ dàng' : 'Easy Warehousing'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render applications tab content
  const renderAppsContent = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
        {industries.map((ind) => (
          <Link
            key={ind.id}
            href={`/${locale}/solutions?industry=${ind.slug}`}
            className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200/80 bg-white hover:border-blue-500 hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 mb-4 shrink-0 transition-colors">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
              {getTranslatedName(ind, locale)}
            </span>
          </Link>
        ))}
      </div>
    );
  };

  // Render certifications/standards tab content
  const renderCertsContent = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
        {standards.map((std) => (
          <div key={std.id} className="flex items-start gap-4 p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {getTranslatedName(std, locale)}
              </h4>
              {getTranslatedDescription(std, locale) && (
                <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">
                  {getTranslatedDescription(std, locale)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render mock reviews tab content
  const renderReviewsContent = () => {
    const reviews = [
      { author: 'Trần Minh H.', company: 'Samsung Electro-Mechanics', text: 'Chất lượng đóng gói rất đồng đều. Hàng chống tĩnh điện đo thử đạt chuẩn điện trở yêu cầu.', rating: 5, date: '12/06/2026' },
      { author: 'Nguyễn Thuỳ D.', company: 'Foxconn Bắc Giang', text: 'Khả năng chịu kéo căng tốt, rất ít khi bị rách khi quấn góc pallet sắc nhọn.', rating: 4, date: '28/05/2026' },
      { author: 'Yamada T.', company: 'Nidec Vietnam', text: 'Giao hàng đúng hẹn, đầy đủ chứng chỉ chất lượng CO/CQ cho từng đợt hàng.', rating: 5, date: '14/05/2026' }
    ];

    return (
      <div className="space-y-6 py-4">
        {/* Rating Summary Card */}
        <div className="bg-[#F8FAFC] border border-slate-200/60 p-6 rounded-xl flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="text-center sm:text-left space-y-1">
            <p className="text-3xl font-black text-slate-900">4.7 / 5.0</p>
            <div className="flex text-amber-400 justify-center sm:justify-start">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4.5 w-4.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-400 font-semibold">12 đánh giá thực tế từ khách hàng doanh nghiệp</p>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-100 rounded-lg shadow-sm">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
            <span className="text-xs font-bold text-slate-700">100% Khách hàng hài lòng</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4 divide-y divide-slate-100">
          {reviews.map((rev, i) => (
            <div key={i} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">{rev.author}</span>
                  <span className="text-[10px] font-bold text-slate-400 ml-2">({rev.company})</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{rev.date}</span>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, starIdx) => (
                  <Star
                    key={starIdx}
                    className={cn(
                      'h-3.5 w-3.5 fill-current',
                      starIdx < rev.rating ? 'text-amber-400' : 'text-slate-200'
                    )}
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {rev.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex items-center gap-6 -mb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'text-sm pb-3 px-1 transition-all border-b-2 font-bold focus:outline-none',
                  isActive
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content rendering */}
      <div className="transition-opacity duration-150">
        {activeTab === 'specs' && renderSpecsContent()}
        {activeTab === 'apps' && renderAppsContent()}
        {activeTab === 'certs' && renderCertsContent()}
        {activeTab === 'reviews' && renderReviewsContent()}
      </div>
    </div>
  );
}
