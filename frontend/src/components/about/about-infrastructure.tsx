import Image from 'next/image';

const items = [
  {
    image: '/images/about/op-wms.webp',
    title: 'Hệ thống kho WMS',
    desc: 'Quản lý kho hàng tự động, theo dõi tồn kho theo thời gian thực chuẩn xác.',
  },
  {
    image: '/images/about/op-warehouse.webp',
    title: 'Quản lý đơn hàng OMS',
    desc: 'Xử lý đơn hàng thông minh, tối ưu hóa quy trình từ khâu đặt hàng đến xuất kho.',
  },
  {
    image: '/images/about/op-truck.webp',
    title: 'Mạng lưới Vận tải',
    desc: 'Đội xe vận chuyển chuyên dụng, đảm bảo giao hàng an toàn, đúng hẹn.',
  },
  {
    image: '/images/about/op-team.webp',
    title: 'Đội ngũ chuyên nghiệp',
    desc: 'Kỹ sư & chuyên gia tư vấn giải pháp vật tư kỹ thuật chuyên sâu cho nhà máy.',
  },
];

export function AboutInfrastructure() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          Vận hành thông minh
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Hạ tầng kỹ thuật & Hệ thống tối ưu
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="group flex flex-col overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col p-5">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
