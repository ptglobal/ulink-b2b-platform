import { BrandedMedia } from '@/components/media/branded-media';
import { ASSETS } from '@/lib/assets';
import type { ContentMedia } from '@/lib/directus';

const defaults = [
  {
    path: ASSETS.brand.operations.wms,
    role: 'about.operations.wms-control',
    alt: 'Đội vận hành ULink giám sát tồn kho và lịch giao hàng trên hệ thống WMS',
    title: 'Điều hành kho bằng dữ liệu',
    description: 'Tồn kho, ngoại lệ và lịch giao được theo dõi tại một điểm kiểm soát.'
  },
  {
    path: ASSETS.brand.operations.inbound,
    role: 'about.operations.inbound-quality',
    alt: 'Nhân sự ULink kiểm tra vật tư tại khu vực tiếp nhận hàng',
    title: 'Kiểm soát đầu vào',
    description: 'Vật tư được đối chiếu mã hàng, tình trạng bao gói và hồ sơ trước khi nhập kho.'
  },
  {
    path: ASSETS.brand.operations.dispatch,
    role: 'about.operations.regional-dispatch',
    alt: 'Đội ULink kiểm tra tải trọng và đai kiện trước khi xe rời trung tâm phân phối',
    title: 'Điều phối giao nhận vùng',
    description: 'Lô hàng được cố định, xác nhận và bàn giao theo kế hoạch vận tải.'
  },
  {
    path: ASSETS.brand.operations.team,
    role: 'about.operations.technical-team',
    alt: 'Nhóm kỹ thuật và mua hàng ULink rà soát mẫu vật tư cùng kế hoạch cung ứng',
    title: 'Đội ngũ kỹ thuật liên chức năng',
    description: 'Kỹ thuật, mua hàng và vận hành cùng xác minh yêu cầu trước khi chốt phương án.'
  }
];

export function AboutInfrastructure({ media }: { media?: ContentMedia[] }) {
  const items = defaults.map((item, index) => ({ ...item, ...(media?.[index] ?? {}) }));

  return (
    <section className="py-12 lg:py-20">
      <div className="grid gap-8 border-t border-border pt-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.75fr)] lg:gap-16">
        <div>
          <p className="text-sm font-semibold text-brand">Hệ thống vận hành ULink</p>
          <h2 className="mt-4 max-w-[15ch] text-3xl font-normal leading-tight text-foreground sm:text-4xl">
            Hạ tầng được tổ chức quanh khả năng kiểm soát
          </h2>
          <p className="mt-5 max-w-[48ch] text-sm leading-7 text-muted-foreground">
            Mỗi điểm chạm từ nhận hàng, lưu kho đến giao vận đều có người phụ trách và bằng chứng vận hành rõ ràng.
          </p>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.role} className="bg-card">
              <BrandedMedia
                src={item.path}
                alt={item.alt}
                className="aspect-[16/10] w-full"
                imageClassName="transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 34vw"
                compactBrand
              />
              <div className="p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
