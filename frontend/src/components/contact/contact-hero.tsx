import { BrandedMedia } from '@/components/media/branded-media';
import { MapPin, Building2, ShieldCheck } from '@/components/icons';

const valueProps = [
  {
    icon: MapPin,
    title: 'Vị trí chiến lược',
    desc: 'Kết nối nhanh đến các KCN và cảng biển lớn'
  },
  {
    icon: Building2,
    title: 'Kho vận hiện đại',
    desc: 'Hệ thống quản lý chuẩn quốc tế, tối ưu quy trình xử lý'
  },
  {
    icon: ShieldCheck,
    title: 'Vận hành tin cậy',
    desc: 'Quy trình kiểm soát, an toàn và minh bạch'
  }
];

export function ContactHero() {
  return (
    <section className="py-8 lg:py-12">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            LIÊN HỆ
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            Hub Hà Nam - Trung tâm phân phối
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Trung tâm phân phối chiến lược tại cửa ngõ phía Nam Hà Nội, kết nối linh hoạt với các
            cụm công nghiệp trọng điểm và hệ thống logistics toàn quốc.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {valueProps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                    <p className="text-[11px] text-slate-600">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Photo */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-900/10">
            <BrandedMedia
              src="/images/about/kho.png"
              alt="Trung tâm phân phối ULink Hub Hà Nam"
              className="absolute inset-0"
              sizes="(max-width: 1023px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
