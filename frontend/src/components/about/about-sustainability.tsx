import { ArrowRight, Leaf } from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import type { ContentMedia } from '@/lib/directus';

const copy = {
  vi: {
    label: 'Phát triển bền vững trong vận hành',
    title: 'Giảm tác động môi trường bằng quyết định vật liệu cụ thể',
    description:
      'ULink ưu tiên bao bì đơn vật liệu, giải pháp có thể quay vòng, tối ưu kích thước kiện và năng lượng tái tạo tại trung tâm phân phối.',
    action: 'Xem định hướng bền vững',
    points: ['Tối ưu lượng màng trên mỗi kiện', 'Tăng tỷ lệ bao bì có thể quay vòng', 'Giảm quãng đường giao nhận không cần thiết']
  },
  en: {
    label: 'Operational sustainability',
    title: 'Reduce environmental impact through specific material decisions',
    description:
      'ULink prioritizes mono-material packaging, returnable formats, right-sized loads, and renewable energy at the distribution center.',
    action: 'View our sustainability approach',
    points: ['Optimize film per load', 'Increase returnable packaging', 'Reduce unnecessary delivery mileage']
  },
  ja: {
    label: '運用に根ざしたサステナビリティ',
    title: '具体的な資材選定で環境負荷を低減',
    description:
      'ULink は単一素材包装、リターナブル資材、梱包サイズの最適化、物流拠点での再生可能エネルギーを重視します。',
    action: 'サステナビリティ方針を見る',
    points: ['使用フィルム量を最適化', '循環型包装の比率を向上', '不要な配送距離を削減']
  }
} as const;

export function AboutSustainability({
  locale,
  media,
  standalone = false
}: {
  locale: string;
  media?: ContentMedia | null;
  standalone?: boolean;
}) {
  const language = locale === 'en' || locale === 'ja' ? locale : 'vi';
  const content = copy[language];
  const image = media ?? {
    path: ASSETS.brand.sustainability,
    role: 'sustainability.hero.material-efficiency',
    alt: 'Kỹ sư ULink đánh giá vật liệu bao bì có thể tái chế tại trung tâm phân phối sử dụng điện mặt trời'
  };

  return (
    <section className={standalone ? 'py-10 lg:py-16' : 'py-12 lg:py-20'}>
      <div className="grid overflow-hidden border border-border bg-brand-deep text-white lg:grid-cols-2">
        <BrandedMedia
          src={image.path}
          alt={image.alt}
          className="min-h-[24rem] lg:min-h-[36rem]"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={standalone}
        />
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <Leaf className="h-8 w-8 text-brand-soft" aria-hidden="true" />
          <p className="mt-8 text-sm font-semibold text-brand-soft">{content.label}</p>
          {standalone ? (
            <h1 className="mt-4 max-w-[15ch] text-4xl font-normal leading-tight text-white sm:text-5xl">{content.title}</h1>
          ) : (
            <h2 className="mt-4 max-w-[15ch] text-3xl font-normal leading-tight text-white sm:text-4xl">{content.title}</h2>
          )}
          <p className="mt-6 max-w-[56ch] text-base leading-8 text-white/80">{content.description}</p>
          <ul className="mt-8 divide-y divide-white/15 border-y border-white/15">
            {content.points.map((point) => (
              <li key={point} className="flex items-center gap-3 py-4 text-sm text-white/90">
                <span className="h-2 w-2 bg-brand-soft" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          {!standalone && (
            <Link href="/about/sustainability" className="mt-8 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-white hover:text-brand-soft">
              {content.action}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
