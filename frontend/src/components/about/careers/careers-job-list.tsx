'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Briefcase, Clock, CheckCircle2 } from 'lucide-react';

const jobsData = [
  {
    id: '1',
    slug: 'b2b-sales',
    title: 'Chuyên viên Quản lý Khách hàng (Account Manager)',
    type: 'Full-time',
    location: 'Hà Nội',
    department: 'Kinh doanh B2B',
  },
  {
    id: '2',
    slug: 'warehouse-ops',
    title: 'Kỹ sư Vận hành & Bảo trì Kho (Warehouse Ops Engineer)',
    type: 'Full-time',
    location: 'Hà Nam',
    department: 'Vận hành Kho bãi',
  },
  {
    id: '3',
    slug: 'procurement',
    title: 'Chuyên viên Mua hàng & Chuỗi cung ứng (Procurement Specialist)',
    type: 'Full-time',
    location: 'Hà Nội',
    department: 'Chuỗi cung ứng',
  },
];

const benefits = [
  'Thu nhập hấp dẫn & Thưởng hiệu suất công việc',
  'Cơ hội thăng tiến rõ ràng theo lộ trình cá nhân',
  'Môi trường chuyên nghiệp, đồng nghiệp hòa đồng',
  'Bảo hiểm sức khỏe cao cấp & Khám sức khỏe định kỳ',
  'Khóa đào tạo chuyên sâu về kỹ thuật & chuỗi cung ứng B2B',
];

export function CareersJobList() {
  const [search, setSearch] = useState('');

  const filteredJobs = jobsData.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="py-12" id="openings">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Job Search & List */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
              VỊ TRÍ TUYỂN DỤNG
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Gia nhập đội ngũ ULink</h2>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm vị trí tuyển dụng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-600">
              <option value="">Tất cả phòng ban</option>
              <option value="k doanh">Kinh doanh B2B</option>
              <option value="van hanh">Vận hành Kho bãi</option>
              <option value="supply">Chuỗi cung ứng</option>
            </select>
            <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-600">
              <option value="">Tất cả địa điểm</option>
              <option value="hanoi">Hà Nội</option>
              <option value="hanam">Hà Nam</option>
            </select>
          </div>

          {/* Job List */}
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm border border-slate-100 transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-1.5">
                  <Link
                    href={`/about/careers/${job.slug}`}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {job.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-blue-600" /> {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-600" /> {job.type}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/about/careers/${job.slug}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
                >
                  Ứng tuyển
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              &lt;
            </button>
            <button className="h-8 w-8 rounded-lg bg-blue-600 text-xs font-bold text-white">
              1
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              2
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              3
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              &gt;
            </button>
          </div>
        </div>

        {/* Right Column: Why Join ULink */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-50 p-6 sm:p-8 border border-slate-100 flex flex-col gap-6">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
              ĐÃI NGỘ HẤP DẪN
            </span>
            <h2 className="text-xl font-bold text-slate-900">Vì sao nên chọn ULink?</h2>
          </div>

          <ul className="space-y-4">
            {benefits.map((b, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
