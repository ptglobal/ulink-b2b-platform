'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, X, ArrowRight } from 'lucide-react';

export function ApplyForm() {
  const router = useRouter();
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/about/careers/apply-success');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 py-8">
      {/* Section 01: Thông tin cá nhân */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            01
          </span>
          <h2 className="text-base font-bold text-slate-900">Thông tin cá nhân</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              required
              placeholder="Nhập đầy đủ họ và tên của bạn"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ Email *</label>
              <input
                type="email"
                required
                placeholder="nhapname@example.com"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                required
                placeholder="Nhập số điện thoại liên hệ"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày tháng năm sinh *</label>
              <input
                type="date"
                required
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính *</label>
              <select
                required
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="">Không yêu cầu / Chọn giới tính</option>
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
                <option value="khac">Khác</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 02: Trình độ học vấn */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            02
          </span>
          <h2 className="text-base font-bold text-slate-900">Trình độ học vấn</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bậc học cao nhất *</label>
              <select
                required
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="dai-hoc">Đại học</option>
                <option value="thac-si">Thạc sĩ</option>
                <option value="cao-dang">Cao đẳng</option>
                <option value="khac">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trường Đại học / Cao đẳng *</label>
              <input
                type="text"
                required
                placeholder="Tên trường học của bạn"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên ngành *</label>
              <input
                type="text"
                required
                placeholder="Chuyên ngành đào tạo"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Năm tốt nghiệp *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 2021"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 03: Kinh nghiệm làm việc gần nhất */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            03
          </span>
          <h2 className="text-base font-bold text-slate-900">Kinh nghiệm làm việc gần nhất</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên công ty gần nhất</label>
              <input
                type="text"
                placeholder="Nhập tên công ty bạn đã/đang làm việc"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vị trí đảm nhiệm</label>
              <input
                type="text"
                placeholder="Ví dụ: Nhân viên kinh doanh, Trưởng nhóm..."
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian làm việc</label>
            <input
              type="text"
              placeholder="Ví dụ: 03/2022 - Hiện tại hoặc 2 năm"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả ngắn về công việc và thành tựu nổi bật</label>
            <textarea
              rows={4}
              placeholder="Nêu ngắn gọn nhiệm vụ chính và KPI hoặc kết quả nổi bật bạn đã đạt được..."
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Section 04: Hồ sơ đính kèm (CV) */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            04
          </span>
          <h2 className="text-base font-bold text-slate-900">Hồ sơ đính kèm (CV)</h2>
        </div>

        <div className="relative border-2 border-dashed border-blue-200 rounded-xl p-8 bg-blue-50/30 flex flex-col items-center justify-center text-center transition-colors hover:bg-blue-50/60">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          {cvFile ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm text-xs font-semibold text-blue-700">
              <FileText className="h-4 w-4" />
              <span>{cvFile.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCvFile(null);
                }}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-900">
                Kéo thả tệp tin CV của bạn vào đây
              </p>
              <p className="text-[11px] text-blue-600 underline mt-1">Hoặc bấm để chọn tệp từ máy tính</p>
              <p className="text-[10px] text-slate-400 mt-2">Hỗ trợ định dạng PDF, DOC, DOCX. Dung lượng tối đa 10MB.</p>
            </>
          )}
        </div>
      </div>

      {/* Section 05: Thư giới thiệu & Submit */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            05
          </span>
          <h2 className="text-base font-bold text-slate-900">Thư giới thiệu / Thông điệp gửi nhà tuyển dụng</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Thư giới thiệu (Không bắt buộc)</label>
          <textarea
            rows={4}
            placeholder="Chia sẻ lý do bạn mong muốn đồng hành cùng ULink, mục tiêu phát triển bản thân hoặc kỳ vọng..."
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
          ></textarea>
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input type="checkbox" required id="commit" className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
          <label htmlFor="commit" className="text-[11px] leading-relaxed text-slate-600">
            Tôi cam kết thông tin cung cấp là chính xác và đồng ý cho ULink Industries sử dụng thông tin này phục vụ quy trình tuyển dụng và đánh giá năng lực theo đúng Chính sách bảo mật thông tin.
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">Đơn ứng tuyển sẽ được gửi trực tiếp đến bộ phận nhân sự.</span>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all"
          >
            Gửi đơn <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
