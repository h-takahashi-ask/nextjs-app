/**
 * Drizzle ORM クライアント（シングルトン）
 *
 * Prisma の client.ts と同じ理由で globalThis にキャッシュする:
 * Next.js 開発環境ではファイル変更のたびにモジュールが再評価され、
 * そのたびに新しい DB 接続が生成されてしまうのを防ぐ
 *
 * ドライバ: pg（node-postgres）
 *   postgres.js（旧ドライバ）は接続時の起動パラメータをサーバーが認識しない場合があるため pg に変更
 *   pg は @prisma/adapter-pg が使用している実績あるドライバで、同じ DB への接続が保証されている
 *
 * スキーマ: pgSchema('financial_dashboard') で完全修飾名を生成するため search_path の設定は不要
 *
 * 関連: src/lib/db/drizzle/schema.ts — テーブル定義
 * 関連: src/lib/db/prisma/client.ts  — Prisma クライアント（pg を使用）
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const createDrizzleClient = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = drizzle(pool, { schema })
  return client
}

const globalForDrizzle = globalThis as unknown as {
  drizzle: ReturnType<typeof createDrizzleClient> | undefined
}

export const drizzleClient = globalForDrizzle.drizzle ?? createDrizzleClient()

if (process.env.NODE_ENV !== 'production') globalForDrizzle.drizzle = drizzleClient
