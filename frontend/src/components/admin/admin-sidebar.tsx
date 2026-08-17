'use client';

import { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Package,
  FileText,
  FileSpreadsheet,
  FileCheck,
  Users,
  LogOut,
  Menu,
  X,
  User,
  Layers,
  FolderTree,
  Sliders,
  MapPin,
  Mail,
  Home,
  Upload
} from '@/components/icons';
import { cn } from '@/lib/utils';

const menuGroups = [
  {
    label: 'Vận hành',
    items: [
      { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
      { href: '/admin/rfqs', label: 'Yêu cầu báo giá', icon: FileSpreadsheet },
      { href: '/admin/sample-requests', label: 'Yêu cầu hàng mẫu', icon: FileCheck },
      { href: '/admin/contact-requests', label: 'Liên hệ gửi về', icon: Mail }
    ]
  },
  {
    label: 'Danh mục',
    items: [
      { href: '/admin/products', label: 'Sản phẩm', icon: Package },
      { href: '/admin/skus', label: 'Mã SKU', icon: Layers },
      { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
      { href: '/admin/attributes', label: 'Thuộc tính', icon: Sliders },
      { href: '/admin/import', label: 'Nhập dữ liệu', icon: Upload }
    ]
  },
  {
    label: 'Nội dung & hệ thống',
    items: [
      { href: '/admin/articles', label: 'Bài viết', icon: FileText },
      { href: '/admin/hubs', label: 'Trung tâm vùng', icon: MapPin },
      { href: '/admin/users', label: 'Tài khoản', icon: Users }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Đóng điều hướng quản trị' : 'Mở điều hướng quản trị'}
        aria-expanded={isOpen}
        className="fixed left-0 top-0 z-50 flex h-12 w-12 items-center justify-center bg-[#4169e1] text-white md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      {isOpen ? <button className="fixed inset-0 z-40 bg-foreground/30 md:hidden" aria-label="Đóng điều hướng quản trị" onClick={() => setIsOpen(false)} /> : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-[#dfe5ef] bg-white text-[#172540] transition-transform duration-200 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#dfe5ef] px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">ULink Industries</span>
              <span className="mt-0.5 block font-mono text-[9px] text-[#68758c]">VMI CONTROL</span>
            </span>
          </div>
          <Link href="/" title="Về website" className="flex h-11 w-11 shrink-0 items-center justify-center text-[#536079] hover:bg-[#edf2ff] hover:text-[#3156c9]">
            <Home className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4" aria-label="Điều hướng quản trị">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.label} className={cn(groupIndex > 0 && 'mt-6')}>
              <p className="mb-2 px-4 font-mono text-[10px] uppercase tracking-[.08em] text-[#8a95a8]">{group.label}</p>
              <div className="grid gap-0.5">
                {group.items.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex min-h-10 items-center gap-3 px-4 text-[13px] font-medium text-[#536079] hover:bg-[#edf2ff] hover:text-[#172540]',
                        isActive && 'bg-[#4169e1] text-white shadow-none'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-[#77839a]')} aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#dfe5ef] p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#edf2ff] text-[#4169e1]">
              <User className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}</span>
              <span className="mt-0.5 block truncate font-mono text-[9px] text-[#8d8d8d]">ADMINISTRATOR</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-1 flex h-10 w-full items-center gap-3 px-2.5 text-left text-xs font-medium text-[#536079] hover:bg-[#edf2ff] hover:text-[#172540]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
