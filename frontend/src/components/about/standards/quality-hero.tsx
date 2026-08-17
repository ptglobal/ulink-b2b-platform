import { BrandedMedia } from '@/components/media/branded-media';
import { ASSETS } from '@/lib/assets';
import type { ContentMedia } from '@/lib/directus';

export function QualityHero({ media }: { media?: ContentMedia | null }) {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col gap-4 max-w-3xl mb-8">
        <span className="inline-flex w-fit items-center border-l-2 border-brand pl-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
          CHẤT LƯỢNG & TIÊU CHUẨN
        </span>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl leading-[1.08]">
          Chất lượng là cam kết. Tiêu chuẩn là nền tảng.
        </h1>
        <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
          Tại ULink B2B Platform, chất lượng sản phẩm và vật tư kỹ thuật không chỉ là mục tiêu kinh
          doanh, mà là lời cam kết sinh tử với hiệu quả vận hành của Khách hàng. Chúng tôi thiết lập
          hệ thống kiểm soát chất lượng đạt chuẩn quốc tế ISO ngay từ khâu lưu kho, kiểm định đến
          khi giao tới dây chuyền sản xuất.
        </p>
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden border border-border shadow-ambient sm:aspect-[21/9]">
        <BrandedMedia
          src={media?.path || ASSETS.brand.qualityLab}
          alt={media?.alt || 'Kỹ sư ULink kiểm định điện trở bề mặt của bao bì chống tĩnh điện'}
          sizes="(max-width: 1023px) 100vw, 90vw"
          className="absolute inset-0"
          imageClassName="object-center"
          priority
        />
      </div>
    </section>
  );
}
