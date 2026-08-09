import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';

export function ApplySuccessHero() {
  return (
    <section className="py-10 flex flex-col items-center text-center max-w-3xl mx-auto">
      {/* Top Checkmark Circle */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30">
        <Check className="h-8 w-8 stroke-[3]" />
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
        Nộp đơn ứng tuyển thành công!
      </h1>

      {/* Description */}
      <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
        Cảm ơn bạn đã nộp đơn ứng tuyển tại ULink Industries. Hồ sơ của bạn đã được gửi trực tiếp đến Bộ phận Nhân sự. Chúng tôi trân trọng tài năng của bạn và sẽ phản hồi kết quả duyệt hồ sơ sớm nhất.
      </p>

      {/* Back to Home Button */}
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-blue-600 shadow-sm hover:bg-slate-50 hover:border-blue-200 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>
      </div>
    </section>
  );
}
