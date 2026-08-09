import Image from 'next/image';
import { ShieldCheck, Zap, HeartHandshake } from 'lucide-react';

export function LoginHeroCard() {
  return (
    <div className="relative flex flex-col justify-between rounded-2xl bg-[#0D4397] p-8 lg:p-10 text-white shadow-xl h-full min-h-[600px] overflow-hidden">
      {/* Subtle Background Terminal Image Layer with lowered opacity */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
        <Image
          src="/images/about/warehouse-terminal.png"
          alt="ULink Logistics Terminal Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
          Kết nối hôm nay,<br />Kiến tạo <span className="text-blue-300">tương lai.</span>
        </h1>
        <p className="text-xs sm:text-sm leading-relaxed text-blue-100/90 max-w-md">
          ULink Industries chuyên sản xuất và phân phối các sản phẩm vật tư kỹ thuật cho doanh nghiệp sản xuất, với danh mục đa dạng, đáp ứng mọi nhu cầu vận hành - tối ưu chi phí mang lại hiệu suất cao.
        </p>
      </div>

      {/* Foreground Featured Image Overlay (kho_1.png) */}
      <div className="relative z-10 aspect-[4/3] w-full overflow-hidden rounded-xl shadow-2xl border border-white/30 my-6">
        <Image
          src="/images/about/kho_1.png"
          alt="Hệ thống kệ kho tự động ULink Industries"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Bottom 3 Feature Badges */}
      <div className="relative z-10 grid grid-cols-3 gap-3 pt-4 border-t border-white/15">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200 backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-white">An toàn</span>
            <span className="block text-[10px] text-blue-200">Tiêu chuẩn kỹ thuật cao</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200 backdrop-blur">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-white">Hiệu quả</span>
            <span className="block text-[10px] text-blue-200">Tối ưu chi phí sản xuất</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200 backdrop-blur">
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-white">Đồng hành</span>
            <span className="block text-[10px] text-blue-200">Hỗ trợ doanh nghiệp 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
