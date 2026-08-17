import { BrandedMedia } from '@/components/media/branded-media';
import { ASSETS } from '@/lib/assets';
import type { ContentMedia } from '@/lib/directus';

export function AboutHero({ media }: { media?: ContentMedia | null }) {
  return (
    <section className="py-8 sm:py-10 lg:py-14">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="inline-flex w-fit items-center border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            Trung tâm vật tư Hà Nam
          </span>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl leading-[1.08]">
            Hub Hà Nam - Cung ứng vật tư cho Doanh nghiệp sản xuất
          </h1>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Thắt chặt chuỗi cung ứng vật tư công nghiệp với các trung tâm kho bãi tối tân tại các
            vùng công nghiệp trọng điểm.
          </p>
          <p className="text-base leading-relaxed text-slate-600">
            Cung cấp giải pháp vật tư kỹ thuật tổng thể, tối ưu chi phí và nâng cao hiệu quả vận
            hành cho nhà máy.
          </p>
        </div>
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-border shadow-ambient sm:aspect-[16/11]">
            <BrandedMedia
              src={media?.path || ASSETS.brand.corporateCapability}
              alt={media?.alt || 'Đội ngũ kỹ thuật và mua hàng ULink tại trung tâm phân phối công nghiệp'}
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="absolute inset-0"
              imageClassName="object-center"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
