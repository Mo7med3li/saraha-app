/**
 * Shared OpenAPI 3 components used by swagger-jsdoc `$ref`s in controllers.
 * Keep these aligned with `successResponse` / `globalErrorHandler` / Joi middleware.
 *
 * Auth note:
 * - Users:  Authorization: Bearer <accessToken>   → USER_JWT_SECRET
 * - Admins: Authorization: System <accessToken>   → SYSTEM_JWT_SECRET
 * Swagger's http "bearer" scheme can ONLY send "Bearer …".
 * Admin auth must be an apiKey so you paste the full "System <token>" value.
 */
export const swaggerComponents = {
  securitySchemes: {
    bearerAuth: {
      type: "http" as const,
      scheme: "bearer",
      bearerFormat: "JWT",
      description:
        "Regular **user** access token only. Paste the raw JWT (Swagger adds `Bearer`). Admin tokens will fail with invalid signature here.",
    },
    systemAuth: {
      type: "apiKey" as const,
      in: "header" as const,
      name: "Authorization",
      description:
        "Admin access token. Paste the **full** header value, including the prefix:\n\n`System eyJhbGciOi…`\n\nDo not use Bearer for admin tokens.",
    },
  },
  schemas: {
    SuccessResponse: {
      type: "object",
      required: ["success", "message"],
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Success" },
        data: {
          description: "Endpoint-specific payload (optional)",
          nullable: true,
        },
      },
    },
    AppErrorResponse: {
      type: "object",
      required: ["success", "message"],
      properties: {
        success: { type: "boolean", example: false },
        message: { type: "string", example: "Unauthorized" },
        stack: {
          type: "string",
          description: "Present only when MODE=Dev",
        },
      },
    },
    ValidationIssue: {
      type: "object",
      properties: {
        keys: {
          type: "string",
          example: "body",
          description: "Validated request part (body, params, headers, …)",
        },
        message: {
          type: "string",
          example: '"email" must be a valid email',
        },
      },
    },
    ValidationErrorResponse: {
      type: "object",
      required: ["error", "message"],
      properties: {
        error: { type: "string", example: "validation error" },
        message: {
          type: "array",
          items: { $ref: "#/components/schemas/ValidationIssue" },
        },
      },
    },
    AuthTokens: {
      type: "object",
      properties: {
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
      },
    },
    LoginSuccessResponse: {
      allOf: [
        { $ref: "#/components/schemas/SuccessResponse" },
        {
          type: "object",
          properties: {
            data: { $ref: "#/components/schemas/AuthTokens" },
          },
        },
      ],
    },
  },
  responses: {
    ValidationError: {
      description: "Joi validation failed",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
        },
      },
    },
    Unauthorized: {
      description: "Missing or invalid token",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/AppErrorResponse" },
        },
      },
    },
    NotFound: {
      description: "Resource not found",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/AppErrorResponse" },
        },
      },
    },
  },
};
