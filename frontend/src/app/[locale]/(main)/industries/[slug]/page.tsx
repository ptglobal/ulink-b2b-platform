import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, Factory, Cpu, Activity, Sparkles, Utensils, ArrowRight, Car, Sun } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { fetchProducts } from '@/lib/product-data';
import ProductCard from '@/components/product/product-card';

interface IndustryPageProps {
  params: { locale: string; slug: string };
}

// Static definition for the 4 industries to ensure high fidelity
const MOCK_INDUSTRY_DETAILS: Record<string, {
  name: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  challenges: string[];
  standards: string[];
}> = {
  'electronics': {
    name: 'Điện tử',
    title: 'Giải pháp kiểm soát ô nhiễm & tĩnh điện cho ngành Điện tử & Bán dẫn',
    description: 'Quy trình sản xuất linh kiện bán dẫn, tấm silicon và bo mạch yêu cầu tiêu chuẩn phòng sạch tối thiểu Class 10 - 1000 (ISO 4 - 6). ULink cung cấp dải sản phẩm chống tĩnh điện (ESD) và kiểm soát ô nhiễm hạt bụi mịn tối ưu để bảo vệ các thiết bị nhạy cảm.',
    icon: Cpu,
    gradient: 'from-blue-600 to-indigo-900',
    challenges: [
      'Hiện tượng phóng tĩnh điện (ESD) gây hỏng chip ngầm không thể phát hiện bằng mắt thường.',
      'Hạt bụi siêu mịn bám dính trên các lớp quang khắc gây chập mạch, đứt đường dẫn điện cực.',
      'Sự nhiễm bẩn chéo từ dầu cơ thể và mồ hôi của công nhân thao tác trực tiếp.'
    ],
    standards: ['ANSI/ESD S20.20', 'IEC 61340-5-1', 'ISO 14644-1 Class 5']
  },
  'pharmaceutical-cosmetics': {
    name: 'Dược phẩm & Mỹ phẩm',
    title: 'Giải pháp vô trùng & kiểm soát vi sinh cho ngành Dược phẩm & Mỹ phẩm',
    description: 'Môi trường bào chế thuốc tiêm, thiết bị y tế và sản phẩm mỹ phẩm đòi hỏi độ vô trùng tối đa (Class 100 - ISO 5) để triệt tiêu bào tử nấm và vi khuẩn. Hệ thống khăn lau phòng sạch vô trùng, găng tay và trang phục bảo hộ của ULink giúp khách hàng tuân thủ nghiêm ngặt chuẩn GMP.',
    icon: Activity,
    gradient: 'from-emerald-600 to-teal-900',
    challenges: [
      'Bụi bẩn và vi sinh vật bám dính trên bao bì chai lọ chiết rót làm hỏng chất lượng thuốc và mỹ phẩm.',
      'Lông bụi từ trang phục công nhân thông thường bay vào khu sản xuất dược chất.',
      'Rủi ro nhiễm bẩn chéo giữa các lô hàng hóa học khác nhau.'
    ],
    standards: ['ISO 13485:2016', 'WHO-GMP', 'ISO 14644-1 Class 5 (Sterile)']
  },
  'food-beverage': {
    name: 'Thực phẩm',
    title: 'Giải pháp vệ sinh an toàn cho ngành chế biến Thực phẩm & Đồ uống',
    description: 'Chế biến thực phẩm đòi hỏi kiểm soát bụi bẩn tối đa và các loại vật tư bao bì tiếp xúc trực tiếp an toàn. Màng co LDPE chịu lực và vật tư phòng sạch của ULink đạt chứng nhận an toàn thực phẩm FDA, hỗ trợ doanh nghiệp vượt qua các đợt thẩm định HACCP khắt khe.',
    icon: Utensils,
    gradient: 'from-amber-500 to-orange-800',
    challenges: [
      'Rác thải vi nhựa và xơ vải từ dụng cụ vệ sinh kém chất lượng rơi vào nguyên liệu chế biến.',
      'Bao bì đóng gói pallet bên ngoài bị rách, tạo điều kiện cho ẩm mốc và côn trùng xâm nhập.',
      'Quy trình lau chùi băng chuyền dính mỡ động thực vật gặp khó khăn do khăn lau không thấm hút.'
    ],
    standards: ['FDA Compliant', 'HACCP', 'ISO 22000']
  },
  'automotive': {
    name: 'Cơ khí chế tạo',
    title: 'Giải pháp phòng sạch & bảo vệ bề mặt cho ngành Cơ khí & Lắp ráp Ô tô',
    description: 'Bao bì bảo vệ sản phẩm, chống trầy xước và bám bẩn hạt sơn, hóa chất dầu mỡ trong quá trình gia công cơ khí chính xác và lắp ráp linh kiện ô tô xe máy.',
    icon: Car,
    gradient: 'from-violet-600 to-purple-900',
    challenges: [
      'Bụi bẩn và xơ vải bám trên bề mặt trước khi sơn gây lỗi ngoại quan sản phẩm.',
      'Hóa chất, dầu mỡ cơ khí gây hư hỏng và mất an toàn lao động.',
      'Rủi ro trầy xước trong quá trình đóng gói và vận chuyển linh kiện.'
    ],
    standards: ['ISO 9001:2015', 'RoHS Compliant', 'CE Standard']
  },
  'solar-energy': {
    name: 'Năng lượng mặt trời',
    title: 'Giải pháp kiểm soát bụi chuyên sâu cho ngành Năng lượng mặt trời',
    description: 'Giải pháp kiểm soát bụi chuyên sâu trên bề mặt tấm pin năng lượng mặt trời, hạn chế tối đa suy hao hiệu suất quang năng và rủi ro lỗi cell.',
    icon: Sun,
    gradient: 'from-orange-500 to-red-800',
    challenges: [
      'Bụi mịn bám trên bề mặt cell pin làm giảm hiệu suất chuyển đổi quang năng.',
      'Tích tụ bụi bẩn lâu ngày gây ra hiện tượng điểm nóng (hotspot) làm hỏng tấm pin.',
      'Hao mòn vật lý do tác động của thời tiết và môi trường khắc nghiệt.'
    ],
    standards: ['IEC 61215', 'UL 1703', 'ISO 9001']
  }
};

