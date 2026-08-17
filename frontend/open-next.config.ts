import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

export default defineCloudflareConfig({
  // The public website is prerendered from Directus during deployment. Keeping
  // that cache in Worker assets avoids runtime failures when the public CMS
  // role intentionally cannot read presentation-only fields.
  incrementalCache: staticAssetsIncrementalCache
});
