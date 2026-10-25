import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerComponents } from "./swagger.components";
import { openapiGenerated } from "./openapi.generated";

/**
 * Swagger UI builds "Request URL" as: servers[].url + operation path.
 *
 * Production (Vercel): controller files are not available for filesystem
 * globs, so we ship paths from `openapi.generated.ts` (npm run swagger:generate).
 * Locally we can still rescan if you prefer — generated file is the source of truth.
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

function scanControllersFallback(): Record<string, unknown> | null {
  try {
    const root = process.cwd();
    const apis = [
      path.join(root, "src/modules/auth/controller/auth.controller.ts"),
      path.join(root, "src/modules/users/controller/users.controller.ts"),
      path.join(root, "src/modules/messages/controller/messages.controller.ts"),
      path
        .join(__dirname, "../../../modules/**/*.controller.*")
        .replace(/\\/g, "/"),
    ];

    const scanned = swaggerJsdoc({
      definition: {
        openapi: "3.0.3",
        info: { title: "Saraha API", version: "1.0.0" },
      },
      apis,
    }) as { paths?: Record<string, unknown> };

    if (scanned.paths && Object.keys(scanned.paths).length > 0) {
      return scanned.paths;
    }
  } catch {
    // Vercel / missing files — use generated paths
  }
  return null;
}

export function getSwaggerSpec(): object {
  const livePaths = scanControllersFallback();
  const paths =
    livePaths && Object.keys(livePaths).length > 0
      ? livePaths
      : (openapiGenerated.paths as Record<string, unknown>);

  return {
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
    paths,
  };
}
