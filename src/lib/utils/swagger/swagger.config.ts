import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";

/** Controllers next to this file after compile: dist/modules/... */
const controllersGlob = path
  .join(__dirname, "../../../modules/**/*.controller.*")
  .replace(/\\/g, "/");

/** Also scan TypeScript sources when running from repo root in development */
const srcControllersGlob = path
  .join(process.cwd(), "src/modules/**/*.controller.ts")
  .replace(/\\/g, "/");

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sarahah API",
      version: "1.0.0",
      description: "API documentation for Sarahah application",
    },
    servers: [
      {
        url: process.env.API_URL || `http://localhost:${process.env.PORT}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [controllersGlob, srcControllersGlob],
};

export const swaggerSpec = swaggerJsdoc(options);
