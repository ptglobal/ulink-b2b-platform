import { Briefcase, DollarSign, Clock, Calendar } from '@/components/icons';

const processSteps = [
  { num: '1', title: 'Tiếp nhận hồ sơ' },
  { num: '2', title: 'Sàng lọc CV phù hợp' },
  { num: '3', title: 'Phỏng vấn' },
  { num: '4', title: 'Đánh giá' },
  { num: '5', title: 'Gửi Offer' },
  { num: '6', title: 'Onboarding' }
];

export function ApplySidebar() {
  return (
    <div className="flex flex-col gap-6 py-8">
      {/* Card 1: Tóm tắt công việc */}
      <div className="rounded-xl bg-slate-50 p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
          Tóm tắt công việc
        </h3>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Cấp bậc</span>
              <span className="font-bold text-slate-800">Chuyên viên</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Mức lương</span>
              <span className="font-bold text-slate-800">15 - 25 triệu VNĐ</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Hình thức làm việc</span>
              <span className="font-bold text-slate-800">Toàn thời gian</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Hạn nộp hồ sơ</span>
              <span className="font-bold text-amber-700">30/08/2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Quy trình tuyển dụng */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Quy trình tuyển dụng
        </h3>

        <div className="flex flex-col gap-3">
          {processSteps.map((step) => (
            <div key={step.num} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                {step.num}
              </span>
              <span className="text-xs font-semibold text-slate-800">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
