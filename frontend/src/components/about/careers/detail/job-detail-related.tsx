import Link from 'next/link';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';

const relatedJobs = [
  {
    id: '1',
    title: 'Kỹ sư Vận hành & Bảo trì Kho (Warehouse Ops Engineer)',
    department: 'Vận hành Kho bãi',
    location: 'Hà Nam',
    type: 'Full-time',
  },
  {
    id: '2',
    title: 'Chuyên viên Mua hàng & Chuỗi cung ứng (Procurement)',
    department: 'Chuỗi cung ứng',
    location: 'Hà Nội',
    type: 'Full-time',
  },
  {
    id: '3',
    title: 'Chuyên viên Marketing B2B (B2B Marketing Specialist)',
    department: 'Marketing',
    location: 'Hà Nội',
    type: 'Full-time',
  },
];

export function JobDetailRelated() {
  return (
    <section className="py-12 border-t border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-900">Các vị trí khác đang tuyển dụng</h2>
        <Link href="/about/careers" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {relatedJobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-blue-200"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{job.title}</h3>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3 text-blue-600" /> {job.department}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-blue-600" /> {job.location}</span>
              </div>
            </div>
            <Link
              href="/about/careers/b2b-sales"
              className="inline-flex justify-center rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
            >
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
