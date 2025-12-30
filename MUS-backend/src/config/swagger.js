import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "MUS API",
    version: "1.0.0",
    description: "Authentication endpoints backed by PostgreSQL routines.",
  },
  servers: [{ url: "http://localhost:5000/api" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "auth_token",
      },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
