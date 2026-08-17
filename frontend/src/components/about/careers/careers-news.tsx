import Link from 'next/link';
import { ArrowRight, Calendar } from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';
import type { ContentMedia } from '@/lib/directus';

const featuredNews = {
  title: 'ULink chào đón 20+ nhân sự mới gia nhập đợt 3/2026',
  snippet:
    'Buổi đón chào nhân sự mới với chuỗi hoạt động onboarding gắn kết và đào tạo chuyên sâu về hệ thống B2B.',
  date: '08/08/2026'
};

const newsList = [
  {
    id: '1',
    title: 'Hành trình phát triển sự nghiệp của kỹ sư vận hành tại Hub Hà Nam',
    category: 'Chia sẻ nhân sự',
    date: '02/08/2026'
  },
  {
    id: '2',
    title: 'Chương trình đào tạo kỹ năng quản lý chuỗi cung ứng 2026',
    category: 'Đào tạo',
    date: '25/07/2026'
  },
  {
    id: '3',
    title: 'Ngày hội văn hóa thể thao ULink Sports Day 2026',
    category: 'Văn hóa doanh nghiệp',
    date: '18/07/2026'
  }
];

const defaultMedia: ContentMedia[] = [
  { path: '/images/brand/ulink-careers-news-onboarding-royal-v1.webp', role: 'careers.news.onboarding', alt: 'Chương trình chào đón nhân sự mới của ULink' },
  { path: '/images/brand/ulink-careers-news-engineer-royal-v1.webp', role: 'careers.news.operations-engineer', alt: 'Kỹ sư vận hành ULink tại kho tự động' },
  { path: '/images/brand/ulink-careers-news-training-royal-v1.webp', role: 'careers.news.supply-training', alt: 'Đào tạo quản trị chuỗi cung ứng tại ULink' },
  { path: '/images/brand/ulink-careers-news-sports-royal-v1.webp', role: 'careers.news.sports-day', alt: 'Ngày hội thể thao của đội ngũ ULink' }
];

export function CareersNews({ media }: { media?: ContentMedia[] }) {
  const resolvedMedia = defaultMedia.map((fallback, index) => media?.[index] || fallback);

  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          CẬP NHẬT MỚI NHẤT
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Tin tức tuyển dụng
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Featured News (Left) */}
        <div className="lg:col-span-6 flex flex-col rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden group">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
            <BrandedMedia
              src={resolvedMedia[0].path}
              alt={resolvedMedia[0].alt || featuredNews.title}
              className="absolute inset-0"
              imageClassName="transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 1023px) 100vw, 50vw"
            />
          </div>
          <div className="p-6 flex flex-col flex-1">
            <span className="text-xs text-slate-500 flex items-center gap-1 mb-2">
              <Calendar className="h-3 w-3" /> {featuredNews.date}
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {featuredNews.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 flex-1">
              {featuredNews.snippet}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/about/news"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Đọc tiếp <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Small News Cards (Right) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {newsList.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl bg-white p-4 border border-slate-100 shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:shadow-md group"
            >
              <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <BrandedMedia
                  src={resolvedMedia[index + 1].path}
                  alt={resolvedMedia[index + 1].alt || item.title}
                  className="absolute inset-0"
                  imageClassName="transition-transform duration-300 group-hover:scale-105"
                  sizes="80px"
                  compactBrand
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-blue-600 mb-0.5">
                  {item.category} • {item.date}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
