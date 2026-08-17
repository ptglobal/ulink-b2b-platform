import { BrandedMedia } from '@/components/media/branded-media';
import type { ContentMedia } from '@/lib/directus';

const photos: ContentMedia[] = [
  { path: '/images/brand/ulink-careers-gallery-office-royal-v1.webp', role: 'careers.gallery.procurement-office', alt: 'Đội mua hàng và kỹ thuật ULink phối hợp tại văn phòng' },
  { path: '/images/brand/ulink-careers-gallery-control-room-royal-v1.webp', role: 'careers.gallery.control-room', alt: 'Trung tâm điều phối vận hành kho ULink' },
  { path: '/images/brand/ulink-careers-gallery-quality-lab-royal-v1.webp', role: 'careers.gallery.quality-lab', alt: 'Kỹ sư ULink kiểm định mẫu bao bì ESD' },
  { path: '/images/brand/ulink-careers-gallery-wms-royal-v1.webp', role: 'careers.gallery.wms-operator', alt: 'Nhân sự ULink vận hành WMS và máy quét mã' },
  { path: '/images/brand/ulink-careers-gallery-packing-royal-v1.webp', role: 'careers.gallery.packing-team', alt: 'Đội đóng gói ULink xác minh lô hàng công nghiệp' },
  { path: '/images/brand/ulink-careers-gallery-hub-royal-v1.webp', role: 'careers.gallery.regional-hub', alt: 'Trung tâm hoàn tất đơn hàng vùng của ULink nhìn từ trên cao' }
];

export function CareersGallery({ media }: { media?: ContentMedia[] }) {
  const resolvedPhotos = photos.map((fallback, index) => media?.[index] || fallback);

  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          KHÔNG GIAN LÀM VIỆC
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Môi trường làm việc
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xl">
          Trải nghiệm môi trường làm việc năng động, chuyên nghiệp và đầy cảm hứng tại ULink.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
        {resolvedPhotos.map((p, idx) => (
          <div
            key={idx}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-sm border border-slate-100 group"
          >
            <BrandedMedia
              src={p.path}
              alt={p.alt || 'Không gian làm việc ULink'}
              className="absolute inset-0"
              imageClassName="transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 767px) 50vw, 33vw"
              compactBrand
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
              <span className="text-xs font-semibold text-white">{p.alt}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
