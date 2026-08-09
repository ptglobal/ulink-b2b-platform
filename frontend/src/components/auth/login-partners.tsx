const partnerLogos = [
  { name: 'SAMSUNG', color: 'text-blue-700 font-extrabold' },
  { name: 'Canon', color: 'text-red-600 font-extrabold italic' },
  { name: 'Panasonic', color: 'text-blue-800 font-bold' },
  { name: 'IBM', color: 'text-blue-600 font-extrabold tracking-widest' },
  { name: 'Traphaco', color: 'text-emerald-600 font-bold' },
  { name: 'Coca-Cola', color: 'text-red-600 font-serif italic' },
  { name: 'VINFAST', color: 'text-slate-800 font-extrabold' },
  { name: 'LG', color: 'text-rose-600 font-bold' },
  { name: 'Amkor Technology', color: 'text-blue-900 font-semibold' },
  { name: 'Vinamilk', color: 'text-blue-700 font-extrabold' },
  { name: '3M', color: 'text-red-600 font-black' },
  { name: 'BYD', color: 'text-red-700 font-bold tracking-widest' },
];

export function LoginPartners() {
  return (
    <section className="py-12 my-8 border-t border-slate-100">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          HƠN 300 DOANH NGHIỆP FDI & TẬP ĐOÀN DƯỢC PHẨM ĐỒNG HÀNH CÙNG ULINK INDUSTRIES
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6 items-center justify-items-center opacity-85">
        {partnerLogos.map((p, idx) => (
          <div
            key={idx}
            className="flex h-16 w-full items-center justify-center rounded-xl bg-slate-50 p-3 text-lg sm:text-xl transition-all hover:bg-white hover:shadow-md hover:scale-105"
          >
            <span className={p.color}>{p.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
