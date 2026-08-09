'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export function AboutContact() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/about/contact-success');
  };

  return (
    <section className="py-12">
      <div className="rounded-2xl bg-slate-50 p-6 sm:p-10 border border-slate-100">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
            LIÊN HỆ VỚI CHÚNG TÔI
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Kết nối với ULink Industries ngay hôm nay
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của Quý doanh nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Cột trái: Form */}
          <div className="lg:col-span-7 rounded-xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Gửi yêu cầu tư vấn</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email doanh nghiệp *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@company.com"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung cần tư vấn</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả nhu cầu vật tư hoặc thắc mắc của bạn..."
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
              >
                <Send className="h-4 w-4" /> Gửi yêu cầu
              </button>
            </form>
          </div>

          {/* Cột phải: Thông tin liên hệ + Bản đồ */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Văn phòng & Hub Hà Nam</span>
                  <span className="text-xs font-bold text-slate-800">KCN Đồng Văn, Thị xã Duy Tiên, Tỉnh Hà Nam</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Hotline tư vấn</span>
                  <span className="text-xs font-bold text-slate-800">1900 6868 - 0988 123 456</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Email</span>
                  <span className="text-xs font-bold text-slate-800">support@ulink.vn</span>
                </div>
              </div>
            </div>

            {/* Bản đồ Preview */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <iframe
                title="ULink Ha Nam Hub Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.473595677843!2d105.975765!3d20.650228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135c345a5555555%3A0x1!2zS0NOIMSQ4buTbmcgVsSDbiwgRHV5IFRpw6puLCBIw6AgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
