'use client';

import React, { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Package,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Users,
  BarChart3,
  Upload,
  LogOut,
  Menu,
  X,
  User,
  Layers,
  FolderTree,
  Sliders,
  MapPin,
  Mail,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      href: '/admin',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      exact: true
    },
    {
      href: '/admin/products',
      label: 'Sản phẩm',
      icon: Package
    },
    {
      href: '/admin/categories',
      label: 'Danh mục',
      icon: FolderTree
    },
    {
      href: '/admin/attributes',
      label: 'Thuộc tính',
      icon: Sliders
    },
    {
      href: '/admin/skus',
      label: 'Mã SKUs',
      icon: Layers
    },
    {
      href: '/admin/articles',
      label: 'Bài viết CMS',
      icon: FileText
    },
    {
      href: '/admin/rfqs',
      label: 'Yêu cầu Báo giá',
      icon: FileSpreadsheet
    },
    {
      href: '/admin/sample-requests',
      label: 'Hàng mẫu thử',
      icon: FileCheck
    },
    {
      href: '/admin/users',
      label: 'Tài khoản User',
      icon: Users
    },
    {
      href: '/admin/hubs',
      label: 'Chi nhánh / Hubs',
      icon: MapPin
    },
    {
      href: '/admin/subscribers',
      label: 'Đăng ký bản tin',
      icon: Mail
    },
    {
      href: '/admin/contact-requests',
      label: 'Liên hệ gửi về',
      icon: Mail
    }
  ];

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
      await logout();
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-sky-600 text-white md:hidden shadow-md hover:bg-sky-700 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-sky-50 via-white to-sky-50 text-slate-900 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-sky-100 shadow-[0_20px_60px_rgba(56,189,248,0.08)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header Branding */}
        <div className="p-6 border-b border-sky-100 flex items-center justify-between bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-black text-white tracking-wider text-base shadow-inner shadow-sky-300/40">
              U
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                ULink Industries
              </span>
              <span className="text-[10px] text-sky-500 font-semibold uppercase tracking-widest mt-0.5">
                Control Panel
              </span>
            </div>
          </div>
          <Link
            href="/"
            title="Quay lại trang chủ website"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 hover:bg-sky-600 hover:text-white transition-colors border border-sky-200"
          >
            <Home className="h-4 w-4" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 hover:text-sky-900 border border-sky-200 transition-all mb-4"
          >
            <Home className="h-4 w-4 text-sky-600" />
            <span>Về Trang chủ Website</span>
          </Link>

          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-bold transition-all group",
                  isActive
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-300/40"
                    : "text-slate-600 hover:text-slate-900 hover:bg-sky-100/80"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-105 duration-200",
                    isActive ? "text-white" : "text-sky-500 group-hover:text-sky-700"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Profile & Logout */}
        <div className="p-4 border-t border-sky-100 bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-2 py-1 mb-4">
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 border border-sky-200 shrink-0">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold truncate capitalize mt-0.5">
                {user?.role ? 'Administrator' : 'Sales Representative'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-xs font-bold bg-sky-100 hover:bg-red-600 hover:text-white text-sky-700 border border-sky-200 transition-colors shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
