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
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 text-white md:hidden shadow-md hover:bg-slate-800 transition-colors"
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
          "fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F1E36] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-800",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header Branding */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white tracking-wider text-base shadow-inner">
              U
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white">
                ULink Industries
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                Control Panel
              </span>
            </div>
          </div>
          <Link
            href="/"
            title="Quay lại trang chủ website"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-bold text-blue-400 bg-blue-950/40 hover:bg-blue-900/60 hover:text-white border border-blue-800/40 transition-all mb-4"
          >
            <Home className="h-4 w-4 text-blue-400" />
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
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-105 duration-200",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-3 px-2 py-1 mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 shrink-0">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-200 truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold truncate capitalize mt-0.5">
                {user?.role ? 'Administrator' : 'Sales Representative'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-red-700 hover:text-white text-slate-300 transition-colors shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
