/**
 * ULink Docs Endpoint
 *
 * Exposes a merged OpenAPI spec that includes:
 *   - Everything from Directus core (/server/specs/oas)
 *   - Custom extension endpoints (customer-onboarding/register, commercial-import/*, media-policy/*)
 *
 * Usage:
 *   GET /docs/openapi.json          → full merged OpenAPI (auth recommended for complete view)
 *   GET /docs                       → simple Swagger UI (uses the json above)
 *
 * The UI and spec respect the authenticated user's permissions for the core part.
 */

const CUSTOM_OPENAPI = {
  openapi: '3.0.3',
  info: {
    title: 'ULink B2B Platform API',
    description: 'Merged OpenAPI for Directus collections + custom business endpoints',
    version: '1.0.0'
  },
  tags: [
    { name: 'customer-onboarding', description: 'Self-registration and account linking' },
    { name: 'commercial-import', description: 'CSV bulk import for commerce data (Admin/Sales only)' },
    { name: 'media-policy', description: 'Media retention & governance actions (Admin/Editor/Sales)' }
  ],
  paths: {
    // === CUSTOMER ONBOARDING ===
    '/customer-onboarding/register': {
      post: {
        tags: ['customer-onboarding'],
        summary: 'Self-register a new Customer (creates user + inactive customer row)',
        description:
          'Public registration endpoint. Creates an active directus_users record (Customer role) ' +
          'and an inactive customers row. Sales later approves and activates via invite link or direct edit. ' +
          'The customer-onboarding-hook automatically links on creation when a pre-created customer row exists by email.',
        operationId: 'customerOnboardingRegister',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_name', 'contact_name', 'email', 'phone', 'password', 'confirm_password'],
                properties: {
                  company_name: { type: 'string', example: 'ACME Corp' },
                  contact_name: { type: 'string', example: 'Nguyen Van A' },
                  email: { type: 'string', format: 'email', example: 'a@acme.vn' },
                  phone: { type: 'string', example: '0987654321' },
                  password: { type: 'string', format: 'password', minLength: 8 },
                  confirm_password: { type: 'string', format: 'password' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Account created (user active, customer inactive)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        user_id: { type: 'string', format: 'uuid' },
                        customer_id: { type: 'integer' },
                        status: { type: 'string', example: 'inactive' }
                      }
                    }
                  }
                }
              }
            }
          },
          '409': { description: 'User or customer with this email already exists' },
          '422': { description: 'Validation error (missing fields, password mismatch, etc.)' },
          '500': { description: 'Internal error' }
        }
      }
    },

    // === COMMERCIAL IMPORT ===
    '/commercial-import/preview': {
      post: {
        tags: ['commercial-import'],
        summary: 'Preview CSV import (dry run)',
        description:
          'Admin or Sales only. Parses CSV and returns what would be created/updated without writing. ' +
          'Supports customers, orders, invoices, deliveries.',
        operationId: 'commercialImportPreview',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['collection', 'csvText'],
                properties: {
                  collection: { type: 'string', enum: ['customers', 'orders', 'invoices', 'deliveries'] },
                  csvText: { type: 'string', description: 'Raw CSV content' },
                  allowPartial: { type: 'boolean', default: false }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Preview result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        parsed: { type: 'integer' },
                        valid: { type: 'integer' },
                        errors: { type: 'array' },
                        previewRows: { type: 'array' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: 'Bad CSV or validation error' },
          '403': { description: 'Not allowed (Admin or Sales role required)' }
        }
      }
    },
    '/commercial-import/commit': {
      post: {
        tags: ['commercial-import'],
        summary: 'Commit CSV import (write data)',
        description: 'Admin or Sales only. Same payload as preview. Performs the actual inserts/updates.',
        operationId: 'commercialImportCommit',
        security: [{ bearerAuth: [] }],
        requestBody: {
          $ref: '#/components/requestBodies/CommercialImportBody'
        },
        responses: {
          '200': {
            description: 'Commit result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        created: { type: 'integer' },
                        updated: { type: 'integer' },
                        skipped: { type: 'integer' },
                        errors: { type: 'array' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: 'Bad request or partial failure (when allowPartial=false)' },
          '403': { description: 'Not allowed' }
        }
      }
    },

    // === MEDIA POLICY ===
    '/media-policy/soft-delete': {
      post: {
        tags: ['media-policy'],
        summary: 'Soft-delete a file (queues for purge after retention period)',
        description:
          'Admin, Editor or Sales. Moves the file into the retention queue. ' +
          'Actual hard deletion happens later via the media-cleanup job (default: after 7 days).',
        operationId: 'mediaPolicySoftDelete',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fileId'],
                properties: {
                  fileId: { type: 'string', description: 'Directus file UUID' },
                  reason: { type: 'string' },
                  source: { type: 'string', default: 'api-docs' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Soft delete recorded' },
          '400': { description: 'fileId is required' },
          '403': { description: 'Not allowed' },
          '500': { description: 'Error during soft delete' }
        }
      }
    },
    '/media-policy/hard-delete': {
      post: {
        tags: ['media-policy'],
        summary: 'Hard-delete a file immediately (Admin only)',
        description:
          'Admin only. Requires explicit confirmation to prevent accidents. ' +
          'Deletes the file record and the physical file on disk.',
        operationId: 'mediaPolicyHardDelete',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fileId', 'confirmHardDelete', 'confirmFileId'],
                properties: {
                  fileId: { type: 'string' },
                  reason: { type: 'string' },
                  source: { type: 'string', default: 'api-docs' },
                  confirmHardDelete: { type: 'boolean', description: 'Must be true' },
                  confirmFileId: { type: 'string', description: 'Must exactly match fileId' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'File permanently deleted' },
          '400': { description: 'Confirmation missing or mismatched' },
          '403': { description: 'Only admin can hard delete' },
          '500': { description: 'Error during hard delete' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Directus access token (JWT or static token)'
      }
    },
    requestBodies: {
      CommercialImportBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['collection', 'csvText'],
              properties: {
                collection: { type: 'string', enum: ['customers', 'orders', 'invoices', 'deliveries'] },
                csvText: { type: 'string' },
                allowPartial: { type: 'boolean', default: false }
              }
            }
          }
        }
      }
    }
  }
};

