/// <reference types="node" />
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const serverDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(serverDir, ".env") });
dotenv.config({ path: path.join(serverDir, "..", ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
