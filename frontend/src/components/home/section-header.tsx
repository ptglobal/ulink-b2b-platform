import { ArrowRight } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { SectionHeading } from '@/components/ui/section-heading';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function SectionHeader({ title, subtitle, viewAllHref, viewAllLabel }: SectionHeaderProps) {
  return (
    <SectionHeading
      title={title}
      description={subtitle}
      action={
        viewAllHref && viewAllLabel ? (
        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-brand hover:text-brand-strong"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
        ) : null
      }
    />
  );
}
