import Image from 'next/image';
import { MapPin, Users, TrendingUp, Award, Clock, HeartHandshake } from 'lucide-react';

const stats = [
  { value: '100+', label: 'Nhân sự tài năng', icon: Users },
  { value: '15+', label: 'Năm kinh nghiệm', icon: Clock },
  { value: '35+', label: 'Đối tác lớn', icon: Award },
  { value: '98%', label: 'Tỷ lệ gắn bó', icon: HeartHandshake },
];

export function CareersHero() {
  return (
    <section className="py-8 lg:py-12">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Headline & Quick Props */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            TÌM KIẾM NHÂN TÀI
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            Kiến tạo giá trị khác biệt. Phát triển bền vững.
          </h1>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Tại ULink B2B Platform, chúng tôi xây dựng một môi trường làm việc cởi mở, sáng tạo, nơi mỗi cá nhân đều được trao quyền bứt phá và tạo ra giá trị thực sự cho chuỗi cung ứng công nghiệp Việt Nam.
          </p>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Vị trí thuận lợi</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Users className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Môi trường mở</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <TrendingUp className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Phát triển lâu dài</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-900/10">
            <Image
              src="/images/about/op-team.webp"
              alt="Đội ngũ nhân sự ULink B2B Platform"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Impression Metrics Bar */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border border-slate-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-slate-900">{s.value}</span>
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
