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

        res.json(spec);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }
};
