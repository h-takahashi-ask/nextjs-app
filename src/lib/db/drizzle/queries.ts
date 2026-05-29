/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【概要】ダッシュボード表示に必要なデータをデータベースから取得するクエリ関数群（Drizzle版）
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【概要】prisma/queries.ts と同一インターフェースを持ち、import を差し替えるだけで ORM を切り替えられる
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/lib/db/drizzle/client.ts                  : Drizzleクライアントの実装
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/lib/db/drizzle/schema.ts                  : Drizzleスキーマ定義
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/lib/types.ts                               : UI表示・フォーム型定義
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/lib/db/prisma/queries.ts                  : Prisma版（同一インターフェース）
 */
import { asc, count, desc, eq, ilike, or, sql as drizzleSql, sum } from 'drizzle-orm'
import { drizzleClient } from './client'
import { customers, invoices, revenue, users } from './schema'
import { Revenue, User } from '@/lib/db/prisma/models'
import {
  CustomerField,
  FormattedCustomersTable,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
} from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Drizzle ORM 早見表 — SQL との対応
// ─────────────────────────────────────────────────────────────────────────────
//
// ■ 基本構造
//   drizzleClient.select({ カラム }).from(テーブル).where(条件).orderBy().limit()
//   SQL に近いメソッドチェーン形式で記述する
//
// ■ SQLキーワードとDrizzleの対応
//
//   SQL                                  Drizzle
//   ─────────────────────────────────────────────────────────────────────────
//   SELECT col1, col2                    .select({ col1: table.col1, col2: table.col2 })
//   SELECT *                             .select() (引数なし)
//   FROM table                           .from(tableObject)
//   INNER JOIN t2 ON t1.fk = t2.id      .innerJoin(t2, eq(t1.fk, t2.id))
//   LEFT JOIN t2 ON t1.fk = t2.id       .leftJoin(t2, eq(t1.fk, t2.id))
//   WHERE col = val                      .where(eq(table.col, val))
//   WHERE col ILIKE '%val%'              .where(ilike(table.col, `%${val}%`))
//   WHERE c1 OR c2                       .where(or(c1, c2))
//   ORDER BY col ASC / DESC              .orderBy(asc(table.col)) / .orderBy(desc(table.col))
//   LIMIT n                              .limit(n)
//   OFFSET n                             .offset(n)
//   COUNT(*)                             count() → .select({ value: count() })
//   SUM(col)                             sum(table.col) → .select({ total: sum(table.col) })
//   GROUP BY col                         .groupBy(table.col)
//
// ■ Prisma との主な違い
//   - JOINを .innerJoin() / .leftJoin() で明示する（スキーマのリレーション定義不要）
//   - findUnique 相当はなく、.limit(1) + rows[0] で代替する
//   - COUNT/SUM はユーティリティ関数を select 内で使う
//   - date カラムは pg ドライバで 'YYYY-MM-DD' 文字列として返る（Prisma は Date オブジェクト）
//   - SUM の戻り値は string | null（数値変換に Number() が必要）
//   - GROUP BY + 条件付き SUM を SQL レベルで実行できる（Prisma は JS 側で集計が必要）
//
// ─────────────────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6

/**
 * 全月の売上データを取得する
 *
 * @returns 月と売上金額(セント単位)の配列
 */
export async function fetchRevenue(): Promise<Revenue[]> {
  try {
    console.log('Fetching revenue data...')
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // SQL: SELECT * FROM financial_dashboard.revenue
    const data = await drizzleClient.select().from(revenue)

    console.log('Data fetch completed after 3 seconds.')
    return data
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch revenue data.')
  }
}

/**
 * 最新5件の請求書を顧客情報付きで取得する
 *
 * @returns 金額を通貨フォーマット済みの最新請求書5件 (日付降順)
 */
