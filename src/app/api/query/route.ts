/**
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【概要】データベース接続とPrismaの動作確認用のAPIルートハンドラ
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【概要】金額が666の請求書データを顧客名付きで取得してJSON形式で返す
 *
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【概要】GET : 請求書一覧取得 (GET /api/query)
 *
 * 【Next.jsキャッチアップ】【Frontend】【API】【請求書クエリ】【関連】src/lib/prisma.ts : Prismaクライアントの実装
 */
import { prisma } from '@/lib/database/client';

/**
 * 金額が666の請求書を顧客名付きで取得する
 *
 * @returns 金額と顧客名を含む請求書の配列
 *
 * @remarks
 * amount = 666 で固定しているのは初期シードデータの確認用サンプルであり、実際の検索条件ではない
 */
async function listInvoices() {
  const invoices = await prisma.invoice.findMany({
    where: { amount: 666 },
    select: {
      amount: true,
      customer: { select: { name: true } },
    },
  });
  return invoices;
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
