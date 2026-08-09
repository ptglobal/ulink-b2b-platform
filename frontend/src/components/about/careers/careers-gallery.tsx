import Image from 'next/image';

const photos = [
  { src: '/images/about/op-team.webp', alt: 'Không gian văn phòng hiện đại' },
  { src: '/images/about/kho.png', alt: 'Trung tâm kho bãi Hub Hà Nam' },
  { src: '/images/about/quality-lab.webp', alt: 'Phòng kiểm định chất lượng' },
  { src: '/images/about/op-wms.webp', alt: 'Vận hành công nghệ WMS' },
  { src: '/images/about/op-warehouse.webp', alt: 'Đóng gói sản phẩm chuẩn ISO' },
  { src: '/images/about/location-aerial.webp', alt: 'Vị trí kết nối thuận tiện' },
];

export function CareersGallery() {
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
        {photos.map((p, idx) => (
          <div
            key={idx}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-sm border border-slate-100 group"
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
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
