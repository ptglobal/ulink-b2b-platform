import Link from 'next/link';
import { ShieldCheck, Leaf, HeartPulse, ArrowRight } from 'lucide-react';

const standards = [
  {
    icon: ShieldCheck,
    title: 'ISO 9001:2015',
    tag: 'Hệ thống quản lý chất lượng',
    desc: 'Quy trình kiểm soát chất lượng vật tư đầu vào và xuất kho nghiêm ngặt.',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    icon: Leaf,
    title: 'ISO 14001:2015',
    tag: 'Quản lý môi trường',
    desc: 'Cam kết vận hành thân thiện với môi trường và tiết kiệm năng lượng tiêu thụ.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: HeartPulse,
    title: 'ISO 45001:2018',
    tag: 'An toàn & Sức khỏe nghề nghiệp',
    desc: 'Đảm bảo môi trường làm việc an toàn tuyệt đối cho toàn bộ nhân sự.',
    color: 'text-rose-600 bg-rose-50 border-rose-100',
  },
];

export function AboutStandards() {
  return (
    <section className="py-12 px-6 rounded-2xl bg-slate-50 border border-slate-100 my-4">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          Quy trình chất lượng
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Vận hành theo tiêu chuẩn quốc tế
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {standards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col rounded-xl bg-white p-6 shadow-sm border border-slate-100"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg border ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <span className="mt-1 text-xs font-semibold text-blue-600">
                {item.tag}
              </span>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/about/standards"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all"
        >
          Xem chi tiết Chất lượng & Tiêu chuẩn <ArrowRight className="h-4 w-4 text-blue-600" />
        </Link>
      </div>
    </section>
  );
}
