import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';

export function AboutSustainability() {
  return (
    <section className="py-8 lg:py-12">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl">
        <div className="grid grid-cols-1 items-center lg:grid-cols-12">
          <div className="relative aspect-[16/9] lg:aspect-auto lg:h-full lg:col-span-6 overflow-hidden">
            <Image
              src="/images/about/hero-warehouse-wide.webp"
              alt="Phát triển bền vững Hub Hà Nam"
              fill
              className="object-cover opacity-80"
            />
          </div>
          <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 mb-4">
              <Leaf className="h-3.5 w-3.5" />
              Phát triển bền vững
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Kiến tạo tương lai xanh
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              Cam kết sử dụng năng lượng tái tạo (hệ thống điện mặt trời mái kho), tối ưu hóa bao bì đóng gói tái chế và giảm thiểu lượng phát thải carbon trong toàn bộ chuỗi cung ứng vật tư B2B.
            </p>
            <div className="mt-6">
              <Link
                href="/about/sustainability"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