function mergeSpecs(coreSpec, customSpec) {
  const merged = JSON.parse(JSON.stringify(coreSpec || { openapi: '3.0.3', paths: {}, components: {} }));

  // Ensure basic structure
  merged.paths = merged.paths || {};
  merged.components = merged.components || {};
  merged.tags = merged.tags || [];

  // Merge tags (dedupe by name)
  const tagNames = new Set(merged.tags.map((t) => t.name));
  for (const tag of customSpec.tags || []) {
    if (!tagNames.has(tag.name)) {
      merged.tags.push(tag);
    }
  }

  // Merge paths (custom win on conflict)
  for (const [path, methods] of Object.entries(customSpec.paths || {})) {
    if (!merged.paths[path]) merged.paths[path] = {};
    Object.assign(merged.paths[path], methods);
  }

  // Merge components (shallow merge for securitySchemes + requestBodies)
  if (customSpec.components) {
    for (const [section, values] of Object.entries(customSpec.components)) {
      merged.components[section] = merged.components[section] || {};
      Object.assign(merged.components[section], values);
    }
  }

  // Ensure info
  if (!merged.info) merged.info = customSpec.info;

  return merged;
}

async function fetchCoreOas(context, req) {
  const publicUrl = process.env.DIRECTUS_PUBLIC_URL || process.env.PUBLIC_URL || 'http://localhost:8055';
  const authHeader = req.headers.authorization || req.headers.Authorization;

  try {
    const target = `${publicUrl.replace(/\/$/, '')}/server/specs/oas`;
    const headers = authHeader ? { Authorization: authHeader } : {};
    const response = await fetch(target, { headers });
    if (!response.ok) {
      return { openapi: '3.0.3', info: { title: 'Directus Core (partial - login for full)' }, paths: {}, components: {} };
    }
    return await response.json();
  } catch (err) {
    console.warn('[docs-endpoint] Failed to fetch core OAS:', err.message);
    return { openapi: '3.0.3', info: { title: 'Directus Core (unavailable - using custom only)' }, paths: {}, components: {} };
  }
}

function ensureCustomPaths(merged) {
  // Always guarantee our custom business endpoints (especially /customer-onboarding/register) are present
  const customPaths = CUSTOM_OPENAPI.paths || {};
  merged.paths = merged.paths || {};
  for (const [p, methods] of Object.entries(customPaths)) {
    merged.paths[p] = { ...(merged.paths[p] || {}), ...methods };
  }
  // Ensure tags
  merged.tags = merged.tags || [];
  const existingTagNames = new Set(merged.tags.map(t => t.name));
  for (const t of CUSTOM_OPENAPI.tags || []) {
    if (!existingTagNames.has(t.name)) merged.tags.push(t);
  }
  // Ensure components (security schemes etc.)
  merged.components = merged.components || {};
  if (CUSTOM_OPENAPI.components) {
    for (const [k, v] of Object.entries(CUSTOM_OPENAPI.components)) {
      merged.components[k] = { ...(merged.components[k] || {}), ...v };
    }
  }
  return merged;
}

