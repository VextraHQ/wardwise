import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
