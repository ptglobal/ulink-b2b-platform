import { Warehouse, PackageCheck, Clock, Award } from '@/components/icons';

const stats = [
  {
    icon: Warehouse,
    value: '10.000 m²',
    label: 'Diện tích kho bãi',
    sub: 'Lưu trữ & trung chuyển'
  },
  {
    icon: PackageCheck,
    value: '3.000+',
    label: 'Danh mục SKU',
    sub: 'Sẵn sàng giao ngay'
  },
  {
    icon: Clock,
    value: '24 - 48h',
    label: 'Thời gian giao hàng',
    sub: 'Tối ưu toàn Miền Bắc'
  },
  {
    icon: Award,
    value: 'ISO 9001:2015',
    label: 'Tiêu chuẩn chất lượng',
    sub: 'Quản lý kho đạt chuẩn'
  }
];

export function AboutStats() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:shadow-md hover:-translate-y-1"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-2xl font-bold text-slate-900 sm:text-3xl">{item.value}</span>
              <span className="mt-1 text-sm font-semibold text-slate-700">{item.label}</span>
              <span className="mt-0.5 text-xs text-slate-500">{item.sub}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
