import { ArrowRight } from '@/components/icons';
import { Link } from '@/i18n/navigation';

interface HubData {
  id: string;
  number: string;
  name: string;
  zonesStr: string;
  href: string;
}

interface HubClusterListProps {
  hubs: HubData[];
  tone?: 'light' | 'dark';
  emptyLabel?: string;
}

export default function HubClusterList({
  hubs,
  tone = 'light',
  emptyLabel = ''
}: HubClusterListProps) {
  const dark = tone === 'dark';

  return (
    <div className={dark ? 'space-y-2' : 'divide-y divide-border border-y border-border'}>
      {hubs.map((hub) => (
        <Link
          key={hub.id}
          href={hub.href}
          className={
            dark
              ? 'group flex min-h-16 min-w-0 items-center gap-3 border border-white/15 bg-white/[0.07] px-3 py-2 transition-colors hover:bg-white/[0.12]'
              : 'group flex min-h-16 min-w-0 items-center gap-4 py-2'
          }
        >
          <span
            className={
              dark
                ? 'flex h-11 w-11 shrink-0 items-center justify-center bg-white/10 font-mono text-xs font-semibold text-white transition-colors group-hover:bg-white group-hover:text-brand-deep'
                : 'flex h-11 w-11 shrink-0 items-center justify-center bg-muted font-mono text-xs font-medium text-brand transition-colors group-hover:bg-brand group-hover:text-white'
            }
          >
            {hub.number}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={
                dark
                  ? 'block truncate text-sm font-semibold text-white sm:text-[15px]'
                  : 'block truncate text-sm font-semibold text-foreground transition-colors group-hover:text-brand sm:text-[15px]'
              }
            >
              {hub.name}
            </span>
            {hub.zonesStr ? (
              <span
                className={
                  dark
                    ? 'mt-1 block truncate text-xs text-white/62'
                    : 'mt-1 block truncate text-xs text-muted-foreground'
                }
              >
                {hub.zonesStr}
              </span>
            ) : null}
          </span>
          <ArrowRight
            className={dark ? 'h-4 w-4 shrink-0 text-white/75' : 'h-4 w-4 shrink-0 text-brand'}
            aria-hidden="true"
          />
        </Link>
      ))}
      {hubs.length === 0 ? (
        <p
          className={
            dark
              ? 'py-8 text-center text-sm text-white/65'
              : 'py-8 text-center text-sm text-muted-foreground'
          }
        >
          {emptyLabel}
        </p>
      ) : null}
    </div>
  );
}
