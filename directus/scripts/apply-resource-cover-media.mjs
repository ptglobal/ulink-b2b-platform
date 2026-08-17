import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFiles, readItems, updateItem, uploadFiles } from "@directus/sdk";
import { createDirectusClient, loginAdmin } from "../lib/config.mjs";
import { createEnsureHelpers } from "../lib/ensure-helpers.mjs";

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const frontendPublic = join(scriptDirectory, "../../frontend/public");

const documentCovers = [
  [
    9,
    "/images/illustrations/cleanroom-gloves.png",
    "Nitrile gloves technical data",
  ],
  [
    10,
    "/images/solutions/nitrile_gloves.png",
    "Nitrile gloves material safety",
  ],
  [
    11,
    "/images/brand/ulink-product-cleanroom-wipers-royal-v1.webp",
    "Polyester cleanroom wipers",
  ],
  [
    12,
    "/images/brand/ulink-material-applications-v1.webp",
    "Cleanroom wipers application guide",
  ],
  [
    13,
    "/images/industries/cleanroom_suit.webp",
    "Tyvek cleanroom coverall technical data",
  ],
  [
    14,
    "/images/brand/ulink-product-tyvek-coverall-royal-v1.webp",
    "Tyvek coverall material safety",
  ],
  [
    15,
    "/images/brand/ulink-product-cleanroom-mask-royal-v1.webp",
    "Cleanroom mask specification",
  ],
  [
    16,
    "/images/brand/ulink-product-esd-wrist-strap-royal-v1.webp",
    "ESD wrist strap technical guide",
  ],
  [
    17,
    "/images/brand/ulink-product-esd-table-mat-royal-v1.webp",
    "ESD table mat technical data",
  ],
  [18, "/images/about/iso-esd.webp", "ESD mat certificate of conformance"],
  [
    19,
    "/images/brand/ulink-product-ipa-cleanroom-royal-v1.webp",
    "IPA cleanroom safety data",
  ],
  [20, "/images/about/quality-lab.webp", "IPA cleanroom technical data"],
  [
    21,
    "/images/brand/ulink-quality-lab-v1.webp",
    "IPA cleanroom application brochure",
  ],
  [
    22,
    "/images/brand/ulink-product-sticky-mat-royal-v1.webp",
    "Sticky mat cleanroom brochure",
  ],
  [
    23,
    "/images/brand/ulink-product-esd-shielding-bag-royal-v1.webp",
    "ESD shielding bag technical data",
  ],
  [
    24,
    "/images/industries/case_packaging.webp",
    "ESD packaging compliance certificate",
  ],
  [
    25,
    "/images/brand/ulink-product-sterile-latex-gloves-royal-v1.webp",
    "Sterile latex gloves technical data",
  ],
  [
    26,
    "/images/brand/ulink-industry-pharma-royal-v1.webp",
    "Sterile latex gloves material safety",
  ],
  [
    27,
    "/images/about/quality-hero-bg.webp",
    "Latex gloves sterility certificate",
  ],
];

const singletonCovers = [
  [
    "iso_certifications",
    2,
    "/images/home/section5/mc-iso-9001-2015.webp",
    "ISO 9001 quality management certificate",
  ],
  [
    "case_studies",
    1,
    "/images/industries/case_cleanroom.webp",
    "Samsung cleanroom wiper case study",
  ],
];

const coverField = {
  field: "cover",
  type: "uuid",
  meta: {
    interface: "file-image",
    special: ["file"],
    note: "Figma-aligned cover image displayed in the public resource catalogue and detail page.",
    options: { sources: ["library"] },
  },
};

const client = createDirectusClient();
const helpers = createEnsureHelpers(client);

function mimeType(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  return "image/webp";
}

function uploadFilename(collection, id, publicPath) {
  return `ulink-cms-${collection}-${id}-cover${extname(publicPath).toLowerCase()}`;
}

async function ensureCoverSchema() {
  for (const collection of ["documents", "iso_certifications"]) {
    await helpers.ensureCollection({
      collection,
      meta: {},
      schema: {},
      fields: [coverField],
    });
    await helpers.ensureRelation({
      collection,
      field: "cover",
      related_collection: "directus_files",
      schema: { on_delete: "SET NULL" },
    });
  }
}

async function ensureCmsFile(collection, id, publicPath, title) {
  const filename = uploadFilename(collection, id, publicPath);
  const existing = await client.request(
    readFiles({
      filter: { filename_download: { _eq: filename } },
      fields: ["id"],
      limit: 1,
    }),
  );
  if (existing.length) return existing[0].id;

  const bytes = await readFile(
    join(frontendPublic, publicPath.replace(/^\//, "")),
  );
  const form = new FormData();
  form.append("title", title);
  form.append("description", `ULink Industries CMS cover · ${title}`);
  form.append(
    "file",
    new Blob([bytes], { type: mimeType(publicPath) }),
    filename,
  );
  const uploaded = await client.request(uploadFiles(form));
  return uploaded.id;
}

async function assignCover(collection, id, publicPath, title) {
  const records = await client.request(
    readItems(collection, {
      filter: { id: { _eq: id } },
      fields: ["id"],
      limit: 1,
    }),
  );
  if (!records.length) throw new Error(`${collection} record not found: ${id}`);

  const fileId = await ensureCmsFile(collection, id, publicPath, title);
  await client.request(updateItem(collection, id, { cover: fileId }));
  console.log(
    `Linked ${collection}.${id} -> ${uploadFilename(collection, id, publicPath)}`,
  );
  return fileId;
}

async function main() {
  await loginAdmin(client);
  await ensureCoverSchema();

  const assignedFiles = [];
  for (const [id, publicPath, title] of documentCovers) {
    assignedFiles.push(await assignCover("documents", id, publicPath, title));
  }
  for (const [collection, id, publicPath, title] of singletonCovers) {
    assignedFiles.push(await assignCover(collection, id, publicPath, title));
  }

  if (new Set(assignedFiles).size !== assignedFiles.length) {
    throw new Error("Resource cover assignment contains duplicated CMS files.");
  }

  console.log(
    `Resource media completed: ${assignedFiles.length} unique CMS covers assigned.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Resource cover media import failed:", error);
    process.exit(1);
  });
