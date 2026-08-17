import Image from 'next/image';
import { ArrowRight, Calendar, User } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { ABOUT_NEWS_ARTICLES } from './about-news-data';

export function AboutNews() {
  return (
    <section className="py-8 lg:py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
          Tin tức thị trường
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Cập nhật xu hướng và diễn biến mới nhất
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ABOUT_NEWS_ARTICLES.map((item) => (
          <Link
            key={item.id}
            href={`/about/news/${item.id}`}
            aria-label={`Xem chi tiết bài viết: ${item.title}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:shadow-md"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-2 flex items-center gap-3 text-xs text-slate-500">
                <span className="font-semibold text-blue-600">{item.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {item.date}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-xs text-slate-600 line-clamp-2">{item.summary}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <User className="h-3 w-3" />
                  {item.author}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
                  Đọc tiếp
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
