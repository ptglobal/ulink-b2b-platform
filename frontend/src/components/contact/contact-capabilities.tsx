import { Truck, Boxes, ShieldCheck, Cpu, Leaf } from 'lucide-react';

const capabilities = [
  { icon: Truck, title: 'Giao hàng nhanh', desc: 'Mạng lưới toàn quốc, tối ưu' },
  { icon: Boxes, title: 'Năng lực lưu trữ lớn', desc: 'Diện tích kho > 10,000 m²' },
  { icon: ShieldCheck, title: 'An toàn & Bảo mật', desc: 'Chuẩn ISO 9001, 14001' },
  { icon: Cpu, title: 'Công nghệ hiện đại', desc: 'WMS, TMS tự động hóa' },
  { icon: Leaf, title: 'Phát triển bền vững', desc: 'Hướng tới Logistics xanh' },
];

export function ContactCapabilities() {
  return (
    <section className="py-8 border-t border-slate-100">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {capabilities.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{c.title}</h3>
                <p className="text-[10px] text-slate-500">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
