import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { MapPin, Phone, Mail, ChevronRight, Linkedin, Facebook, Youtube } from 'lucide-react';
import { ASSETS } from '@/lib/assets';
import { FooterLocaleSwitcher } from './footer-locale-switcher';

export async function SiteFooter() {
  const t = await getTranslations('footer');

  return (
    <footer className="w-full bg-[#F8FAFC] text-slate-800 border-t border-slate-200">
      {/* ── MAIN FOOTER CONTENT ── */}
      <div className="mx-auto w-full max-w-[1800px] px-6 py-12 lg:py-16">
        {/* ── TOP SECTION: LOGO & 3 CATEGORY COLUMNS (4 COLS GRID) ── */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Col 1: Logo & Company Legal Info (4/12 COLS) */}
          <div className="lg:col-span-4">
            <Image
              src={ASSETS.logo.main}
              alt="ULink Industries"
              width={230}
              height={96}
              className="h-[96px] w-[230px] object-contain"
            />
            <p className="mt-6 text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">
              ULink Industries cung cấp các giải pháp và sản phẩm đạt chuẩn chất lượng theo yêu cầu và tiêu chuẩn ISO 9001, đáp ứng nhu cầu sản xuất của Doanh nghiệp
            </p>
            <p className="mt-4 text-[12px] leading-relaxed text-slate-500 sm:text-[13px]">
              Giấy chứng nhận ĐKKD số: 0110286665 do Sở Kế hoạch và Đầu tư thành phố Hà Nội cấp ngày 2/8/2026.
            </p>
          </div>

          {/* Col 2: VỀ CHÚNG TÔI (3/12 COLS) */}
          <div className="lg:col-span-3 lg:pl-8">
            <Link
              href="/about"
              className="group inline-flex items-center gap-1 text-[15px] font-bold uppercase tracking-wide text-slate-900 transition-colors hover:text-brand sm:text-[16px]"
            >
              VỀ CHÚNG TÔI
              <ChevronRight className="h-4 w-4 text-slate-900 transition-transform group-hover:translate-x-1" />
            </Link>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/about" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Trung tâm phân phối Hà Nam
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Chất lượng & Tiêu chuẩn
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Phát triển bền vững
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Năng lực cung ứng
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Cơ hội nghề nghiệp
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: NGÀNH NGHỀ (3/12 COLS) */}
          <div className="lg:col-span-3 lg:pl-4">
            <Link
              href="/industries"
              className="group inline-flex items-center gap-1 text-[15px] font-bold uppercase tracking-wide text-slate-900 transition-colors hover:text-brand sm:text-[16px]"
            >
              NGÀNH NGHỀ
              <ChevronRight className="h-4 w-4 text-slate-900 transition-transform group-hover:translate-x-1" />
            </Link>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/industries/electronics" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Điện tử & Bán dẫn
                </Link>
              </li>
              <li>
                <Link href="/industries/pharma" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Dược phẩm & Y tế
                </Link>
              </li>
              <li>
                <Link href="/industries/food" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Thực phẩm & Đồ uống
                </Link>
              </li>
              <li>
                <Link href="/industries/machinery" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Cơ khí & Khuôn mẫu
                </Link>
              </li>
              <li>
                <Link href="/industries/lab" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  QA/QC & Lab
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: SẢN PHẨM (2/12 COLS) */}
          <div className="lg:col-span-2">
            <Link
              href="/products"
              className="group inline-flex items-center gap-1 text-[15px] font-bold uppercase tracking-wide text-slate-900 transition-colors hover:text-brand sm:text-[16px]"
            >
              SẢN PHẨM
              <ChevronRight className="h-4 w-4 text-slate-900 transition-transform group-hover:translate-x-1" />
            </Link>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/products/cleanroom" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Phòng sạch
                </Link>
              </li>
              <li>
                <Link href="/products/packaging" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Đóng gói & Bao bì
                </Link>
              </li>
              <li>
                <Link href="/products/hvac" className="text-[13px] text-slate-600 transition-colors hover:text-brand sm:text-[14px]">
                  Công nghiệp & HVAC
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── MIDDLE SECTION: CONTACT & CONNECTIVITY & QR & LOCALE (4 COLS GRID) ── */}
        <div className="mt-12 border-t border-slate-200 pt-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 items-start">
            {/* Block 1: Hub Address & Email & Socials (4/12 COLS) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-slate-800 mt-0.5" />
                <div>
                  <p className="text-[14px] font-bold text-slate-900 sm:text-[15px]">HUB Hà Nam</p>
                  <p className="mt-1 text-[13px] text-slate-600 sm:text-[14px]">
                    Lô CN05 KCN Đồng Văn IV, xã Đại Cường, huyện Kim Bảng, tỉnh Hà Nam
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Mail className="h-5 w-5 shrink-0 text-slate-800" />
                <a href="mailto:contact@ulinkindustries.com" className="text-[14px] font-semibold text-slate-800 hover:text-brand sm:text-[15px]">
                  contact@ulinkindustries.com
                </a>
              </div>

              <div className="pt-4">
                <p className="text-[13px] font-bold text-slate-900 sm:text-[14px]">
                  Kết nối với Chúng tôi trên
                </p>
                <div className="mt-3 flex items-center gap-4">
                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-transform hover:scale-105"
                    aria-label="LinkedIn"
                  >
                    <Image
                      src={ASSETS.footer.linkedin}
                      alt="LinkedIn"
                      width={44}
                      height={44}
                      className="h-10 w-10 object-contain"
                    />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-transform hover:scale-105"
                    aria-label="Facebook"
                  >
                    <Image
                      src={ASSETS.footer.facebook}
                      alt="Facebook"
                      width={44}
                      height={44}
                      className="h-10 w-10 object-contain"
                    />
                  </a>

                  {/* TikTok */}
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-transform hover:scale-105"
                    aria-label="TikTok"
                  >
                    <Image
                      src={ASSETS.footer.tiktok}
                      alt="TikTok"
                      width={44}
                      height={44}
                      className="h-10 w-10 object-contain"
                    />
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-transform hover:scale-105"
                    aria-label="YouTube"
                  >
                    <Image
                      src={ASSETS.footer.youtube}
                      alt="YouTube"
                      width={44}
                      height={44}
                      className="h-10 w-10 object-contain"
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Block 2: Distributor & Bộ Công Thương Badge (3/12 COLS) */}
            <div className="lg:col-span-3 space-y-6 lg:pl-4">
              <div>
                <p className="text-[14px] font-bold text-slate-900 sm:text-[15px]">
                  Trở thành Nhà phân phối
                </p>
                <div className="mt-2 flex items-center gap-3 text-slate-800">
                  <Phone className="h-5 w-5 shrink-0 text-slate-800" />
                  <a href="tel:02473099899" className="text-[16px] font-extrabold text-slate-900 hover:text-brand sm:text-[18px]">
                    0247 309 9899
                  </a>
                </div>
              </div>

              {/* Bộ Công Thương Badge */}
              <div className="pt-2">
                <Image
                  src={ASSETS.footer.boCongThuong}
                  alt="Đã thông báo Bộ Công Thương"
                  width={200}
                  height={70}
                  className="h-14 w-auto object-contain sm:h-16"
                />
              </div>
            </div>

            {/* Block 3: App Download & QR Code (3/12 COLS) */}
            <div className="lg:col-span-3">
              <div className="inline-flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[13px] font-bold text-slate-800 sm:text-[14px]">
                  Tải ứng dụng ULINK
                </p>
                <div className="mt-3 relative h-28 w-28 overflow-hidden rounded">
                  <Image
                    src={ASSETS.footer.qrCode}
                    alt="Mã QR tải ứng dụng ULink"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Block 4: Locale Switcher (2/12 COLS) */}
            <div className="flex justify-start lg:justify-end lg:col-span-2 pt-2">
              <FooterLocaleSwitcher />
            </div>
          </div>
        </div>

        {/* ── BOTTOM COPYRIGHT BAR ── */}
        <div className="mt-12 border-t border-slate-200 pt-8 text-center">
          <p className="text-[13px] font-medium text-slate-600 sm:text-[14px]">
            Copyright ULink Industries. Tất cả các quyền được bảo vệ
          </p>
        </div>
      </div>
    </footer>
  );
}
