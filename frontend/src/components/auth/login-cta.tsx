import { PhoneCall, Send } from '@/components/icons';
import { Link } from '@/i18n/navigation';

export function LoginCta() {
  return (
    <section className="bg-white px-4 py-12 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-7 border-t border-[#dfe5ef] pt-9 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[12px] font-semibold text-[#68758c]">Liên hệ trực tiếp</p>
          <h2 className="mt-2 text-[23px] font-bold text-[#172540]">
            Kết nối với ULink Industries
          </h2>
          <p className="mt-2 max-w-[62ch] text-[13px] leading-5 text-[#5b6780]">
            Đội ngũ ULink sẵn sàng tư vấn giải pháp và hỗ trợ quy trình mua sắm vật tư cho doanh
            nghiệp.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <a
            href="tel:19006868"
            className="inline-flex h-11 items-center gap-2 border border-[#1769e2] px-5 text-[13px] font-semibold text-[#1769e2]"
          >
            <PhoneCall className="h-4 w-4" />
            Gọi ngay
          </a>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center gap-2 bg-[#1769e2] px-5 text-[13px] font-semibold text-white"
          >
            <Send className="h-4 w-4" />
            Gửi yêu cầu
          </Link>
        </div>
      </div>
    </section>
  );
}
