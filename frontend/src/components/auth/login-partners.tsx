import Image from 'next/image';
import { ASSETS } from '@/lib/assets';

const partners = [
  ['Samsung', ASSETS.home.partnerSamsung], ['Canon', ASSETS.home.partnerCanon], ['Panasonic', ASSETS.home.partnerPanasonic], ['IBM', ASSETS.home.partnerIbm], ['Traphaco', ASSETS.home.partnerTraphaco], ['Coca-Cola', ASSETS.home.partnerCocaCola], ['VinFast', ASSETS.home.partnerVinfast], ['LG', ASSETS.home.partnerLg], ['Amkor', ASSETS.home.partnerAmkor], ['Vinamilk', ASSETS.home.partnerVinamilk], ['3M', ASSETS.home.partner3m], ['BYD', ASSETS.home.partnerByd]
] as const;

export function LoginPartners() {
  return (
    <section className="border-y border-[#e2e7f0] bg-white px-4 py-14 sm:px-8 lg:px-16">
      <p className="text-center text-[11px] font-bold uppercase tracking-[.08em] text-[#68758c]">Hơn 300 doanh nghiệp FDI & tập đoàn dược phẩm đồng hành cùng ULink Industries</p>
      <div className="mx-auto mt-9 grid max-w-[1120px] grid-cols-3 gap-x-8 gap-y-7 sm:grid-cols-4 lg:grid-cols-6">
        {partners.map(([name, src]) => <div key={name} className="flex h-12 items-center justify-center"><Image src={src} alt={name} width={120} height={46} className="max-h-9 w-auto max-w-[110px] object-contain" /></div>)}
      </div>
    </section>
  );
}
