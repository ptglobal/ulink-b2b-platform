import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SWAGGER_CDN = 'https://unpkg.com/swagger-ui-dist@5';

let customEndpoints = null;
try {
  const customPath = resolve(__dirname, '../openapi_custom_endpoints.json');
  customEndpoints = JSON.parse(readFileSync(customPath, 'utf-8'));
} catch {
  // File may not exist in all environments
}

function buildHtml(publicUrl) {
  const specUrl = `${publicUrl}/docs/spec`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>ULink API Docs</title>
  <link rel="icon" href="data:,"/>
  <link rel="stylesheet" href="${SWAGGER_CDN}/swagger-ui.css"/>
  <style>body{margin:0}.topbar{display:none}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${SWAGGER_CDN}/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '${specUrl}',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout'
    });
  </script>
</body>
</html>`;
}

export default {
  id: 'docs',
  handler(router, context) {
    router.get('/', (req, res) => {
      const publicUrl = context.env?.PUBLIC_URL || 'http://localhost:8055';
      // Relax CSP for THIS docs page only: Swagger UI is loaded from the unpkg
      // CDN plus an inline bootstrap <script>, both of which Directus's strict
      // default CSP (script-src 'self' 'unsafe-eval') blocks. The global CSP
      // still protects every other Directus/API route.
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
          "style-src 'self' 'unsafe-inline' https://unpkg.com",
          "img-src 'self' data: https:",
          "font-src 'self' data: https:",
          "connect-src 'self' https://* wss://*",
          "worker-src 'self' blob:"
        ].join('; ')
      );
      res.setHeader('Content-Type', 'text/html');
      res.send(buildHtml(publicUrl));
    });

    router.get('/spec', async (req, res) => {
      const publicUrl = context.env?.PUBLIC_URL || 'http://localhost:8055';
      try {
        const headers = {};
        if (req.headers.authorization) {
          headers['Authorization'] = req.headers.authorization;
        } else if (req.query.access_token) {
          headers['Authorization'] = `Bearer ${req.query.access_token}`;
        } else if (req.accountability?.admin) {
          // Already admin context
        } else {
          const adminEmail = context.env?.ADMIN_EMAIL;
          const adminPassword = context.env?.ADMIN_PASSWORD;
          if (adminEmail && adminPassword) {
            try {
              const loginRes = await fetch(`${publicUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: adminEmail, password: adminPassword })
              });
              if (loginRes.ok) {
                const { data } = await loginRes.json();
                headers['Authorization'] = `Bearer ${data.access_token}`;
              }
            } catch {}
          }
        }
        const oasResponse = await fetch(`${publicUrl}/server/specs/oas`, { headers });
        if (!oasResponse.ok) {
          res.status(502).json({ error: 'Failed to fetch Directus OpenAPI spec' });
          return;
        }
        const spec = await oasResponse.json();

        if (customEndpoints) {
          for (const [path, methods] of Object.entries(customEndpoints.paths)) {
            spec.paths[path] = methods;
          }
        }

        spec.components ??= {};
        spec.components.securitySchemes = {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            description: 'Login: POST /auth/login {email, password} -> access_token'
          }
        };
        spec.security = [{ BearerAuth: [] }];

        // Disable security for public authentication / server endpoints to avoid sending expired tokens in Swagger UI
        const publicEndpoints = [
          { path: '/auth/login', method: 'post' },
          { path: '/auth/refresh', method: 'post' },
          { path: '/auth/logout', method: 'post' },
          { path: '/auth/password/request', method: 'post' },
          { path: '/auth/password/reset', method: 'post' },
          { path: '/auth/oauth', method: 'get' },
          { path: '/auth/oauth/{provider}', method: 'get' },
          { path: '/server/ping', method: 'get' }
        ];

        for (const ep of publicEndpoints) {
          if (spec.paths[ep.path] && spec.paths[ep.path][ep.method]) {
            spec.paths[ep.path][ep.method].security = [];
          }
        }

        res.json(spec);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }
};
