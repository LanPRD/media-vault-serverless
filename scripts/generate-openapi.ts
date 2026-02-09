import * as fs from "node:fs";
import * as path from "node:path";
import { generateOpenApiDocument } from "../src/infra/http/docs/openapi";

const document = generateOpenApiDocument();
const outputPath = path.resolve(__dirname, "../docs/openapi.json");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

console.log(`OpenAPI document generated at: ${outputPath}`);
