import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations precisam da conexão direta (sem pooler em modo transaction).
    url: process.env["DIRECT_URL"],
  },
});
