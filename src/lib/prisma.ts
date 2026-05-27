import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL!, {
      schema: 'financial_dashboard',
    }),
  })

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
