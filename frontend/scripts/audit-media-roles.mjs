import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = resolve(frontendRoot, '..');

const registry = [
  { role: 'homepage.hero.procurement-network', path: '/images/brand/ulink-procurement-hero-v2.webp' },
  { role: 'homepage.materials.catalog-system', path: '/images/brand/ulink-material-system-v2.webp' },
  { role: 'auth.login.secure-operations', path: '/images/brand/ulink-secure-portal-ops-v1.webp' },
  { role: 'regional-hubs.fulfillment-network', path: '/images/brand/ulink-regional-fulfillment-v2.webp' },
  { role: 'regional-hubs.hanam.overview', path: '/images/brand/ulink-hub-hanam-overview-royal-v1.webp' },
  { role: 'cms.news.semiconductor-particle-control', path: '/images/brand/ulink-news-semiconductor-particle-control-royal-v2.webp' },
  { role: 'cms.news.pe-film-quality-control', path: '/images/brand/ulink-news-pe-film-quality-control-royal-v2.webp' },
  { role: 'cms.news.esd-protection-audit', path: '/images/brand/ulink-news-esd-protection-audit-royal-v2.webp' },
  { role: 'about.hero.corporate-capability', path: '/images/brand/ulink-corporate-capability-v1.webp' },
  { role: 'solutions.hero.material-applications', path: '/images/brand/ulink-material-applications-v1.webp' },
  { role: 'quality.hero.esd-compliance-lab', path: '/images/brand/ulink-quality-lab-v1.webp' },
  { role: 'industry.overview.electronics', path: '/images/brand/ulink-industry-card-electronics-royal-v1.webp' },
  { role: 'industry.overview.pharmaceutical', path: '/images/brand/ulink-industry-card-pharma-royal-v1.webp' },
  { role: 'industry.overview.food', path: '/images/brand/ulink-industry-card-food-royal-v1.webp' },
  { role: 'industry.overview.logistics', path: '/images/brand/ulink-industry-card-logistics-royal-v1.webp' },
  { role: 'industry.overview.furniture', path: '/images/brand/ulink-industry-card-furniture-royal-v1.webp' },
  { role: 'industry.overview.hvac', path: '/images/brand/ulink-industry-card-hvac-royal-v1.webp' },
  { role: 'industry.detail.electronics', path: '/images/brand/ulink-industry-electronics-royal-v1.webp' },
  { role: 'industry.detail.pharmaceutical', path: '/images/brand/ulink-industry-pharma-royal-v1.webp' },
  { role: 'industry.detail.food', path: '/images/brand/ulink-industry-food-royal-v1.webp' },
  { role: 'industry.detail.logistics', path: '/images/brand/ulink-industry-logistics-royal-v1.webp' },
  { role: 'industry.detail.furniture', path: '/images/brand/ulink-industry-furniture-royal-v1.webp' },
  { role: 'industry.detail.hvac', path: '/images/brand/ulink-industry-hvac-royal-v1.webp' },
  { role: 'about.operations.wms-control', path: '/images/brand/ulink-operations-wms-royal-v1.webp' },
  { role: 'about.operations.inbound-quality', path: '/images/brand/ulink-operations-inbound-royal-v1.webp' },
  { role: 'about.operations.dispatch-control', path: '/images/brand/ulink-operations-dispatch-royal-v1.webp' },
  { role: 'about.operations.technical-team', path: '/images/brand/ulink-operations-team-royal-v1.webp' },
  { role: 'sustainability.hero.circular-supply', path: '/images/brand/ulink-sustainability-royal-v1.webp' },
  { role: 'careers.hero.technical-training', path: '/images/brand/ulink-careers-training-royal-v1.webp' },
  { role: 'careers.news.onboarding', path: '/images/brand/ulink-careers-news-onboarding-royal-v1.webp' },
  { role: 'careers.news.operations-engineer', path: '/images/brand/ulink-careers-news-engineer-royal-v1.webp' },
  { role: 'careers.news.supply-training', path: '/images/brand/ulink-careers-news-training-royal-v1.webp' },
  { role: 'careers.news.sports-day', path: '/images/brand/ulink-careers-news-sports-royal-v1.webp' },
  { role: 'careers.gallery.procurement-office', path: '/images/brand/ulink-careers-gallery-office-royal-v1.webp' },
  { role: 'careers.gallery.control-room', path: '/images/brand/ulink-careers-gallery-control-room-royal-v1.webp' },
  { role: 'careers.gallery.quality-lab', path: '/images/brand/ulink-careers-gallery-quality-lab-royal-v1.webp' },
  { role: 'careers.gallery.wms-operator', path: '/images/brand/ulink-careers-gallery-wms-royal-v1.webp' },
  { role: 'careers.gallery.packing-team', path: '/images/brand/ulink-careers-gallery-packing-royal-v1.webp' },
  { role: 'careers.gallery.regional-hub', path: '/images/brand/ulink-careers-gallery-hub-royal-v1.webp' },
  { role: 'product.nitrile-cleanroom-gloves', path: '/images/brand/ulink-product-nitrile-gloves-royal-v1.webp' },
  { role: 'product.polyester-cleanroom-wipers', path: '/images/brand/ulink-product-cleanroom-wipers-royal-v1.webp' },
  { role: 'product.tyvek-cleanroom-coverall', path: '/images/brand/ulink-product-tyvek-coverall-royal-v1.webp' },
  { role: 'product.cleanroom-face-mask', path: '/images/brand/ulink-product-cleanroom-mask-royal-v1.webp' },
  { role: 'product.esd-wrist-strap', path: '/images/brand/ulink-product-esd-wrist-strap-royal-v1.webp' },
  { role: 'product.esd-table-mat', path: '/images/brand/ulink-product-esd-table-mat-royal-v1.webp' },
  { role: 'product.ipa-cleanroom', path: '/images/brand/ulink-product-ipa-cleanroom-royal-v1.webp' },
  { role: 'product.sticky-mat', path: '/images/brand/ulink-product-sticky-mat-royal-v1.webp' },
  { role: 'product.esd-shielding-bag', path: '/images/brand/ulink-product-esd-shielding-bag-royal-v1.webp' },
  { role: 'product.sterile-latex-gloves', path: '/images/brand/ulink-product-sterile-latex-gloves-royal-v1.webp' }
];

