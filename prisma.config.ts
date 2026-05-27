import { defineConfig, env } from '@prisma/config'
import { config } from 'dotenv'

// Prisma CLI は .env を自動ロードしないため手動で読み込む
config()

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
