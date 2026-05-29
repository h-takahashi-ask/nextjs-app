/**
 * Drizzle Kit 設定
 *
 * drizzle:generate  スキーマ変更からマイグレーション SQL を生成する
 * drizzle:migrate   マイグレーション SQL を DB に適用する
 * drizzle:push      マイグレーションファイルを作らず直接 DB に反映する（開発初期向け）
 * drizzle:studio    ブラウザで DB の内容を確認・編集できる GUI を起動する
 *
 * DATABASE_URL は .env.local に設定する（Prisma と同じ接続文字列を使いまわせる）
 */
import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// drizzle-kit は .env を自動ロードしないため手動で読み込む（prisma.config.ts と同様）
config()

export default defineConfig({
  schema: './src/lib/db/drizzle/schema.ts',
  out: './db/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
