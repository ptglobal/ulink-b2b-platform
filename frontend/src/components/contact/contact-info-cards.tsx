'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { submitContactRequest } from '@/lib/contact-submit';

export function ContactInfoCards() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    setSubmitting(true);
    setError(null);

    const formData = new FormData(form);
    try {
      const result = await submitContactRequest({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        subject: String(formData.get('subject') ?? ''),
        message: String(formData.get('message') ?? '')
      });

      if (result.ok) {
        form.reset();
        router.push('/about/contact-success');
        return;
      }

      setError(result.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-8 lg:py-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-6">
          <h2 className="border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
            THÔNG TIN LIÊN HỆ
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="mb-0.5 block font-bold text-slate-900">Địa chỉ</span>
                <span className="leading-relaxed text-slate-600">
                  Lô CN05, KCN Đồng Văn IV, Xã Đại Cương, Huyện Kim Bảng, Tỉnh Hà Nam, Việt Nam
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <span className="mb-0.5 block font-bold text-slate-900">Điện thoại</span>
                <span className="font-semibold text-slate-600">(+84) 226 3 888 908</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <span className="mb-0.5 block font-bold text-slate-900">Email</span>
                <span className="font-semibold text-slate-600">contact@ulinkindustries.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span className="mb-0.5 block font-bold text-slate-900">Giờ làm việc</span>
                <span className="block text-slate-600">Thứ 2 - Thứ 6: 08:00 - 17:00</span>
                <span className="block text-slate-600">Thứ 7: 08:00 - 12:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-900">
              GỬI YÊU CẦU LIÊN HỆ
            </h2>
            <p className="text-[11px] text-slate-500">
              Vui lòng điền thông tin, đội ngũ của chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">Họ và tên *</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Nhập họ và tên"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">Email doanh nghiệp *</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="contact@company.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">Số điện thoại *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="(+84) 123 456 789"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">Chủ đề *</label>
                <select
                  name="subject"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-600"
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="Báo giá vật tư MRO">Báo giá vật tư MRO</option>
                  <option value="Hợp tác cung ứng">Hợp tác cung ứng</option>
                  <option value="Tư vấn giải pháp kỹ thuật">Tư vấn giải pháp kỹ thuật</option>
                  <option value="Yêu cầu khác">Yêu cầu khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-700">Nội dung yêu cầu *</label>
              <textarea
                name="message"
                rows={3}
                required
                placeholder="Nhập nội dung yêu cầu của bạn..."
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đi'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 rounded-xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <h2 className="border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
              VỊ TRÍ TRUNG TÂM
            </h2>
            <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-lg border border-slate-200">
              <iframe
                title="ULink Hub Ha Nam Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.473595677843!2d105.975765!3d20.650228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135c345a5555555%3A0x1!2zS0NOIMSQ4buTbmcgVsSDbiwgRHV5IFRpw6puLCBIw6AgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
          </div>

          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Xem bản đồ trên Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
