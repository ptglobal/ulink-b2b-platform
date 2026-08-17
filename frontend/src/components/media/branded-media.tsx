'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { ASSETS } from '@/lib/assets';
import { cn } from '@/lib/utils';

type BrandedMediaProps = {
  src?: ImageProps['src'] | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  compactBrand?: boolean;
  brandPresentation?: 'overlay' | 'rail';
};

export function BrandedMedia({
  src,
  alt,
  className,
  imageClassName,
  sizes = '100vw',
  priority = false,
  compactBrand = false,
  brandPresentation = 'overlay'
}: BrandedMediaProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showFallback = !src || failed;
  const usesBrandRail = brandPresentation === 'rail';

  return (
    <div
      className={cn('group relative isolate overflow-hidden bg-brand-deep', usesBrandRail && 'flex flex-col', className)}
      data-ulink-branded-media
      data-brand-presentation={brandPresentation}
    >
      <div className={cn('relative overflow-hidden bg-brand-deep', usesBrandRail ? 'min-h-0 flex-1' : 'absolute inset-0')}>
        {showFallback ? (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--brand-deep)),hsl(var(--brand)))]">
            <span className="sr-only">{alt}</span>
            <div className="absolute inset-0 opacity-20 [background-size:64px_64px] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]" />
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <Image
                src={ASSETS.logo.white}
                alt=""
                width={220}
                height={64}
                className="h-auto w-36 opacity-90 sm:w-44"
              />
            </div>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onError={() => setFailed(true)}
            className={cn('object-cover', imageClassName)}
          />
        )}
      </div>

      {usesBrandRail ? (
        <div className="pointer-events-none flex h-9 shrink-0 items-center justify-end border-t border-white/20 bg-brand px-3 sm:h-10" aria-hidden="true">
          <Image src={ASSETS.logo.white} alt="" width={108} height={30} className="h-5 w-auto" />
        </div>
      ) : (
        <div
          className={cn(
            'pointer-events-none absolute bottom-0 right-0 z-10 flex items-center bg-brand px-3 shadow-[0_-1px_0_hsl(var(--brand-foreground)/0.28)]',
            compactBrand ? 'h-9 sm:h-10' : 'h-11 sm:h-12'
          )}
          aria-hidden="true"
        >
          <Image
            src={compactBrand ? ASSETS.logo.mark : ASSETS.logo.white}
            alt=""
            width={compactBrand ? 32 : 108}
            height={compactBrand ? 32 : 30}
            className={cn(compactBrand ? 'h-5 w-5 brightness-0 invert' : 'h-6 w-auto')}
          />
        </div>
      )}
    </div>
  );
}