export async function fetchLatestInvoices(): Promise<LatestInvoice[]> {
  console.log('Fetching latest invoices data...')
  await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    // SQL: SELECT invoices.id, invoices.amount, customers.name, customers.image_url, customers.email
    //      FROM invoices INNER JOIN customers ON invoices.customer_id = customers.id
    //      ORDER BY invoices.date DESC LIMIT 5
    const rows = await drizzleClient
      .select({
        id: invoices.id,
        amount: invoices.amount,
        name: customers.name,
        imageUrl: customers.imageUrl,
        email: customers.email,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(desc(invoices.date))
      .limit(5)

    const latestInvoices = rows.map((row) => ({
      id: row.id,
      amount: formatCurrency(row.amount),
      name: row.name,
      image_url: row.imageUrl,
      email: row.email,
    }))

    return latestInvoices
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the latest invoices.')
  }
}

/**
 * ダッシュボードのカード表示に必要な集計データを並列で取得する
 *
 * @returns 請求書数・顧客数・支払済合計・支払待ち合計
 *
 * @remarks
 * count() は数値を返す。sum() は string | null を返すため Number() で変換する
 */
export async function fetchCardData() {
  console.log('Fetching card data...')
  await new Promise((resolve) => setTimeout(resolve, 1000))
  try {
    const [invoiceCountRows, customerCountRows, paidRows, pendingRows] =
      await Promise.all([
        // SQL: SELECT COUNT(*) FROM invoices
        drizzleClient.select({ value: count() }).from(invoices),
        // SQL: SELECT COUNT(*) FROM customers
        drizzleClient.select({ value: count() }).from(customers),
        // SQL: SELECT SUM(amount) FROM invoices WHERE status = 'paid'
        drizzleClient
          .select({ total: sum(invoices.amount) })
          .from(invoices)
          .where(eq(invoices.status, 'paid')),
        // SQL: SELECT SUM(amount) FROM invoices WHERE status = 'pending'
        drizzleClient
          .select({ total: sum(invoices.amount) })
          .from(invoices)
          .where(eq(invoices.status, 'pending')),
      ])

    const numberOfInvoices = invoiceCountRows[0].value
    const numberOfCustomers = customerCountRows[0].value
    // sum() は string | null を返すため Number() で変換し、null なら 0 とする
    const totalPaidInvoices = formatCurrency(Number(paidRows[0].total) || 0)
    const totalPendingInvoices = formatCurrency(Number(pendingRows[0].total) || 0)

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch card data.')
  }
}

/**
 * 検索クエリとページ番号に基づいて請求書一覧を取得する
 *
 * @param query - 顧客名・メール・ステータスに対する絞り込みキーワード (大文字小文字無視)
 * @param currentPage - 表示するページ番号 (1始まり)
 * @returns 指定ページの請求書一覧 (1ページあたり6件、日付降順)
 *
 * @remarks
 * date カラムは pg ドライバで 'YYYY-MM-DD' 文字列として返るため、
 * Prisma版の .toISOString().split('T')[0] 変換は不要
 */
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
): Promise<InvoicesTable[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  try {
    // SQL: SELECT ... FROM invoices
    //      INNER JOIN customers ON invoices.customer_id = customers.id
    //      WHERE customers.name ILIKE '%query%' OR ... OR invoices.status ILIKE '%query%'
    //      ORDER BY invoices.date DESC LIMIT 6 OFFSET n
    const rows = await drizzleClient
      .select({
        id: invoices.id,
        customerId: invoices.customerId,
        amount: invoices.amount,
        date: invoices.date,
        status: invoices.status,
        name: customers.name,
        email: customers.email,
        imageUrl: customers.imageUrl,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(invoices.status, `%${query}%`),
        ),
      )
      .orderBy(desc(invoices.date))
      .limit(ITEMS_PER_PAGE)
      .offset(offset)

    return rows.map((row) => ({
      id: row.id,
      customer_id: row.customerId,
      amount: row.amount,
      date: row.date, // pg ドライバが 'YYYY-MM-DD' 文字列で返す
      status: row.status as 'pending' | 'paid',
      name: row.name,
      email: row.email,
      image_url: row.imageUrl,
    }))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch invoices.')
  }
}

/**
 * 検索クエリに一致する請求書の総ページ数を取得する
 *
 * @param query - fetchFilteredInvoicesと同じ絞り込みキーワード
 * @returns 総ページ数 (1ページあたり6件で計算)
 */
