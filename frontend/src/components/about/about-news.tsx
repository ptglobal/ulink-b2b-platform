import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

const articles = [
  {
    id: '1',
    title: 'Thắt chặt chuỗi cung ứng vật tư B2B năm 2026',
    snippet: 'Những giải pháp đột phá giúp các nhà máy tối ưu hóa chi phí dự trữ kho bãi.',
    category: 'Thị trường',
    author: 'Minh Tuấn',
    date: '05/08/2026',
    image: '/images/about/quality-hero-bg.webp',
  },
  {
    id: '2',
    title: 'Ứng dụng hệ thống WMS trong quản lý kho hiện đại',
    snippet: 'Tự động hóa dữ liệu giúp kiểm soát tỷ lệ sai lệch tồn kho dưới 0.01%.',
    category: 'Công nghệ',
    author: 'Bích Ngọc',
    date: '02/08/2026',
    image: '/images/about/op-wms.webp',
  },
  {
    id: '3',
    title: 'Giải pháp giao hàng thần tốc 24h vùng kinh tế trọng điểm',
    snippet: 'Mạng lưới kết nối giao thông đồng bộ giúp tối ưu lộ trình xe tải.',
    category: 'Vận tải',
    author: 'Hoàng Nam',
    date: '28/07/2026',
    image: '/images/about/op-truck.webp',
  },
  {
    id: '4',
    title: 'Tiêu chuẩn xanh cho hệ thống kho hàng công nghiệp',
    snippet: 'Chuyển đổi năng lượng mặt trời giảm 35% chi phí vận hành kho.',
    category: 'Bền vững',
    author: 'Khánh Linh',
    date: '20/07/2026',
    image: '/images/about/quality-lab.webp',
  },
];

export function AboutNews() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          Tin tức thị trường
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Cập nhật xu hướng và diễn biến mới nhất
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                <span className="font-semibold text-blue-600">{item.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {item.date}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-slate-600 line-clamp-2 flex-1">
                {item.snippet}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <User className="h-3 w-3" /> {item.author}
                </span>
                <Link
                  href={`/about/news/${item.id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Đọc tiếp <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>


    </section>
  );
}