export async function generateMetadata({ params: { locale, slug } }: IndustryPageProps): Promise<Metadata> {
  const details = MOCK_INDUSTRY_DETAILS[slug];
  if (!details) return { title: 'Không tìm thấy giải pháp' };
  
  const isVi = locale === 'vi';
  return {
    title: `${details.title} | ULink B2B`,
    description: details.description
  };
}

export default async function IndustryDetailPage({ params: { locale, slug } }: IndustryPageProps) {
  setRequestLocale(locale);
  
  const details = MOCK_INDUSTRY_DETAILS[slug];
  if (!details) {
    // Fallback: If both "pharma" and "cosmetic" link here, map cosmetics to pharmaceutical-cosmetics
    if (slug === 'pharmaceutical-cosmetics') {
      // already exists
    } else {
      notFound();
    }
  }

  const industryData = details || MOCK_INDUSTRY_DETAILS['pharmaceutical-cosmetics'];
  const IconComponent = industryData.icon;

  // Fetch real products belonging to this industry slug
  const { products } = await fetchProducts({
    industry: slug === 'pharmaceutical-cosmetics' ? 'pharmaceutical-cosmetics' : slug,
    limit: 6
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/10 pb-20">
      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-2 sm:px-8 lg:px-16">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/resources" className="hover:text-foreground transition-colors">Tài nguyên</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">{industryData.name}</span>
        </nav>
      </div>

      {/* Hero Header */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 lg:px-16">
        <div className={`relative overflow-hidden bg-gradient-to-r ${industryData.gradient} text-white py-12 px-6 sm:px-10 rounded-3xl shadow-xl`}>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur border border-white/20">
              <IconComponent className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {industryData.title}
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-3xl leading-relaxed">
              {industryData.description}
            </p>
          </div>
        </div>
      </section>

      {/* Body Info */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-8 lg:px-16 grid gap-8 md:grid-cols-3">
        {/* Challenges Block (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-card p-6 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b pb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand" />
              Thách thức sản xuất & Kiểm soát rủi ro
            </h2>
            <ul className="space-y-4">
              {industryData.challenges.map((challenge, idx) => (
                <li key={idx} className="flex gap-3 text-xs sm:text-sm text-foreground/90 items-start">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-[10px] font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Standards Block (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-card p-6 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground border-b pb-2 flex items-center gap-2">
              <Factory className="h-5 w-5 text-emerald-600" />
              Tiêu chuẩn áp dụng
            </h2>
            <div className="flex flex-col gap-2">
              {industryData.standards.map((std) => (
                <div key={std} className="flex items-center gap-2 rounded-xl bg-muted/30 border border-border/40 p-3 text-xs font-semibold text-foreground">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>{std}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Relevant Products Grid */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 lg:px-16 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Sản phẩm & Vật tư tiêu hao đề xuất
          </h2>
          <Link
            href={`/solutions?industry=${slug === 'pharmaceutical-cosmetics' ? 'pharmaceutical-cosmetics' : slug}`}
            className="text-xs sm:text-sm font-semibold text-brand flex items-center gap-1 hover:underline"
          >
            Xem toàn bộ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 rounded-2xl border border-dashed text-sm text-muted-foreground bg-white dark:bg-card">
            Chưa có sản phẩm đề xuất cụ thể cho ngành này. Vui lòng liên hệ bộ phận hỗ trợ kỹ thuật.
          </div>
        )}
      </section>

      {/* Solution Category Redirections */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 lg:px-16">
        <div className="bg-white dark:bg-card p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-muted/20 to-transparent">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Tìm kiếm theo danh mục giải pháp chuyên biệt?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Lọc nhanh toàn bộ sản phẩm của ngành {industryData.name} theo giải pháp phòng sạch hoặc giải pháp đóng gói tương ứng.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/solutions?industry=${slug === 'pharmaceutical-cosmetics' ? 'pharmaceutical-cosmetics' : slug}&category=cleanroom-consumables`}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-xs sm:text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              Xem tất cả sản phẩm phòng sạch
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/solutions?industry=${slug === 'pharmaceutical-cosmetics' ? 'pharmaceutical-cosmetics' : slug}&category=industrial-packaging`}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs sm:text-sm font-semibold text-white shadow transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              Xem tất cả sản phẩm đóng gói
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
