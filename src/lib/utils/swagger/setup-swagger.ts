import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { getSwaggerSpec } from "./swagger.config";

/**
 * Mount Swagger UI at /api-docs and raw OpenAPI JSON at /api-docs.json.
 * Spec is built here (after dotenv), so servers.url uses the real PORT.
 * Uses serveFiles so it works with Express 5 (swaggerUi.serve alone can 404).
 */
export function setupSwagger(app: Express): void {
  const swaggerSpec = getSwaggerSpec();

  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serveFiles(swaggerSpec),
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: "Saraha API Docs",
      swaggerOptions: {
        url: "/api-docs.json",
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        filter: true,
        defaultModelsExpandDepth: 1,
      },
    }),
  );
}
