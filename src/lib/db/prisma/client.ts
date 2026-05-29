/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【Prismaクライアント】【概要】データベース操作に使うPrismaクライアントのシングルトンインスタンスを提供するモジュール
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【Prismaクライアント】【概要】開発環境ではホットリロードのたびに接続が増えないよう、グローバル変数にインスタンスをキャッシュして再利用する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【Prismaクライアント】【関連】src/app/api/query/route.ts : prismaを使用するAPIルート
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL!, {
      // デフォルトのpublicスキーマではなく本プロジェクト専用のスキーマを使うため明示する
      schema: 'financial_dashboard',
    }),
  })

// Next.jsの開発環境ではファイル変更のたびにモジュールが再評価される
// 再評価のたびにPrismaインスタンスが新規生成されると不要な接続が増え続けてしまう
// globalThisに保持することで再評価後も同じインスタンスを使い回し、接続数の増加を防ぐ
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prismaClient = globalForPrisma.prisma ?? createPrismaClient()

// 本番環境ではサーバープロセスが使い回されるため、グローバルへのキャッシュは開発環境のみ行う
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
