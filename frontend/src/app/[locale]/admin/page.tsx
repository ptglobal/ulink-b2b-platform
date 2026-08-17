import { setRequestLocale } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient } from '@/lib/directus';
import { readItems, readUsers } from '@directus/sdk';
import { Link } from '@/i18n/navigation';
import {
  FileSpreadsheet,
  FileCheck,
  Package,
  Plus,
  Users,
  Mail,
  ArrowRight,
  Activity,
  Upload
} from '@/components/icons';
import { PageIntro } from '@/components/ui/page-intro';
import { Badge } from '@/components/ui/badge';
import { Surface, SurfaceContent, SurfaceDescription, SurfaceHeader, SurfaceTitle } from '@/components/ui/surface';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  params: { locale: string };
}

export default async function AdminDashboardPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const user = await getCurrentUser();
  const stats: Record<'rfqs' | 'sampleRequests' | 'contacts' | 'products' | 'users', number | null> = {
    rfqs: null,
    sampleRequests: null,
    contacts: null,
    products: null,
    users: null
  };
  let sourceAvailable = false;

  try {
    const client = createWriteDirectusClient();
    const [rfqRes, sampleRes, contactRes, productRes, usersRes] = await Promise.all([
      client.request(readItems('rfq_requests', { fields: ['id'] })),
      client.request(readItems('sample_requests', { fields: ['id'] })),
      client.request(readItems('contact_requests', { fields: ['id'] })),
      client.request(readItems('products', { fields: ['id'] })),
      client.request(readUsers({ fields: ['id'] }))
    ]);
    stats.rfqs = rfqRes?.length ?? 0;
    stats.sampleRequests = sampleRes?.length ?? 0;
    stats.contacts = contactRes?.length ?? 0;
    stats.products = productRes?.length ?? 0;
    stats.users = usersRes?.length ?? 0;
    sourceAvailable = true;
  } catch (error) {
    console.warn('Directus stats fetch failed:', error);
  }

  const kpis = [
    { label: 'Yêu cầu báo giá', value: stats.rfqs, description: 'RFQ trong hệ thống', icon: FileSpreadsheet, href: '/admin/rfqs' },
    { label: 'Yêu cầu hàng mẫu', value: stats.sampleRequests, description: 'Hồ sơ mẫu thử', icon: FileCheck, href: '/admin/sample-requests' },
    { label: 'Liên hệ gửi về', value: stats.contacts, description: 'Tin nhắn khách hàng', icon: Mail, href: '/admin/contact-requests' },
    { label: 'Sản phẩm', value: stats.products, description: 'Bản ghi danh mục', icon: Package, href: '/admin/products' },
    { label: 'Tài khoản', value: stats.users, description: 'Người dùng hệ thống', icon: Users, href: '/admin/users' }
  ];

  const queues = [
    { label: 'Xử lý yêu cầu báo giá', description: 'Kiểm tra nhu cầu, SKU, số lượng và thời hạn phản hồi.', value: stats.rfqs, href: '/admin/rfqs', icon: FileSpreadsheet },
    { label: 'Duyệt yêu cầu hàng mẫu', description: 'Theo dõi quyết định, địa chỉ nhận và phản hồi của khách hàng.', value: stats.sampleRequests, href: '/admin/sample-requests', icon: FileCheck },
    { label: 'Phản hồi liên hệ mới', description: 'Phân loại yêu cầu tư vấn trước khi chuyển cho đội phụ trách.', value: stats.contacts, href: '/admin/contact-requests', icon: Mail }
  ];

  return (
    <div className="pb-12">
      <PageIntro
        eyebrow="ULINK / OPERATIONS"
        title={`Chào ${user?.first_name || 'Admin'}`}
        description="Theo dõi nhu cầu B2B, danh mục sản phẩm và các hàng đợi vận hành từ một hệ thống nhất quán."
        meta={<Badge variant={sourceAvailable ? 'success' : 'warning'} dot>{sourceAvailable ? 'Directus đã đồng bộ' : 'Chưa kết nối nguồn dữ liệu'}</Badge>}
        actions={
          <Link href="/admin/products" className={cn(buttonVariants(), 'group')}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tạo sản phẩm
          </Link>
        }
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <section aria-label="Chỉ số vận hành" className="grid divide-y divide-border border-y border-border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
          {kpis.map((kpi) => (
            <Link key={kpi.href} href={kpi.href} className="group flex min-h-32 flex-col justify-between p-4 hover:bg-muted/60 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <kpi.icon className="h-4 w-4 text-muted-foreground group-hover:text-brand" aria-hidden="true" />
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
              </div>
              <div className="mt-5">
                <p className="ulink-data text-2xl font-semibold tracking-[-0.03em]">{kpi.value ?? '—'}</p>
                <p className="mt-1 text-xs font-medium text-foreground">{kpi.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{kpi.description}</p>
              </div>
            </Link>
          ))}
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <Surface>
            <SurfaceHeader className="sm:flex-row sm:items-center sm:justify-between">
              <div>
                <SurfaceTitle>Hàng đợi cần xử lý</SurfaceTitle>
                <SurfaceDescription>Đi vào đúng nhóm hồ sơ mà không cần dò lại menu.</SurfaceDescription>
              </div>
              <Activity className="h-5 w-5 text-evidence" aria-hidden="true" />
            </SurfaceHeader>
            <SurfaceContent className="divide-y divide-border p-0">
              {queues.map((queue) => (
                <Link key={queue.href} href={queue.href} className="group flex items-center gap-4 px-5 py-5 hover:bg-muted/55 sm:px-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand">
                    <queue.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{queue.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{queue.description}</span>
                  </span>
                  <span className="ulink-data text-sm font-medium text-muted-foreground">{queue.value ?? '—'}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden="true" />
                </Link>
              ))}
            </SurfaceContent>
          </Surface>

          <Surface>
            <SurfaceHeader>
              <SurfaceTitle>Thao tác nhanh</SurfaceTitle>
              <SurfaceDescription>Các công việc danh mục thường dùng.</SurfaceDescription>
            </SurfaceHeader>
            <SurfaceContent className="grid gap-2">
              <Link href="/admin/products" className="group flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-muted">
                <Plus className="h-4 w-4 text-brand" aria-hidden="true" />
                Thêm sản phẩm mới
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link href="/admin/import" className="group flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-muted">
                <Upload className="h-4 w-4 text-evidence" aria-hidden="true" />
                Nhập dữ liệu thương mại
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link href="/admin/users" className="group flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-muted">
                <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Quản lý tài khoản
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </SurfaceContent>
          </Surface>
        </div>
      </div>
    </div>
  );
}
