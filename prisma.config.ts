import path from "node:path"
import { defineConfig } from "prisma/config"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db"

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
})
