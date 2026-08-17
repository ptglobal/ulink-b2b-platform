import { Sparkles, Users, ShieldCheck, TrendingUp, Target, Heart } from '@/components/icons';

const values = [
  {
    icon: Sparkles,
    title: 'Môi trường mở & Đổi mới',
    desc: 'Khuyến khích mọi cá nhân đưa ra ý tưởng mới, sáng tạo không giới hạn và thử nghiệm giải pháp đột phá.'
  },
  {
    icon: Users,
    title: 'Tinh thần đồng đội',
    desc: 'Hợp tác chặt chẽ, chia sẻ tri thức và luôn sẵn sàng hỗ trợ lẫn nhau hoàn thành mục tiêu chung.'
  },
  {
    icon: ShieldCheck,
    title: 'Liêm chính & Uy tín',
    desc: 'Đặt tinh thần trung thực, minh bạch và tính cam kết uy tín lên hàng đầu trong mọi hành động.'
  },
  {
    icon: TrendingUp,
    title: 'Phát triển cá nhân',
    desc: 'Tạo mọi điều kiện học tập, tham gia đào tạo chuyên sâu và lộ trình thăng tiến rõ ràng cho từng vị trí.'
  },
  {
    icon: Target,
    title: 'Cam kết sứ mệnh',
    desc: 'Đồng lòng hướng tới sứ mệnh tối ưu hóa chuỗi cung ứng vật tư B2B cho cộng đồng doanh nghiệp Việt.'
  },
  {
    icon: Heart,
    title: 'Đóng góp cộng đồng',
    desc: 'Gắn liền sự phát triển của doanh nghiệp với trách nhiệm xã hội và định hướng phát triển xanh bền vững.'
  }
];

export function CareersCulture() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          VĂN HÓA & NỀN TẢNG
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Giá trị cốt lõi của chúng tôi
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xl">
          Những nguyên tắc định hình phong cách làm việc và môi trường doanh nghiệp tại ULink.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex flex-col rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
