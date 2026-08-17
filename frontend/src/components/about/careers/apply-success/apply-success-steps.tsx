const steps = [
  {
    num: '1',
    title: 'Xác nhận hồ sơ',
    desc: 'Hệ thống tự động gửi email xác nhận đã nhận CV đầy đủ đến email của bạn.'
  },
  {
    num: '2',
    title: 'Đánh giá năng lực',
    desc: 'Chuyên viên tuyển dụng ULink đánh giá kinh nghiệm và độ phù hợp trong 3 ngày làm việc.'
  },
  {
    num: '3',
    title: 'Liên hệ phỏng vấn',
    desc: 'Nếu CV phù hợp, chúng tôi sẽ gọi điện trực tiếp để đặt lịch phỏng vấn chính thức.'
  }
];

export function ApplySuccessSteps() {
  return (
    <section className="py-10 max-w-5xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Các bước tiếp theo của bạn là gì?
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Hành trình gia nhập đại gia đình ULink Industries bắt đầu từ đây
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.num}
            className="flex flex-col rounded-xl bg-slate-50 p-6 border border-slate-100 shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:bg-white hover:shadow-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white mb-4 shadow-sm">
              {item.num}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-xs leading-relaxed text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
