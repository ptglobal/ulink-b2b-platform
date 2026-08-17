import { readFiles, readItems } from "@directus/sdk";
import {
  createDirectusClient,
  DIRECTUS_URL,
  loginAdmin,
} from "../lib/config.mjs";

const client = createDirectusClient();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  await loginAdmin(client);

  const [documents, certificates, caseStudies] = await Promise.all([
    client.request(
      readItems("documents", {
        filter: { status: { _eq: "published" } },
        fields: ["id", "title", "cover"],
        limit: -1,
      }),
    ),
    client.request(
      readItems("iso_certifications", {
        filter: { status: { _eq: "published" } },
        fields: ["id", "name", "cover"],
        limit: -1,
      }),
    ),
    client.request(
      readItems("case_studies", {
        filter: { status: { _eq: "published" } },
        fields: ["id", "title", "cover"],
        limit: -1,
      }),
    ),
  ]);

  const records = [...documents, ...certificates, ...caseStudies];
  const missing = records.filter((record) => !record.cover);
  assert(
    missing.length === 0,
    `Missing CMS covers: ${missing.map((record) => record.title || record.name || record.id).join(", ")}`,
  );

  const coverIds = records.map((record) => record.cover);
  assert(
    new Set(coverIds).size === coverIds.length,
    "Resource records reuse one or more CMS cover files.",
  );

  const files = await client.request(
    readFiles({
      filter: { id: { _in: coverIds } },
      fields: ["id", "filename_download", "type", "filesize"],
      limit: -1,
    }),
  );
  assert(
    files.length === coverIds.length,
    `Only ${files.length}/${coverIds.length} cover files exist in Directus.`,
  );

  for (const file of files) {
    assert(
      file.type?.startsWith("image/"),
      `${file.filename_download} is not an image.`,
    );
    assert(Number(file.filesize) > 0, `${file.filename_download} is empty.`);
  }

  const deliveryChecks = await Promise.all(
    coverIds.map(async (id) => {
      const response = await fetch(`${DIRECTUS_URL}/assets/${id}`);
      await response.body?.cancel();
      return {
        id,
        ok: response.ok,
        type: response.headers.get("content-type") || "",
      };
    }),
  );
  const unavailable = deliveryChecks.filter(
    (result) => !result.ok || !result.type.startsWith("image/"),
  );
  assert(
    unavailable.length === 0,
    `Directus cannot deliver cover assets: ${unavailable.map((result) => result.id).join(", ")}`,
  );

  console.log(
    `Resource media verification passed: ${records.length} published records, ${files.length} unique CMS images, all assets return image responses.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Resource media verification failed:", error);
    process.exit(1);
  });
