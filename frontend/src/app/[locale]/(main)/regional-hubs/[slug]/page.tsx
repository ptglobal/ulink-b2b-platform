import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  ArrowLeft,
  MapPin,
  Activity,
  CheckCircle,
  Package,
  Clock,
  Truck,
  Warehouse,
  Users,
  Phone,
  Layers,
  Sparkles
} from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { fetchRegionalHubBySlug, getHubName, getIndustrialZoneName } from '@/lib/regional-hub-data';

interface PageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({ params: { locale, slug } }: PageProps) {
  const hub = await fetchRegionalHubBySlug(slug);
  if (!hub) return {};

  const name = getHubName(hub, locale);
  return {
    title: `${name} - Regional Hub | ULINK INDUSTRIES`,
    description: `Detailed operational capacity, SLA metrics, and logistics services at ${name} Regional Hub in ${hub.detail_address || ''}.`
  };
}

export default async function RegionalHubDetailPage({ params: { locale, slug } }: PageProps) {
  setRequestLocale(locale);
  const hub = await fetchRegionalHubBySlug(slug);

  if (!hub) {
    notFound();
  }

  const hubName = getHubName(hub, locale);
  const isVi = locale === 'vi';
  const isJa = locale === 'ja';

  // Multi-language text helpers
  const t = {
    backToList: isVi ? 'Quay lại danh sách Hub' : isJa ? 'ハブ一覧に戻る' : 'Back to Regional Hubs',
    operatingStatus: isVi ? 'Trạng thái hoạt động' : isJa ? '稼働状況' : 'Operating Status',
    active: isVi ? 'Đang hoạt động' : isJa ? '稼働中' : 'Active',
    inactive: isVi ? 'Tạm ngưng' : isJa ? '休止中' : 'Inactive',
    hubCode: isVi ? 'Mã Hub' : isJa ? 'ハブコード' : 'Hub Code',
    address: isVi ? 'Địa chỉ chi tiết' : isJa ? '詳細住所' : 'Address',
    coordinates: isVi ? 'Tọa độ GPS' : isJa ? 'GPS座標' : 'GPS Coordinates',
    slaTitle: isVi
      ? 'Cam kết SLA & Hiệu suất Giao nhận'
      : isJa
        ? 'SLAコミットメントと配送パフォーマンス'
        : 'SLA Commitments & Delivery Performance',
    ordersToday: isVi ? 'Đơn hàng hôm nay' : isJa ? '本日の注文数' : 'Orders Today',
    onTimeRate: isVi ? 'Tỷ lệ đúng giờ' : isJa ? '定時配送率' : 'On-Time Delivery Rate',
    deliveryTime: isVi ? 'Thời gian giao hàng' : isJa ? '配送時間' : 'Delivery Time Timeframe',
    standard: isVi ? 'Chuẩn' : isJa ? '標準' : 'Standard',
    average: isVi ? 'Trung bình' : isJa ? '平均' : 'Average',
    warehouseTitle: isVi
      ? 'Hạ tầng & Sức chứa Kho bãi'
      : isJa
        ? '倉庫インフラと収容力'
        : 'Warehouse Infrastructure & Capacity',
    utilizedArea: isVi ? 'Diện tích đã sử dụng' : isJa ? '使用済面積' : 'Utilized Area',
    availableArea: isVi ? 'Diện tích còn trống' : isJa ? '空き面積' : 'Available Area',
    totalArea: isVi ? 'Tổng diện tích' : isJa ? '総面積' : 'Total Area',
    storageCapacity: isVi ? 'Sức chứa lưu kho' : isJa ? '最大保管容量' : 'Storage Capacity',
    pallets: isVi ? 'Số vị trí Pallet' : isJa ? 'パレット位置数' : 'Pallet Slots',
    personInCharge: isVi ? 'Nhân sự phụ trách' : isJa ? '担当者' : 'Person in Charge',
    personnelCount: isVi
      ? 'Số lượng nhân sự tại Hub'
      : isJa
        ? 'ハブ担当スタッフ数'
        : 'Hub Personnel Count',
    industrialZonesTitle: isVi
      ? 'Khu Công Nghiệp Liên kết'
      : isJa
        ? '提携工業団地'
        : 'Connected Industrial Zones',
    industrialZonesDesc: isVi
      ? 'Mạng lưới khu công nghiệp trong phạm vi phục vụ trực tiếp của Hub.'
      : isJa
        ? '当ハブが直接サービスを提供する工業団地ネットワーク。'
        : 'Industrial parks directly serviced by this regional hub.',
    teamTitle: isVi
      ? 'Đội ngũ Kỹ thuật & Vận hành'
      : isJa
        ? '技術・運用チーム'
        : 'Technical & Operations Team',
    teamDesc: isVi
      ? 'Chuyên gia giàu kinh nghiệm hỗ trợ kỹ thuật và kiểm soát chất lượng tại hiện trường.'
      : isJa
        ? '現地での技術サポートおよび品質管理を提供する経験豊富な専門家。'
        : 'Experienced specialists on-site for technical support and quality control.',
    experience: isVi ? 'năm kinh nghiệm' : isJa ? '年の経験' : 'years exp'
  };

  // Directus URL construction
  const directusUrl =
    process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL || 'http://localhost:8055';
  const getImageUrl = (id: string) => `${directusUrl}/assets/${id}`;

  // Utilized area math
  const totalArea = hub.warehouse_total_area || 0;
  const utilizedArea = hub.warehouse_utilized_area || 0;
  const availableArea = hub.warehouse_available_area || 0;
  const utilizationPercent = totalArea > 0 ? Math.round((utilizedArea / totalArea) * 100) : 0;

  return (
    <div className="w-full bg-background py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
        {/* === Back Navigation & Breadcrumbs === */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/regional-hubs"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-brand"
            id="back_to_hubs_link"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t.backToList}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{isVi ? 'Trang chủ' : isJa ? 'ホーム' : 'Home'}</span>
            <span>/</span>
            <Link href="/regional-hubs" className="hover:text-brand transition-colors">
              {isVi ? 'Cụm công nghiệp' : isJa ? '工業クラスター' : 'Clusters'}
            </Link>
            <span>/</span>
            <span className="font-medium text-primary">{hubName}</span>
          </div>
        </div>

        {/* === HERO CONTAINER (Premium Glassmorphism & Navy) === */}
        <section className="relative overflow-hidden rounded-xl border border-border bg-foreground p-6 text-white shadow-lg sm:p-8">
          {/* Subtle glowing backgrounds */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Left Content */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded bg-[#102A43] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand shadow-inner ring-1 ring-brand/20">
                  <Sparkles className="h-3 w-3 text-brand" />
                  {hub.hub_code || 'HUB'}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    hub.operating_status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${hub.operating_status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
                  />
                  {hub.operating_status === 'active' ? t.active : t.inactive}
                </span>
              </div>

              <h1
                className="mt-4 text-[28px] font-extrabold tracking-tight text-white sm:text-[34px] lg:text-[38px]"
                id="hub_detail_title"
              >
                {hubName}
              </h1>

              <div className="mt-6 space-y-3.5 text-slate-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold text-white">{t.address}:</span>{' '}
                    {hub.detail_address || '---'}
                    {hub.district && typeof hub.district === 'object' && `, ${hub.district.name}`}
                    {hub.province && typeof hub.province === 'object' && `, ${hub.province.name}`}
                  </p>
                </div>
                {hub.coordinates && (
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-4.5 w-4.5 shrink-0 text-brand" />
                    <p className="text-sm">
                      <span className="font-semibold text-white">{t.coordinates}:</span>{' '}
                      <span className="font-mono text-xs bg-slate-800/80 px-2 py-0.5 rounded text-slate-200 border border-slate-700 shadow-inner">
                        {hub.coordinates}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Quick stats / Person in Charge */}
            <div className="shrink-0 rounded-lg border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm md:w-[320px]">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand">
                {t.personInCharge}
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 border border-brand/20 text-brand text-sm font-bold">
                  {hub.person_in_charge_name
                    ? hub.person_in_charge_name.split(' ').pop()?.charAt(0)
                    : 'PIC'}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">
                    {hub.person_in_charge_name || '---'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {hub.person_in_charge_title || 'PIC'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2.5 border-t border-slate-700/50 pt-3.5 text-slate-300">
                <Phone className="h-4 w-4 text-brand" />
                <a
                  href={`tel:${hub.person_in_charge_phone || ''}`}
                  className="text-xs font-mono hover:text-white transition-colors"
                >
                  {hub.person_in_charge_phone || '---'}
                </a>
              </div>
              {hub.current_personnel_count && (
                <div className="mt-2.5 flex items-center gap-2.5 text-slate-300">
                  <Users className="h-4 w-4 text-brand" />
                  <span className="text-xs">
                    {t.personnelCount}:{' '}
                    <strong className="text-white font-semibold">
                      {hub.current_personnel_count}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* === METRICS GRID: SLA & WAREHOUSE === */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* SLA Performance Metrics - 5 Cols */}
          <div className="flex flex-col rounded-lg border border-border bg-white p-5 shadow-sm lg:col-span-5">
            <h2 className="text-[14px] font-bold text-primary border-b border-slate-100 pb-3 flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-brand" />
              {t.slaTitle}
            </h2>

            <div className="flex flex-1 flex-col justify-between py-2 gap-5 mt-4">
              {/* Daily Orders */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/8 text-brand">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t.ordersToday}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-[24px] font-bold text-primary leading-none">
                      {hub.orders_today ?? '0'}
                    </span>
                    {hub.order_capacity_per_day && (
                      <span className="text-xs text-muted-foreground">
                        / {hub.order_capacity_per_day}{' '}
                        {isVi ? 'đơn tối đa' : isJa ? '最大注文' : 'cap'}
                      </span>
                    )}
                  </div>
                  {hub.order_capacity_per_day && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round(((hub.orders_today || 0) / hub.order_capacity_per_day) * 100))}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* On-Time Rate */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t.onTimeRate}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[24px] font-bold text-primary leading-none">
                      {hub.on_time_rate ? `${hub.on_time_rate}%` : '---'}
                    </span>
                    {hub.on_time_rate_delta && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        {hub.on_time_rate_delta}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery SLA */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t.deliveryTime}
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {t.standard}
                      </span>
                      <span className="text-[16px] font-bold text-primary">
                        {hub.standard_delivery_time || '---'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {t.average}
                      </span>
                      <span className="text-[16px] font-bold text-primary">
                        {hub.avg_delivery_time || '---'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse Capacity - 7 Cols */}
          <div className="flex flex-col rounded-lg border border-border bg-white p-5 shadow-sm lg:col-span-7">
            <h2 className="text-[14px] font-bold text-primary border-b border-slate-100 pb-3 flex items-center gap-2">
              <Warehouse className="h-4.5 w-4.5 text-brand" />
              {t.warehouseTitle}
            </h2>

            <div className="mt-5 flex-1 flex flex-col justify-between gap-6">
              {/* Premium Progress Bar */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-primary">{t.utilizedArea}</span>
                    <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
                      ({utilizationPercent}%)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t.totalArea}:
                    </span>
                    <span className="ml-1.5 text-sm font-bold text-primary">
                      {totalArea.toLocaleString()} m²
                    </span>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="relative h-4 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200/50 shadow-inner">
                  <div
                    className="h-full bg-brand transition-[color,background-color,border-color,box-shadow,opacity,transform]"
                    style={{ width: `${utilizationPercent}%` }}
                    title={`${t.utilizedArea}: ${utilizedArea.toLocaleString()} m²`}
                  />
                  <div
                    className="h-full bg-emerald-500/25 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
                    style={{ width: `${100 - utilizationPercent}%` }}
                    title={`${t.availableArea}: ${availableArea.toLocaleString()} m²`}
                  />
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-3 w-3 rounded bg-brand" />
                    <span>
                      {t.utilizedArea}: <strong>{utilizedArea.toLocaleString()} m²</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-3 w-3 rounded bg-emerald-500/35 border border-emerald-500/10" />
                    <span>
                      {t.availableArea}: <strong>{availableArea.toLocaleString()} m²</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Other Storage Stats */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {t.pallets}
                    </p>
                    <p className="mt-0.5 text-[20px] font-bold text-primary">
                      {hub.warehouse_pallets ? hub.warehouse_pallets.toLocaleString() : '---'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {t.storageCapacity}
                    </p>
                    <p className="mt-0.5 text-[20px] font-bold text-primary">
                      {hub.warehouse_storage_tons
                        ? `${hub.warehouse_storage_tons.toLocaleString()} t`
                        : '---'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === INDUSTRIAL ZONES SECTION === */}
        <section className="mt-8 rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-bold text-primary flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-brand" />
            {t.industrialZonesTitle}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{t.industrialZonesDesc}</p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {hub.industrial_zones && hub.industrial_zones.length > 0 ? (
              hub.industrial_zones.map((zone) => {
                const zoneName = getIndustrialZoneName(zone, locale);
                return (
                  <div
                    key={zone.id}
                    className="group overflow-hidden rounded-lg border border-border/60 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-brand/40 transition-[color,background-color,border-color,box-shadow,opacity,transform] flex flex-col"
                  >
                    {/* Image/Placeholder container */}
                    <div className="relative aspect-[16/9] w-full bg-slate-200 border-b border-slate-200/60 overflow-hidden">
                      {zone.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getImageUrl(zone.image)}
                          alt={zoneName}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/60 text-slate-400 group-hover:text-brand transition-colors">
                          <Warehouse className="h-8 w-8 stroke-[1.2]" />
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-center">
                      <p className="text-[13px] font-bold leading-snug text-primary group-hover:text-brand transition-colors">
                        {zoneName}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground border border-dashed border-slate-200 rounded-lg">
                No industrial zones linked to this hub.
              </div>
            )}
          </div>
        </section>

        {/* === TECHNICAL TEAM SECTION === */}
        <section className="mt-8 rounded-lg border border-border bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-bold text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-brand" />
            {t.teamTitle}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{t.teamDesc}</p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {hub.team_members && hub.team_members.length > 0 ? (
              hub.team_members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-border/60 bg-slate-50/50 p-4 transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:bg-white hover:shadow-md hover:border-brand/40 flex items-center gap-3.5"
                >
                  {/* Photo or initials */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-brand/5 flex items-center justify-center text-brand font-bold text-sm">
                    {member.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageUrl(member.photo)}
                        alt={member.name}
                        className="h-full w-full object-cover object-center"
                        loading="lazy"
                      />
                    ) : (
                      <span>{member.name.split(' ').pop()?.charAt(0) || 'U'}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-tight text-primary truncate">
                      {member.name}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-muted-foreground truncate">
                      {member.role || 'Specialist'}
                    </p>
                    {member.years_experience && (
                      <p className="mt-0.5 text-[10px] text-brand font-semibold">
                        {member.years_experience} {t.experience}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground border border-dashed border-slate-200 rounded-lg">
                No team member details available.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
