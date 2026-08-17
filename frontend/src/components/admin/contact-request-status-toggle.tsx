'use client';

import { useTransition } from 'react';
import { Loader2 } from '@/components/icons';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { updateContactRequestStatus } from '@/app/[locale]/admin/contact-requests/actions';

interface ContactRequestStatusToggleProps {
  id: number;
  currentStatus: 'unread' | 'read';
}

export function ContactRequestStatusToggle({ id, currentStatus }: ContactRequestStatusToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextStatus = currentStatus === 'read' ? 'unread' : 'read';
  const label = currentStatus === 'read' ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc';

  const handleToggle = () => {
    startTransition(async () => {
      const result = await updateContactRequestStatus(id, nextStatus);
      if (result.success) {
        toast.success(nextStatus === 'read' ? 'Đã đánh dấu đã đọc.' : 'Đã đánh dấu chưa đọc.');
        router.refresh();
      } else {
        toast.error(result.error || 'Đã xảy ra lỗi khi cập nhật trạng thái.');
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {label}
    </button>
  );
}
