import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

function createPrismaClient() {
  const url   = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN

  if (url && token) {
    const libsql  = createClient({ url, authToken: token })
    const adapter = new PrismaLibSql(libsql as any)
    return new PrismaClient({ adapter, log: [] })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
