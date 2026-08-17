import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Building2, MonitorSmartphone, Truck, UserRound } from '@/components/icons';
import { ASSETS } from '@/lib/assets';

export async function AboutHubOperations() {
  const t = await getTranslations('aboutHub');

  const cards = [
    {
      icon: <Building2 className="h-5 w-5" strokeWidth={1.5} />,
      title: t('operations.warehouse'),
      desc: t('operations.warehouseDesc'),
      img: ASSETS.about.opWarehouse
    },
    {
      icon: <MonitorSmartphone className="h-5 w-5" strokeWidth={1.5} />,
      title: t('operations.wms'),
      desc: t('operations.wmsDesc'),
      img: ASSETS.about.opWms
    },
    {
      icon: <Truck className="h-5 w-5" strokeWidth={1.5} />,
      title: t('operations.network'),
      desc: t('operations.networkDesc'),
      img: ASSETS.about.opTruck
    },
    {
      icon: <UserRound className="h-5 w-5" strokeWidth={1.5} />,
      title: t('operations.team'),
      desc: t('operations.teamDesc'),
      img: ASSETS.about.opTeam
    }
  ];

  const isoBadges = [
    { img: ASSETS.about.iso9001, code: 'ISO 9001:2015', label: t('iso.quality') },
    { img: ASSETS.about.iso14001, code: 'ISO 14001:2015', label: t('iso.environment') },
    { img: ASSETS.about.iso45001, code: 'ISO 45001:2018', label: t('iso.safety') }
  ];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto_320px]">
      {/* Operations grid */}
      <div>
        <h2 className="mb-5 text-[12px] font-bold tracking-wide text-foreground">
          {t('operations.title')}
        </h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, i) => (
            <div key={i} className="flex h-full flex-col">
              <div className="flex flex-1 items-start gap-2.5">
                <span className="mt-0.5 text-brand">{card.icon}</span>
                <div>
                  <p className="text-[11px] font-bold leading-tight text-foreground">{card.title}</p>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-foreground/60">
                    {card.desc}
                  </p>
                </div>
              </div>
              <div className="relative mt-3 h-[103px] w-full overflow-hidden rounded-[0.25rem]">
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden w-px bg-border lg:block" />

      {/* ISO standards */}
      <div>
        <h2 className="mb-3 text-[12px] font-bold tracking-wide text-foreground">
          {t('iso.title')}
        </h2>
        <p className="text-[10px] leading-relaxed text-foreground/65">{t('iso.desc')}</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {isoBadges.map((badge, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="relative h-[45px] w-[52px]">
                <Image
                  src={badge.img}
                  alt={badge.code}
                  fill
                  sizes="52px"
                  className="object-contain"
                />
              </div>
              <p className="mt-2 text-[9px] font-bold text-foreground">{badge.code}</p>
              <p className="mt-1 text-[9px] leading-snug text-foreground/60">{badge.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
