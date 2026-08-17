import Link from 'next/link';

const jobs = [
  {
    id: '1',
    category: 'Khối Sản Xuất - Công Nghệ Cao',
    title: 'Kỹ Sư Giám Sát Chất Lượng QA/QC (Phòng Sạch)',
    salary: '14 - 20M VNĐ',
    location: 'Kim Bảng, Hà Nam',
    href: '/about/careers/qa-qc-engineer'
  },
  {
    id: '2',
    category: 'Phòng Logistics & HUB',
    title: 'Chuyên Viên Logistics & Điều Phối Chuỗi Cung Ứng',
    salary: '12 - 18M VNĐ',
    location: 'HUB Hà Nam',
    href: '/about/careers/logistics-spec'
  }
];

export function ApplySuccessRecommendations() {
  return (
    <section className="py-10 max-w-5xl mx-auto border-t border-slate-100">
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Cơ hội nghề nghiệp tương tự dành cho bạn
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Các vị trí đang tuyển có yêu cầu kỹ năng tương tự với hồ sơ của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {jobs.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col justify-between rounded-xl bg-white p-6 border border-slate-100 shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:shadow-md hover:border-blue-200 group"
          >
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                {item.category}
              </span>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
                {item.title}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="font-bold text-blue-600">{item.salary}</span>
              <span className="text-slate-500 font-medium">{item.location}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