export default {
  id: 'docs',
  handler(router, context) {
    // Raw merged JSON (good for Postman / export / curl + token for full core)
    router.get('/openapi.json', async (req, res) => {
      try {
        const core = await fetchCoreOas(context, req);
        let merged = mergeSpecs(core, CUSTOM_OPENAPI);
        merged = ensureCustomPaths(merged);
        if (!merged.servers || merged.servers.length === 0) {
          merged.servers = [{ url: process.env.DIRECTUS_PUBLIC_URL || 'http://localhost:8055', description: 'Local Directus' }];
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.json(merged);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to generate OpenAPI spec', message: error.message });
      }
    });

    // Self-contained Swagger UI with the spec **embedded** in the page.
    // This makes the custom endpoints (register etc.) always visible immediately,
    // without relying on a second browser fetch or prior login.
    router.get('/', async (req, res) => {
      try {
        const core = await fetchCoreOas(context, req);
        let merged = mergeSpecs(core, CUSTOM_OPENAPI);
        merged = ensureCustomPaths(merged);
        if (!merged.servers || merged.servers.length === 0) {
          merged.servers = [{ url: process.env.DIRECTUS_PUBLIC_URL || 'http://localhost:8055', description: 'Local Directus' }];
        }

        // Embed safely (escape < for inline script)
        const specJson = JSON.stringify(merged).replace(/</g, '\\u003c');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ULink API • Docs</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; padding:0; font-family: system-ui, -apple-system, sans-serif; }
    #swagger-ui { max-width: 1480px; margin: 0 auto; }
    .top-banner {
      background: #1a1a2e; color: #eee; padding: 12px 20px; font-size: 14px;
      border-bottom: 1px solid #333;
    }
    .top-banner a { color: #7ec8ff; }
    .top-banner strong { color: #fff; }
  </style>
</head>
<body>
  <div class="top-banner">
    <strong>ULink B2B API Docs</strong> — 
    Custom endpoints (<strong>customer-onboarding/register</strong>, commercial-import, media-policy) are <strong>always included</strong>.
    For the full list of collections (products, orders, rfq_requests, etc.) 
    <a href="http://localhost:8055" target="_blank">log into Directus Admin</a> first, then refresh this page 
    or click <strong>Authorize</strong> in the UI and paste your Bearer token.
  </div>

  <!-- Static quick reference for the exact custom endpoints you mentioned (register etc.) -->
  <!-- This is always visible so you don't have to dig in the big spec -->
  <div style="max-width:1480px; margin: 8px auto; padding: 0 20px; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.45">
    <h3 style="margin: 4px 0 8px; font-size: 15px;">Custom Endpoints (always here for testing)</h3>
    
    <div style="margin-bottom:10px; padding:8px 10px; background:#f8f9fa; border:1px solid #e0e0e0; border-radius:4px">
      <strong>POST /customer-onboarding/register</strong> <span style="color:#28a745">(public / no auth required)</span><br>
      <small>Self-register → creates active <code>directus_users</code> (Customer role) + inactive <code>customers</code> row.</small><br>
      Body required: <code>company_name, contact_name, email, phone, password, confirm_password</code>
    </div>

    <div style="margin-bottom:10px; padding:8px 10px; background:#f8f9fa; border:1px solid #e0e0e0; border-radius:4px">
      <strong>POST /commercial-import/preview</strong> + <strong>/commit</strong> <span style="color:#dc3545">(Admin or Sales only)</span><br>
      <small>CSV dry-run and real import for customers/orders/invoices/deliveries.</small><br>
      Body: <code>{ collection, csvText, allowPartial? }</code>
    </div>

    <div style="margin-bottom:10px; padding:8px 10px; background:#f8f9fa; border:1px solid #e0e0e0; border-radius:4px">
      <strong>POST /media-policy/soft-delete</strong> + <strong>/hard-delete</strong> <span style="color:#dc3545">(Admin/Editor/Sales)</span><br>
      <small>Retention queue + permanent delete with audit.</small>
    </div>

    <div style="font-size:12px; color:#555">
      → Use the filter box in the Swagger section below and type <strong>register</strong> or <strong>customer-onboarding</strong>.<br>
      → Or open the raw merged OpenAPI directly: <a href="/docs/openapi.json" target="_blank">/docs/openapi.json</a> (import this into Postman/Insomnia for one-click testing of the register endpoint).
    </div>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.__ULINK_API_SPEC = ${specJson};

    window.onload = () => {
      const ui = SwaggerUIBundle({
        spec: window.__ULINK_API_SPEC,
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: "StandaloneLayout",
        docExpansion: "list",
        filter: true,
        tryItOutEnabled: true,
        persistAuthorization: true,
        // Put our custom tags first in the list
        tagsSorter: (a, b) => {
          const prio = ['customer-onboarding', 'commercial-import', 'media-policy'];
          const ai = prio.indexOf(a);
          const bi = prio.indexOf(b);
          if (ai !== -1 || bi !== -1) {
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          }
          return a.localeCompare(b);
        }
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      } catch (error) {
        res.status(500).send('<h1>Error generating docs</h1><pre>' + (error?.message || error) + '</pre>');
      }
    });

    router.get('/index.html', (req, res) => res.redirect('/docs'));
  }
};