function walk(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) walk(absolute, files);
    else files.push(absolute);
  }
  return files;
}

function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

assertUnique(registry.map((entry) => entry.role), 'media role');
assertUnique(registry.map((entry) => entry.path), 'media path');

const sourceRoots = [join(frontendRoot, 'src'), join(projectRoot, 'directus', 'seed')];
const sources = sourceRoots
  .flatMap((root) => walk(root))
  .filter((file) => ['.ts', '.tsx', '.js', '.mjs'].includes(extname(file)));

const registeredFiles = new Set(registry.map((entry) => entry.path.split('/').pop()));
const brandFiles = readdirSync(join(frontendRoot, 'public', 'images', 'brand'))
  .filter((file) => extname(file) === '.webp');
for (const file of brandFiles) {
  if (!registeredFiles.has(file)) throw new Error(`Brand media is not assigned to a unique role: ${file}`);
}
if (registeredFiles.size !== brandFiles.length) {
  throw new Error(`Media registry/file count mismatch: ${registeredFiles.size}/${brandFiles.length}`);
}

for (const entry of registry) {
  const asset = join(frontendRoot, 'public', ...entry.path.split('/').filter(Boolean));
  if (!existsSync(asset)) throw new Error(`Missing media asset for ${entry.role}: ${asset}`);

  const references = sources.filter((file) => readFileSync(file, 'utf8').includes(entry.path));
  if (!references.length) throw new Error(`${entry.role} has no UI or CMS assignment: ${entry.path}`);
}

console.log(`Media role audit passed: ${registry.length} unique roles, paths, branded files, and UI/CMS assignments.`);
