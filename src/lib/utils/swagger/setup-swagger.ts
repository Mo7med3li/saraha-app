import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.config";

/**
 * Mount Swagger UI at /api-docs and raw OpenAPI JSON at /api-docs.json.
 * Uses serveFiles so it works with Express 5 (swaggerUi.serve alone can 404).
 */
export function setupSwagger(app: Express): void {
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serveFiles(swaggerSpec),
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: "Sarahah API Docs",
      swaggerOptions: {
        url: "/api-docs.json",
        persistAuthorization: true,
      },
    }),
  );
}
