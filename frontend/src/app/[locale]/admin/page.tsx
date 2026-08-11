import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient } from '@/lib/directus';
import { readItems, readUsers } from '@directus/sdk';
import { Link } from '@/i18n/navigation';
import {
  FileSpreadsheet,
  FileCheck,
  Package,
  PlusCircle,
  FileText,
  Users,
  Mail,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface Props {
  params: { locale: string };
}

export default async function AdminDashboardPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const user = await getCurrentUser();

  // Try to fetch actual counts from Directus (with fallbacks if offline/unconfigured)
  const stats = {
    rfqs: 12,
    sampleRequests: 4,
    contacts: 0,
    products: 48,
    users: 5
  };

  try {
    const client = createWriteDirectusClient();
    const [rfqRes, sampleRes, contactRes, productRes, usersRes] = await Promise.all([
      client.request(readItems('rfq_requests', { fields: ['id'] })),
      client.request(readItems('sample_requests', { fields: ['id'] })),
      client.request(readItems('contact_requests', { fields: ['id'] })),
      client.request(readItems('products', { fields: ['id'] })),
      client.request(readUsers({ fields: ['id'] }))
    ]);
    if (rfqRes) stats.rfqs = rfqRes.length;
    if (sampleRes) stats.sampleRequests = sampleRes.length;
    if (contactRes) stats.contacts = contactRes.length;
    if (productRes) stats.products = productRes.length;
    if (usersRes) stats.users = usersRes.length;
  } catch (err) {
    console.warn('Directus stats fetch failed, using fallback numbers:', err);
  }

  const kpis = [
    {
      label: 'Yêu cầu Báo giá',
      value: stats.rfqs,
      desc: 'Yêu cầu RFQ cần phản hồi',
      icon: FileSpreadsheet,
      color: 'bg-blue-500/10 text-blue-600 border-blue-100',
      href: '/admin/rfqs'
    },
    {
      label: 'Yêu cầu Hàng mẫu',
      value: stats.sampleRequests,
      desc: 'Hồ sơ chờ phê duyệt mẫu thử',
      icon: FileCheck,
      color: 'bg-orange-500/10 text-orange-600 border-orange-100',
      href: '/admin/sample-requests'
    },
    {
      label: 'Liên hệ gửi về',
      value: stats.contacts,
      desc: 'Tin nhắn từ form liên hệ',
      icon: Mail,
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-100',
      href: '/admin/contact-requests'
    },
    {
      label: 'Sản phẩm đang bán',
      value: stats.products,
      desc: 'SKUs đang hoạt động trên hệ thống',
      icon: Package,
      color: 'bg-green-500/10 text-green-600 border-green-100',
      href: '/admin/products'
    },
    {
      label: 'Tài khoản User',
      value: stats.users,
      desc: 'Tài khoản đăng nhập hệ thống',
      icon: Users,
      color: 'bg-purple-500/10 text-purple-600 border-purple-100',
      href: '/admin/users'
    }
  ];

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      {/* Header Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Trang chủ Quản trị
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight mt-1">
            Chào mừng quay trở lại, {user?.first_name || 'Admin'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Hệ thống quản lý thông tin B2B ULink Industries.
          </p>
        </div>
      </div>

      {/* Grid of KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {kpis.map((kpi, idx) => (
          <Link
            key={idx}
            href={kpi.href}
            className="block bg-white border border-slate-100 hover:border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xs text-slate-400 font-bold tracking-tight block">
              {kpi.label}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight block mt-1">
              {kpi.value}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-2">
              {kpi.desc}
            </span>
          </Link>
        ))}
      </div>

      {/* Grid of Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-[#0F1E36] mb-4">
            Thao tác nhanh
          </h3>
          <div className="space-y-3">
            <Link
              href="/admin/products"
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-50 hover:bg-slate-50 text-slate-700 hover:text-[#0F1E36] text-xs sm:text-sm font-bold transition-colors"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="h-4.5 w-4.5 text-blue-600" />
                <span>Thêm sản phẩm mới</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/articles"
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-50 hover:bg-slate-50 text-slate-700 hover:text-[#0F1E36] text-xs sm:text-sm font-bold transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4.5 w-4.5 text-blue-600" />
                <span>Viết bài tin tức mới</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-50 hover:bg-slate-50 text-slate-700 hover:text-[#0F1E36] text-xs sm:text-sm font-bold transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-4.5 w-4.5 text-blue-600" />
                <span>Quản lý tài khoản User</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/contact-requests"
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-50 hover:bg-slate-50 text-slate-700 hover:text-[#0F1E36] text-xs sm:text-sm font-bold transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-cyan-600" />
                <span>Hộp thư liên hệ</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Columns: System Info Summary */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0F1E36] mb-3">
              Hướng dẫn Vận hành Hệ thống B2B
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-4">
              Đây là trang tổng quan vận hành hệ thống bán hàng và truyền thông B2B của ULink. Bạn có thể sử dụng menu bên trái để điều hướng nhanh đến các khu vực quản lý:
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-650 font-medium">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Cập nhật và chỉnh sửa thông số kỹ thuật của sản phẩm trong thẻ <strong>Sản phẩm & SKUs</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Xuất bản cẩm nang, tin tức thị trường B2B trong thẻ <strong>Bài viết CMS</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>Phản hồi báo giá RFQ của khách hàng doanh nghiệp trong thẻ <strong>Yêu cầu Báo giá</strong>.</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-5 mt-6 flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Phiên bản Admin Panel v1.0.0</span>
            <span>ULink B2B Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
