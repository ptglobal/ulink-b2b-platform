const steps = [
  {
    badge: 'BƯỚC 01',
    title: 'Xác nhận & Phân tích',
    desc: 'Hệ thống CRM chuyển hồ sơ trực tiếp đến kỹ thuật viên chuyên ngành vật tư của ULink Industries để bóc tách quy cách kỹ thuật.',
  },
  {
    badge: 'BƯỚC 02',
    title: 'Tư vấn & Báo giá chuyên sâu',
    desc: 'Chuyên viên Kinh doanh liên hệ để làm rõ các yêu cầu về tiêu chuẩn sản phẩm, số lượng đơn hàng, lịch trình giao hàng và đề xuất phương án tối ưu.',
  },
  {
    badge: 'BƯỚC 03',
    title: 'Ký kết & Sản xuất - Cung ứng',
    desc: 'Thực hiện hợp đồng cung ứng thông qua HUB Hà Nam, đảm bảo nguồn cung ổn định, liên tục và tối ưu hóa chi phí vận hành.',
  },
];

export function ContactNextSteps() {
  return (
    <section className="py-12 px-4 sm:px-8">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          QUY TRÌNH TIẾP THEO
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Các bước xử lý yêu cầu của ULink
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="inline-flex w-fit items-center rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold text-white mb-4">
              {item.badge}
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {item.title}
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
