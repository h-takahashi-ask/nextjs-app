/**
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【概要】データベース接続とORMの動作確認用のAPIルートハンドラ
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【概要】金額が666の請求書データを顧客名付きで取得してJSON形式で返す
 *
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【概要】GET : 請求書一覧取得 (GET /api/query)
 *
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【関連】src/lib/db/prisma/client.ts  : Prisma クライアント（コメントアウト中）
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【関連】src/lib/db/drizzle/index.ts  : Drizzle クライアント
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【関連】src/lib/db/drizzle/schema.ts : Drizzle スキーマ定義
 */
import { prismaClient } from '@/lib/db/prisma/client';
import { drizzleClient } from '@/lib/db/drizzle/client' 
import { customers, invoices } from '@/lib/db/drizzle/schema'
import { eq } from 'drizzle-orm'

/**
 * 金額が666の請求書を顧客名付きで取得する
 *
 * @returns 金額と顧客名を含む請求書の配列
 *
 * @remarks
 * amount = 666 で固定しているのは初期シードデータの確認用サンプルであり、実際の検索条件ではない
 *
 * Prisma 版との比較:
 *   Prisma  — findMany({ where, select }) でリレーションを select 内にネストして結合
 *   Drizzle — select().from().innerJoin().where() と SQL に近い構造で記述
 *   どちらも同じ SQL（JOIN + WHERE）を生成し、結果の型は同じ構造になる
 */
async function listInvoices() {
  // ── Prisma 版（参照用） ──────────────────────────────────────────────────
  // const result = await prismaClient.invoice.findMany({
  //   where: { amount: 666 },
  //   select: {
  //     amount: true,
  //     customer: { select: { name: true } },
  //   },
  // });
  // return result;

  // ── Drizzle 版 ──────────────────────────────────────────────────────────
  // SQL: SELECT invoices.amount, customers.name
  //      FROM financial_dashboard.invoices
  //      INNER JOIN financial_dashboard.customers
  //        ON invoices.customer_id = customers.id
  //      WHERE invoices.amount = 666
  const result = await drizzleClient
    .select({
      amount: invoices.amount,
      customer: { name: customers.name },
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.amount, 666))
  return result
}

/**
 * /api/queryへのGETリクエストを処理するAPIエントリポイント
 *
 * @returns 請求書一覧のJSONレスポンス
 *
 * @remarks
 * `GET`という名前でexportするとNext.jsがHTTP GETリクエストをこの関数に自動で対応付ける
 * データ取得に失敗した場合はHTTPステータス500でエラー内容をJSONとして返す
 */
export async function GET() {
  try {
    const invoices = await listInvoices();
    const response = Response.json(invoices);
    return response;
  } catch (error) {
    const errorResponse = Response.json({ error }, { status: 500 });
    return errorResponse;
  }
}
