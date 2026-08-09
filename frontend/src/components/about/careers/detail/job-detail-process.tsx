import { Mail } from 'lucide-react';

const processSteps = [
  { num: '01', title: 'Ứng tuyển', desc: 'Gửi CV ứng tuyển trực tiếp tại website hoặc email HR.' },
  { num: '02', title: 'Sàng lọc hồ sơ', desc: 'Phòng HR tiếp nhận và phản hồi ứng viên trong 48h.' },
  { num: '03', title: 'Phỏng vấn', desc: 'Phỏng vấn chuyên môn 1-2 vòng với Trưởng phòng.' },
  { num: '04', title: 'Nhận việc', desc: 'Gửi Offer Letter và làm thủ tục Onboarding.' },
];

export function JobDetailProcess() {
  return (
    <section className="py-6 border-t border-slate-100" id="apply">
      <h2 className="text-lg font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-3">
        Quy trình ứng tuyển
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((s, idx) => (
          <div key={idx} className="flex flex-col rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs font-extrabold text-blue-600 mb-1">{s.num}</span>
            <h3 className="text-xs font-bold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* HR Support Note Box */}
      <div className="mt-6 rounded-xl bg-blue-50 p-5 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900">Liên hệ trực tiếp Phòng Nhân sự ULink</span>
            <span className="text-xs text-slate-600">Email: hr@ulink.vn | Hotline: 024 7300 9899</span>
          </div>
        </div>

        <a
          href="mailto:hr@ulink.vn"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
        >
          Gửi CV qua Email
        </a>
      </div>
    </section>
  );
}
