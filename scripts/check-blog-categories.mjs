import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

const posts = await db.post.findMany({ select: { title: true, category: true, isPublished: true } })
posts.forEach(p => console.log(`[${p.isPublished ? "PUB" : "draft"}] ${p.category} — ${p.title}`))
console.log(`\nTotal: ${posts.length} posts`)
await db.$disconnect()