export async function fetchInvoicesPages(query: string): Promise<number> {
  try {
    // SQL: SELECT COUNT(*) FROM invoices
    //      INNER JOIN customers ON invoices.customer_id = customers.id
    //      WHERE ...
    const result = await drizzleClient
      .select({ value: count() })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(invoices.status, `%${query}%`),
        ),
      )

    const totalPages = Math.ceil(result[0].value / ITEMS_PER_PAGE)
    return totalPages
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch total number of invoices.')
  }
}

/**
 * 指定IDの請求書1件を取得する
 *
 * @param id - 取得する請求書のID (UUID)
 * @returns 請求書データ (金額はセントからドルに変換済み) / 存在しない場合はundefined
 *
 * @remarks
 * Drizzle に findUnique 相当はなく、.limit(1) + rows[0] で代替する
 */
export async function fetchInvoiceById(id: string): Promise<InvoiceForm | undefined> {
  try {
    // SQL: SELECT id, customer_id, amount, status FROM invoices WHERE id = $1 LIMIT 1
    const rows = await drizzleClient
      .select({
        id: invoices.id,
        customerId: invoices.customerId,
        amount: invoices.amount,
        status: invoices.status,
      })
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1)

    if (!rows[0]) return undefined

    return {
      id: rows[0].id,
      customer_id: rows[0].customerId,
      // セント単位で保存されているため100で割ってドルに変換する
      amount: rows[0].amount / 100,
      status: rows[0].status as 'pending' | 'paid',
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch invoice.')
  }
}

/**
 * すべての顧客を名前昇順で取得する
 *
 * @returns 顧客IDと名前のみの軽量な一覧 (請求書作成フォームのセレクト用途)
 */
export async function fetchCustomers(): Promise<CustomerField[]> {
  try {
    // SQL: SELECT id, name FROM customers ORDER BY name ASC
    const result = await drizzleClient
      .select({ id: customers.id, name: customers.name })
      .from(customers)
      .orderBy(asc(customers.name))

    return result
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch all customers.')
  }
}

/**
 * 検索クエリに一致する顧客と請求書集計を取得する
 *
 * @param query - 顧客名・メールアドレスに対する絞り込みキーワード (大文字小文字無視)
 * @returns 顧客ごとの請求書数・支払済合計・支払待ち合計を含む一覧 (金額は通貨フォーマット済み)
 *
 * @remarks
 * Prisma版はJS側でfilter + reduceで集計しているが、
 * Drizzle版はGROUP BY + CASE WHENでDB側で完結するためパフォーマンスが向上する
 */
export async function fetchFilteredCustomers(
  query: string,
): Promise<FormattedCustomersTable[]> {
  try {
    // SQL: SELECT customers.id, customers.name, ...,
    //             COUNT(invoices.id),
    //             SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END),
    //             SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)
    //      FROM customers LEFT JOIN invoices ON customers.id = invoices.customer_id
    //      WHERE customers.name ILIKE '%query%' OR customers.email ILIKE '%query%'
    //      GROUP BY customers.id, customers.name, customers.email, customers.image_url
    //      ORDER BY customers.name ASC
    const rows = await drizzleClient
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        image_url: customers.imageUrl,
        total_invoices: count(invoices.id),
        total_pending: sum(
          drizzleSql`CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.amount} ELSE 0 END`,
        ),
        total_paid: sum(
          drizzleSql`CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amount} ELSE 0 END`,
        ),
      })
      .from(customers)
      .leftJoin(invoices, eq(customers.id, invoices.customerId))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
        ),
      )
      .groupBy(customers.id, customers.name, customers.email, customers.imageUrl)
      .orderBy(asc(customers.name))

    return rows.map((row) => ({
      ...row,
      total_pending: formatCurrency(Number(row.total_pending) || 0),
      total_paid: formatCurrency(Number(row.total_paid) || 0),
    }))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch customer table.')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 認証
// ─────────────────────────────────────────────────────────────────────────────

/**
 * メールアドレスでDBからユーザーを1件取得する
 *
 * @param email - 検索対象のメールアドレス
 * @returns 該当ユーザーが存在する場合はUserオブジェクト、存在しない場合は null
 */
export async function getUser(email: string): Promise<User | null> {
  try {
    // SQL: SELECT * FROM users WHERE email = $1 LIMIT 1
    const rows = await drizzleClient
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    const user = rows[0] ?? null
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}
