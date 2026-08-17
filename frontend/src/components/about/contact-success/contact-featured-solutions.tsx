import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from '@/components/icons';

const solutions = [
  {
    id: 'cleanroom',
    title: 'Phòng sạch',
    desc: 'Giải pháp vật tư phòng sạch đạt chuẩn ISO, đảm bảo môi trường kiểm soát nhiễm cho ngành dược phẩm & điện tử.',
    image: '/images/about/quality-hero-bg.webp',
    href: '/industries/electronics'
  },
  {
    id: 'packaging',
    title: 'Bao bì Công nghiệp',
    desc: 'Cung cấp các loại bao bì chuyên dụng cho vận chuyển, bảo quản hàng hóa công nghiệp an toàn & hiệu quả.',
    image: '/images/about/op-warehouse.webp',
    href: '/industries/logistics'
  },
  {
    id: 'hvac',
    title: 'Băng keo nhôm HVAC',
    desc: 'Các sản phẩm băng keo nhôm chịu nhiệt cao, chống ẩm, dùng cho hệ thống HVAC, ống gió và cách nhiệt công nghiệp.',
    image: '/images/about/op-wms.webp',
    href: '/industries/construction'
  }
];

export function ContactFeaturedSolutions() {
  return (
    <section className="py-12 px-4 sm:px-8">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          DANH MỤC TIÊU BIỂU
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Khám phá thêm giải pháp từ ULink
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {solutions.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:shadow-md group"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 flex-1">{item.desc}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  href={item.href}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  Xem thêm <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
