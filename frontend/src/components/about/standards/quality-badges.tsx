import Image from 'next/image';
import { ASSETS } from '@/lib/assets';

export function QualityBadges() {
  return (
    <section className="py-8">
      <div className="rounded-2xl bg-slate-50 p-6 sm:p-10 border border-slate-100 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl mb-2">
          Chứng nhận ISO
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mb-8">
          Đáp ứng các tiêu chuẩn quốc tế và chất lượng của mỗi mắt xích trong chuỗi cung ứng.
        </p>

        <div className="grid grid-cols-1 gap-6 items-center sm:grid-cols-2 lg:grid-cols-4 w-full max-w-4xl">
          {/* ISO 9001:2015 / QUACERT / JAS-ANZ */}
          <div className="flex h-32 items-center justify-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm transition-transform hover:scale-105">
            <Image
              src={ASSETS.home.certIso9001}
              alt="ISO 9001:2015 QUACERT JAS-ANZ"
              width={320}
              height={140}
              className="h-24 w-auto max-h-[100px] object-contain"
            />
          </div>

          {/* SGS */}
          <div className="flex h-32 items-center justify-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm transition-transform hover:scale-105">
            <Image
              src={ASSETS.home.certSgs}
              alt="SGS Certification"
              width={300}
              height={140}
              className="h-22 w-auto max-h-[90px] object-contain"
            />
          </div>

          {/* RoHS compliant */}
          <div className="flex h-32 items-center justify-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm transition-transform hover:scale-105">
            <Image
              src={ASSETS.home.certRohs}
              alt="RoHS Compliant"
              width={320}
              height={140}
              className="h-24 w-auto max-h-[100px] object-contain"
            />
          </div>

          {/* MSDS Material Safety Data Sheet */}
          <div className="flex h-32 items-center justify-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm transition-transform hover:scale-105">
            <Image
              src={ASSETS.home.certMsds}
              alt="MSDS Material Safety Data Sheet"
              width={340}
              height={160}
              className="h-26 w-auto max-h-[105px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
