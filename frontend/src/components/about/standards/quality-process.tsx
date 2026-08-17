const steps = [
  {
    num: '01',
    title: 'Kiểm tra đầu vào',
    desc: 'Kiểm định nghiệm thu chất lượng vật tư ngay khi nhập kho 100% lô hàng.'
  },
  {
    num: '02',
    title: 'Giám sát quy trình',
    desc: 'Kiểm soát điều kiện lưu trữ và bảo quản kho bãi đúng tiêu chuẩn kỹ thuật.'
  },
  {
    num: '03',
    title: 'Kiểm định thành phẩm',
    desc: 'Kiểm tra chất lượng chi tiết trước khi đóng gói và xuất kho giao hàng.'
  },
  {
    num: '04',
    title: 'Đóng gói & Lưu kho',
    desc: 'Đóng gói bảo vệ an toàn chuẩn công nghiệp và lưu trữ chế độ bảo quản nghiêm ngặt.'
  },
  {
    num: '05',
    title: 'Giao hàng & Hậu mãi',
    desc: 'Giao hàng đúng hẹn tận nhà máy và hỗ trợ kỹ thuật xử lý yêu cầu phát sinh 24/7.'
  }
];

export function QualityProcess() {
  return (
    <section className="py-12 px-6 sm:px-10 rounded-2xl bg-brand-strong text-white my-8 shadow-xl">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="inline-flex items-center rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-white border border-white/20 mb-2">
          QUY TRÌNH VẬN HÀNH
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Quy trình Quản lý Chất lượng
        </h2>
        <p className="mt-2 text-sm text-blue-100 max-w-xl">
          Quy trình 5 bước khép kín đảm bảo mỗi vật tư công nghiệp cung cấp đến doanh nghiệp đều đạt
          tiêu chuẩn kỹ thuật tối cao.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-xl bg-white/10 p-5 border border-white/15 backdrop-blur transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:bg-white/15"
          >
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-brand shadow">
              {step.num}
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
            <p className="text-xs leading-relaxed text-blue-100 flex-1">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
