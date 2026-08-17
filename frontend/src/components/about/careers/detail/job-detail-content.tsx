import {
  MapPin,
  Clock,
  ShieldCheck,
  Heart,
  TrendingUp,
  Gift,
  GraduationCap
} from '@/components/icons';

const benefits = [
  {
    icon: Heart,
    title: 'Thu nhập hấp dẫn',
    desc: 'Lương cứng + Hoa hồng doanh số kinh doanh B2B không giới hạn.'
  },
  {
    icon: Gift,
    title: 'Thưởng định kỳ',
    desc: 'Thưởng Tháng 13 & thưởng hiệu suất Quý/Năm theo doanh số.'
  },
  {
    icon: ShieldCheck,
    title: 'Chế độ Bảo hiểm',
    desc: 'Đóng BHXH, BHYT, BHTN đầy đủ + Gói sức khỏe ULink Care.'
  },
  {
    icon: GraduationCap,
    title: 'Đào tạo bài bản',
    desc: 'Khóa học chuyên sâu về sản phẩm vật tư kỹ thuật & Sales B2B.'
  },
  {
    icon: TrendingUp,
    title: 'Lộ trình thăng tiến',
    desc: 'Đánh giá năng lực 6 tháng/lần, cơ hội lên Quản lý nhóm.'
  },
  {
    icon: Heart,
    title: 'Văn hóa & Du lịch',
    desc: 'Team building, du lịch nghỉ dưỡng hàng năm cùng công ty.'
  }
];

export function JobDetailContent() {
  return (
    <div className="flex flex-col gap-8 py-8">
      {/* 1. Mô tả công việc */}
      <div>
        <h2 className="mb-3 border-b border-slate-200 pb-3 text-lg font-bold text-slate-900">
          Mô tả công việc
        </h2>
        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700 list-disc list-inside">
          <li>
            Tìm kiếm, tiếp cận và phát triển quan hệ hợp tác với các doanh nghiệp sản xuất trong các
            Khu công nghiệp.
          </li>
          <li>
            Tư vấn giải pháp vật tư kỹ thuật tổng thể (MRO, bao bì công nghiệp, trang thiết bị phòng
            sạch...).
          </li>
          <li>
            Lập báo giá, đàm phán thương lượng hợp đồng cung ứng và theo dõi tiến độ thực hiện đơn
            hàng.
          </li>
          <li>
            Phối hợp với bộ phận Vận tải & Kho bãi Hub Hà Nam đảm bảo tiến độ giao hàng đúng cam kết
            cho nhà máy.
          </li>
          <li>
            Báo cáo kết quả kinh doanh định kỳ và cập nhật dữ liệu khách hàng lên hệ thống CRM
            ULink.
          </li>
        </ul>
      </div>

      {/* 2. Yêu cầu ứng viên */}
      <div>
        <h2 className="mb-3 border-b border-slate-200 pb-3 text-lg font-bold text-slate-900">
          Yêu cầu ứng viên
        </h2>
        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700 list-disc list-inside mb-4">
          <li>
            Tốt nghiệp Đại học chuyên ngành Kinh tế, Quản trị kinh doanh, Thương mại hoặc các ngành
            Kỹ thuật liên quan.
          </li>
          <li>
            Có từ 1 - 3 năm kinh nghiệm sales B2B, ưu tiên ứng viên từng bán hàng vào các nhà máy
            sản xuất tại KCN.
          </li>
          <li>
            Kỹ năng giao tiếp, đàm phán thương lượng và thuyết phục khách hàng doanh nghiệp tốt.
          </li>
          <li>Chủ động, có tinh thần trách nhiệm cao và chịu được áp lực doanh số.</li>
          <li>Sử dụng thành thạo máy tính văn phòng và phần mềm CRM.</li>
        </ul>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            #B2BSales
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            #KhuCongNghiep
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            #CungUngVatTu
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            #NhaMaySanXuat
          </span>
        </div>
      </div>

      {/* 3. Quyền lợi được hưởng */}
      <div>
        <h2 className="mb-4 border-b border-slate-200 pb-3 text-lg font-bold text-slate-900">
          Quyền lợi được hưởng
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex flex-col rounded-xl bg-slate-50 p-4 border border-slate-100"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">{b.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Địa điểm & Thời gian làm việc */}
      <div>
        <h2 className="mb-3 border-b border-slate-200 pb-3 text-lg font-bold text-slate-900">
          Địa điểm & Thời gian làm việc
        </h2>
        <div className="rounded-xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Địa chỉ:</strong> Tầng 8, Tòa nhà HL Building, Ngõ 82 Duy Tân, Cầu Giấy, Hà
              Nội
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <Clock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Thời gian:</strong> Thứ 2 - Thứ 6 (8h00 - 17h00), Thứ 7 (8h00 - 12h00)
            </span>
          </div>

          {/* Embedded Google Map */}
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border border-slate-200 mt-2">
            <iframe
              title="ULink Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814184964!2d105.78189631502444!3d21.02881188599839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab868b5001e5%3A0x82f49d32d0f507b9!2zQ8CauIEdp4bqteSwgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
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
  );
}
