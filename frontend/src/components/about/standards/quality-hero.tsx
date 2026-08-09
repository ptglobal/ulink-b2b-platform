import Image from 'next/image';

export function QualityHero() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col gap-4 max-w-3xl mb-8">
        <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
          CHẤT LƯỢNG & TIÊU CHUẨN
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
          Chất lượng là cam kết. Tiêu chuẩn là nền tảng.
        </h1>
        <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
          Tại ULink B2B Platform, chất lượng sản phẩm và vật tư kỹ thuật không chỉ là mục tiêu kinh doanh, mà là lời cam kết sinh tử với hiệu quả vận hành của Khách hàng. Chúng tôi thiết lập hệ thống kiểm soát chất lượng đạt chuẩn quốc tế ISO ngay từ khâu lưu kho, kiểm định đến khi giao tới dây chuyền sản xuất.
        </p>
      </div>

      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-900/10">
        <Image
          src="/images/about/kho.png"
          alt="Trung tâm kiểm định chất lượng vật tư ULink"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 p-2 shadow-md backdrop-blur">
          <span className="text-xs font-extrabold text-blue-600">ULINK</span>
        </div>
      </div>
    </section>
  );
}
