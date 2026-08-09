'use client';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export function CareersNewsletter() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-8 lg:py-12">
      <div className="rounded-2xl bg-blue-600 p-8 lg:p-12 text-white shadow-xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold text-white border border-white/30">
              <Mail className="h-3.5 w-3.5" /> NẮM BẮT CƠ HỘI
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Đăng ký nhận tin tuyển dụng
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Nhận thông báo ngay khi có vị trí làm việc mới phù hợp với kỹ năng và định hướng phát triển của bạn.
            </p>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-6">
            {submitted ? (
              <div className="rounded-xl bg-white/20 p-4 text-center text-white backdrop-blur">
                <p className="font-bold text-sm">Cảm ơn bạn đã đăng ký!</p>
                <p className="text-xs mt-1">Chúng tôi sẽ gửi thông báo công việc mới tới email của bạn.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn..."
                  className="w-full flex-1 rounded-xl px-4 py-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
                >
                  <Send className="h-4 w-4" /> Đăng ký ngay
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
