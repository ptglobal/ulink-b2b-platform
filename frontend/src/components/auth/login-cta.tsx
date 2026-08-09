import Link from 'next/link';
import { PhoneCall, Send } from 'lucide-react';

export function LoginCta() {
  return (
    <section className="py-8 my-4">
      <div className="rounded-2xl bg-white p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500">Liên hệ trực tiếp</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Kết nối với ULink Industries
          </h2>
          <p className="text-xs text-slate-600">
            Hãy liên hệ với chúng tôi để được tư vấn giải pháp tối ưu cho doanh nghiệp của bạn.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:19006868"
            className="inline-flex items-center gap-2 rounded-xl border border-[#0D4397] bg-white px-5 py-2.5 text-xs font-semibold text-[#0D4397] shadow-sm hover:bg-blue-50 transition-all"
          >
            <PhoneCall className="h-4 w-4" /> Gọi ngay
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0D4397] px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#0a387e] transition-all"
          >
            <Send className="h-4 w-4" /> Gửi yêu cầu
          </Link>
        </div>
      </div>
    </section>
  );
}
