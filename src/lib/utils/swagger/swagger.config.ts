import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerComponents } from "./swagger.components";

/** Controllers next to this file after compile: dist/modules/... */
const controllersGlob = path
  .join(__dirname, "../../../modules/**/*.controller.*")
  .replace(/\\/g, "/");

/** Also scan TypeScript sources when running from repo root in development */
const srcControllersGlob = path
  .join(process.cwd(), "src/modules/**/*.controller.ts")
  .replace(/\\/g, "/");

/**
 * Swagger UI builds "Request URL" as: servers[].url + operation path.
 *
 * IMPORTANT: call this AFTER dotenv loads. If we read PORT at module import
 * time (before config/.env), PORT is missing and we fall back to 5000 while
 * the app later listens on 3000 — that mismatch is what you saw.
 */
function buildServers(): { url: string; description: string }[] {
  const port = process.env.PORT || "5000";
  const isProduction = process.env.MODE === "Production";

  const servers: { url: string; description: string }[] = [
    {
      url: "/",
      description: "Same origin as this docs page (recommended)",
    },
  ];

  const configured =
    process.env.SWAGGER_SERVER_URL?.trim() || process.env.API_URL?.trim();
  if (configured) {
    servers.push({
      url: configured.replace(/\/$/, ""),
      description: "Configured API URL",
    });
  }

  if (!isProduction) {
    servers.push({
      url: `http://localhost:${port}`,
      description: `Local (PORT=${port})`,
    });
  }

  return servers;
}

export function getSwaggerSpec(): object {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.3",
      info: {
        title: "Saraha API",
        version: "1.0.0",
        description:
          "Anonymous messaging API.\n\n**Auth**\n- User: Authorize → bearerAuth → paste JWT only (Swagger adds `Bearer`)\n- Admin: Authorize → systemAuth → paste `System <accessToken>` (full value, including the word System)\n\nAdmin tokens use a different secret; putting them in bearerAuth causes **invalid signature**.",
        contact: { name: "Saraha" },
      },
      servers: buildServers(),
      tags: [
        { name: "Authentication", description: "Signup, login, OTP, Google" },
        { name: "Users", description: "Profile, password, uploads, logout" },
        {
          name: "Messages",
          description: "Anonymous and authenticated messages",
        },
      ],
      components: swaggerComponents,
      // No global security — auth endpoints are public.
      // Protected routes declare `security: [{ bearerAuth: [] }]` in JSDoc.
    },
    apis: [controllersGlob, srcControllersGlob],
  };

  return swaggerJsdoc(options);
}
