import Image from 'next/image';
import { Ship, Plane, Route, Building2 } from 'lucide-react';

const connectivityList = [
  {
    icon: Ship,
    title: 'Cách Cảng Hải Phòng: 100km (~1.5h vận chuyển)',
  },
  {
    icon: Plane,
    title: 'Cách Sân bay Quốc tế Nội Bài: 80km',
  },
  {
    icon: Route,
    title: 'Kết nối trực tiếp đường cao tốc Cầu Giẽ - Ninh Bình',
  },
  {
    icon: Building2,
    title: 'Tiếp cận nhanh các KCN: Hà Nam, Nam Định, Thái Bình...',
  },
];

export function AboutLocation() {
  return (
    <section className="py-8 lg:py-12">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Vị trí chiến lược
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Trung tâm kết nối thuận tiện
          </h2>
          <p className="text-base leading-relaxed text-slate-600">
            Nằm tại vị trí nút giao thông huyết mạch, dễ dàng tiếp cận các khu công nghiệp trọng điểm miền Bắc và kết nối nhanh chóng đến cảng biển/sân bay.
          </p>
          <ul className="mt-2 space-y-3.5">
            {connectivityList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx} className="flex items-start gap-3 text-slate-700">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-900/10">
            <Image
              src="/images/about/location-aerial.webp"
              alt="Vị trí kết nối giao thông Hub Hà Nam"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
