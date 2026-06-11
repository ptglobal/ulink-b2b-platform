import type { SVGProps } from 'react';

/**
 * Headset với mic có đầu tròn (kiểu nút lọc âm) — không có sẵn trong lucide/Tabler.
 * Vẽ theo style nét lucide: viewBox 24, stroke currentColor, linecap/linejoin round.
 * Nhận strokeWidth & className như các icon lucide để dùng thay thế trực tiếp.
 */
export function HeadsetMic({
  strokeWidth = 2,
  ...props
}: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Vòng cung headband nối 2 loa tai */}
      <path d="M5 13v-2a7 7 0 0 1 14 0v2" />
      {/* Loa tai trái */}
      <rect x="2" y="13" width="4" height="6" rx="1.5" />
      {/* Loa tai phải */}
      <rect x="18" y="13" width="4" height="6" rx="1.5" />
      {/* Cần mic cong từ loa trái xuống giữa */}
      <path d="M4 19v1a2 2 0 0 0 2 2h3.5" />
      {/* Đầu mic tròn (nút lọc âm) */}
      <circle cx="11.5" cy="22" r="1.5" />
    </svg>
  );
}
