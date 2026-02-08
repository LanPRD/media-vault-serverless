import { config } from "dotenv";
import path from "node:path";
import { z } from "zod";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

config({ path: path.resolve(process.cwd(), envFile) });

const envSchema = z.object({
  AWS_REGION: z.string().default("sa-east-1"),
  MEDIA_TABLE_NAME: z.string(),
  MEDIA_BUCKET_NAME: z.string(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(z.treeifyError(parsed.error));
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
