import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Warehouse, Package, Truck, ShieldCheck, MapPin, Anchor, Factory, Route } from 'lucide-react';
import { ASSETS } from '@/lib/assets';

export async function AboutHubStats() {
  const t = await getTranslations('aboutHub');

  const stats = [
    { icon: <Warehouse className="h-8 w-8" strokeWidth={1.3} />, value: t('stats.areaValue'), label: t('stats.areaLabel') },
    { icon: <Package className="h-8 w-8" strokeWidth={1.3} />, value: t('stats.skuValue'), label: t('stats.skuLabel') },
    { icon: <Truck className="h-8 w-8" strokeWidth={1.3} />, value: t('stats.timeValue'), label: t('stats.timeLabel') },
    { icon: <ShieldCheck className="h-8 w-8" strokeWidth={1.3} />, value: t('stats.isoValue'), label: t('stats.isoLabel') }
  ];

  const specs = [
    { icon: <MapPin className="h-[15px] w-[15px]" strokeWidth={1.6} />, text: t('location.hanoi') },
    { icon: <Anchor className="h-[15px] w-[15px]" strokeWidth={1.6} />, text: t('location.haiphong') },
    { icon: <Factory className="h-[15px] w-[15px]" strokeWidth={1.6} />, text: t('location.kcn') },
    { icon: <Route className="h-[15px] w-[15px]" strokeWidth={1.6} />, text: t('location.traffic') }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
      {/* Stats card */}
      <div className="rounded-[0.25rem] border border-[#B8C0CC] bg-[#F5F5F5] px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:divide-x sm:divide-[#B8C0CC]">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center px-3 text-center">
              <div className="text-brand">{s.icon}</div>
              <p className="mt-4 text-[19px] font-bold text-[#1A2D49]">{s.value}</p>
              <p className="mt-2 max-w-[140px] text-[10px] leading-snug text-[#141414]/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Location block */}
      <div className="flex flex-col gap-5 px-6 py-6 lg:w-[460px] lg:flex-row lg:items-stretch lg:px-0 lg:py-0">
        <div className="flex-1">
          <h3 className="text-[11px] font-bold tracking-wide text-[#1A2D49]">{t('location.title')}</h3>
          <p className="mt-3 text-[10px] leading-relaxed text-[#141414]/65">{t('location.desc')}</p>

          <ul className="mt-4 flex flex-col gap-2.5">
            {specs.map((spec, i) => (
              <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-[#141414]/75">
                <span className="text-brand">{spec.icon}</span>
                {spec.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Aerial image */}
        <div className="relative h-[150px] w-full shrink-0 overflow-hidden rounded-[0.25rem] lg:h-auto lg:w-[150px]">
          <Image
            src={ASSETS.about.locationAerial}
            alt="Vị trí chiến lược — Trung tâm phân phối Hà Nam"
            fill
            sizes="(max-width: 1024px) 100vw, 150px"
            className="object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
}
