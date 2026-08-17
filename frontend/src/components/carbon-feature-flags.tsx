'use client';

import { FeatureFlags } from '@carbon/react';

export function CarbonFeatureFlags({ children }: { children: React.ReactNode }) {
  return (
    <FeatureFlags enableFocusWrapWithoutSentinels enableV12DynamicFloatingStyles>
      {children}
    </FeatureFlags>
  );
}
