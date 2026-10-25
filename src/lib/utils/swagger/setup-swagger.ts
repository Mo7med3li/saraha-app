import type { Express, Request, Response } from "express";
import { getSwaggerSpec } from "./swagger.config";

/**
 * Mount Swagger UI at /api-docs and raw OpenAPI JSON at /api-docs.json.
 *
 * On Vercel (serverless), swagger-ui-express static files break: requests for
 * swagger-ui-bundle.js return HTML (content-type text/html) → white page.
 * Serve the UI shell from a CDN and only host the OpenAPI JSON ourselves.
 */
function swaggerUiHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Saraha API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: "/api-docs.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        filter: true,
        defaultModelsExpandDepth: 1,
      });
    };
  </script>
</body>
</html>`;
}

export function setupSwagger(app: Express): void {
  const swaggerSpec = getSwaggerSpec();

  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  const sendUi = (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(swaggerUiHtml());
  };

  app.get("/api-docs", sendUi);
  app.get("/api-docs/", sendUi);
}
