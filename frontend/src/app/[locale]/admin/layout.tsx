import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);

  // Authenticate user server-side
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar navigation panel */}
      <AdminSidebar />

      {/* Main content viewport */}
      <main className="flex-1 md:pl-64 min-h-screen flex flex-col pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
