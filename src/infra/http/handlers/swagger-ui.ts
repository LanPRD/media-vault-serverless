import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { generateOpenApiDocument } from "../docs";

const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Media Vault API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: './docs/openapi.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: 'BaseLayout',
        deepLinking: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1
      });
    };
  </script>
</body>
</html>
`;

export async function handlerUI(_event: APIGatewayProxyEventV2) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    },
    body: swaggerHtml
  };
}

export async function handlerSpec(_event: APIGatewayProxyEventV2) {
  const document = generateOpenApiDocument();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(document)
  };
}
