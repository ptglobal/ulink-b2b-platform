import { ArrowRight, Building2, CheckCircle, Factory } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import type { HomePageContent } from '@/lib/directus';
import { cn } from '@/lib/utils';

const audienceIcons = {
  building: Building2,
  factory: Factory
} as const;

export function TargetSegments({
  content,
  variant = 'default',
  sectionTitle,
  sectionSubtitle
}: {
  content: HomePageContent['audiences'];
  variant?: 'default' | 'industries';
  sectionTitle?: string;
  sectionSubtitle?: string;
}) {
  const isIndustries = variant === 'industries';

  return (
    <section className={cn('w-full', isIndustries ? 'bg-white' : 'bg-[#f7f8fc]')}>
      {isIndustries && sectionTitle ? (
        <div className="mx-auto w-[calc(100%_-_2rem)] max-w-[80rem] py-8 sm:w-[calc(100%_-_4rem)] sm:py-10">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex flex-col gap-1" aria-hidden="true">
              <i className="h-1.5 w-1.5 rounded-full bg-brand" />
              <i className="h-1.5 w-1.5 rounded-full bg-brand/55" />
              <i className="h-1.5 w-1.5 rounded-full bg-brand/25" />
            </span>
            <div>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
                {sectionTitle}
              </h2>
              {sectionSubtitle ? (
                <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
                  {sectionSubtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          isIndustries ? 'bg-[#f4f6fa] py-12 sm:py-14 lg:py-16' : 'py-14 sm:py-16 lg:py-20'
        )}
      >
        <div
          className={cn(
            'mx-auto w-full px-4 sm:px-8',
            isIndustries ? 'max-w-[84rem]' : 'max-w-[1240px]'
          )}
        >
          <header className="mx-auto max-w-[760px] text-center">
            <p
              className={cn(
                'font-semibold leading-tight text-brand',
                isIndustries
                  ? 'text-[11px] uppercase tracking-[0.08em]'
                  : 'text-[20px] sm:text-[24px] lg:text-[28px]'
              )}
            >
              {content.title}
            </p>
            <h2
              className={cn(
                'tracking-[-0.02em] text-[#162233]',
                isIndustries
                  ? 'mt-2 text-[24px] font-semibold leading-[1.2] sm:text-[28px]'
                  : 'mt-3 text-[26px] font-bold leading-[1.16] sm:text-[30px] lg:text-[34px]'
              )}
            >
              {content.subtitle}
            </h2>
          </header>

          <div
            className={cn(
              'grid lg:grid-cols-2',
              isIndustries ? 'mt-8 gap-5 lg:gap-6' : 'mt-9 gap-5 lg:mt-12 lg:gap-8'
            )}
          >
            {content.items.map((item) => {
              const Icon = audienceIcons[item.icon] ?? Factory;

              return (
                <article
                  key={item.title}
                  className={cn(
                    'flex flex-col overflow-hidden rounded-[3px] border border-[#d8e0f0] bg-white',
                    isIndustries ? 'min-h-[380px]' : 'min-h-[460px]'
                  )}
                >
                  <div
                    className={cn(
                      'bg-[#f7f8fc]',
                      isIndustries ? 'min-h-[148px] p-5 sm:p-6' : 'min-h-[184px] p-6 sm:p-8'
                    )}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center border border-[#d8e0f0] bg-white text-brand',
                        isIndustries
                          ? 'h-10 w-10 rounded-[3px]'
                          : 'h-14 w-14 rounded-[8px] sm:h-16 sm:w-16'
                      )}
                    >
                      <Icon
                        className={cn(isIndustries ? 'h-5 w-5' : 'h-7 w-7 sm:h-8 sm:w-8')}
                        aria-hidden="true"
                      />
                    </span>
                    <h3
                      className={cn(
                        'font-bold leading-tight text-[#162233]',
                        isIndustries ? 'mt-4 text-[17px]' : 'mt-5 text-[22px]'
                      )}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={cn(
                        'mt-2 max-w-[54ch] text-[#52627d]',
                        isIndustries ? 'text-[12px] leading-5' : 'text-[14px] leading-6'
                      )}
                    >
                      {item.description}
                    </p>
                  </div>

                  <div
                    className={cn(
                      'flex flex-1 flex-col border-t border-[#d8e0f0]',
                      isIndustries ? 'p-5 sm:p-6' : 'p-6 sm:p-8'
                    )}
                  >
                    <ul className={cn(isIndustries ? 'space-y-2.5' : 'space-y-4')}>
                      {item.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className={cn(
                            'flex items-start text-[#162233]',
                            isIndustries
                              ? 'gap-2.5 text-[12px] leading-5'
                              : 'gap-3 text-[15px] leading-6'
                          )}
                        >
                          <CheckCircle
                            className={cn(
                              'mt-0.5 shrink-0 text-brand',
                              isIndustries ? 'h-4 w-4' : 'h-5 w-5'
                            )}
                            aria-hidden="true"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={item.action.href}
                      className={cn(
                        'group inline-flex min-h-11 w-fit items-center font-semibold text-brand hover:text-brand-strong sm:mt-auto',
                        isIndustries
                          ? 'mt-5 gap-2 text-[12px] sm:pt-4'
                          : 'mt-8 gap-3 text-[14px] sm:pt-8'
                      )}
                    >
                      {item.action.label}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
