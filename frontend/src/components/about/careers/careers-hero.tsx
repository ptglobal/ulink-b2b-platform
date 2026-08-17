import { Award, Clock, HeartHandshake, TrendingUp, Users } from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';
import { ASSETS } from '@/lib/assets';
import type { ContentMedia } from '@/lib/directus';

const content = {
  vi: {
    label: 'Phát triển năng lực công nghiệp',
    title: 'Học từ vận hành thực tế. Tạo ảnh hưởng có thể đo lường.',
    description:
      'ULink xây dựng đội ngũ liên chức năng, nơi kiến thức vật liệu, dữ liệu và năng lực thực thi cùng tạo nên chất lượng phục vụ khách hàng doanh nghiệp.',
    stats: ['Nhân sự chuyên môn', 'Năm kinh nghiệm', 'Đối tác chiến lược', 'Tỷ lệ gắn bó']
  },
  en: {
    label: 'Industrial capability development',
    title: 'Learn from real operations. Create measurable impact.',
    description:
      'ULink develops cross-functional teams where material knowledge, data, and execution come together for enterprise customers.',
    stats: ['Specialists', 'Years of experience', 'Strategic partners', 'Team retention']
  },
  ja: {
    label: '産業オペレーション人材の育成',
    title: '実務から学び、測定できる成果を生み出す。',
    description:
      'ULink は資材知識、データ、実行力を結び、法人顧客への価値を高める部門横断チームを育成します。',
    stats: ['専門人材', '業界経験', '戦略パートナー', '定着率']
  }
} as const;

const values = ['100+', '15+', '35+', '98%'];
const icons = [Users, Clock, Award, HeartHandshake];

export function CareersHero({ locale, media }: { locale: string; media?: ContentMedia | null }) {
  const language = locale === 'en' || locale === 'ja' ? locale : 'vi';
  const copy = content[language];
  const image = media ?? {
    path: ASSETS.brand.careersTraining,
    role: 'careers.hero.operational-mentoring',
    alt: 'Chuyên gia vận hành ULink hướng dẫn nhân sự trẻ kiểm tra vật tư và quét mã tại kho'
  };

  return (
    <section className="py-10 lg:py-16">
      <div className="grid border-y border-border lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="flex flex-col justify-center bg-card p-7 sm:p-10 lg:p-14">
          <TrendingUp className="h-8 w-8 text-brand" aria-hidden="true" />
          <p className="mt-8 text-sm font-semibold text-brand">{copy.label}</p>
          <h1 className="mt-4 max-w-[15ch] text-4xl font-normal leading-[1.08] text-foreground sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-[60ch] text-base leading-8 text-muted-foreground">{copy.description}</p>
        </div>
        <BrandedMedia
          src={image.path}
          alt={image.alt}
          className="min-h-[26rem] lg:min-h-[36rem]"
          sizes="(max-width: 1024px) 100vw, 56vw"
          priority
        />
      </div>

      <dl className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value, index) => {
          const Icon = icons[index];
          return (
            <div key={copy.stats[index]} className="min-h-36 border-b border-border p-5 sm:border-r lg:border-b-0 last:sm:border-r-0">
              <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
              <dd className="mt-5 font-mono text-3xl font-normal text-foreground">{value}</dd>
              <dt className="mt-2 text-sm text-muted-foreground">{copy.stats[index]}</dt>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
