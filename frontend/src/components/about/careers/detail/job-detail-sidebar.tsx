import Link from 'next/link';

const sameDeptJobs = [
  { id: '1', title: 'Account Manager B2B', location: 'Hà Nội' },
  { id: '2', title: 'Chuyên viên Phát triển Thị trường', location: 'Hà Nam' },
  { id: '3', title: 'Kỹ sư Tư vấn Giải pháp Kỹ thuật', location: 'Hà Nội' }
];

export function JobDetailSidebar() {
  return (
    <div className="flex flex-col gap-6 py-8">
      {/* 1. Job Summary Card */}
      <div className="rounded-xl bg-slate-50 p-6 border border-slate-100 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
          Tổng quan vị trí
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Số lượng tuyển:</span>
            <span className="font-semibold text-slate-900">03 người</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Cấp bậc:</span>
            <span className="font-semibold text-slate-900">Chuyên viên</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Kinh nghiệm:</span>
            <span className="font-semibold text-slate-900">1 - 3 năm</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Giới tính:</span>
            <span className="font-semibold text-slate-900">Không yêu cầu</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Hạn nộp hồ sơ:</span>
            <span className="font-semibold text-amber-700">30/08/2026</span>
          </div>
        </div>

        <Link
          href="/about/careers/b2b-sales/apply"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
        >
          Ứng tuyển ngay
        </Link>
      </div>

      {/* 2. Same Department Jobs */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Vị trí cùng phòng ban
        </h3>

        <div className="flex flex-col gap-3">
          {sameDeptJobs.map((item) => (
            <Link
              key={item.id}
              href="/about/careers/b2b-sales"
              className="flex flex-col p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-[color,background-color,border-color,box-shadow,opacity,transform] group"
            >
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">{item.location}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
