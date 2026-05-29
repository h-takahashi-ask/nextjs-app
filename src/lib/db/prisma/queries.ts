/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【概要】ダッシュボード表示に必要なデータをデータベースから取得するクエリ関数群（Prisma版）
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【概要】売上・請求書・顧客・カード集計の4種のデータを用途別に提供する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/lib/db/prisma/client.ts                   : Prismaクライアントの実装
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/lib/db/prisma/models.ts                   : DBエンティティ型定義
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/lib/types.ts                              : UI表示・フォーム型定義
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/components/dashboard/revenue-chart.tsx  : fetchRevenueを使用
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/components/dashboard/cards.tsx          : fetchCardDataを使用
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ダッシュボードデータ】【関連】src/lib/db/drizzle/queries.ts               : Drizzle版（同一インターフェース）
 */
import { prismaClient } from '@/lib/db/prisma/client'
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
// Prisma ORM 早見表 — SQL との対応
// ─────────────────────────────────────────────────────────────────────────────
//
// ■ 基本構造
//   prismaClient.モデル名.メソッド名({ オプション })
//   スキーマに定義したモデル名 (例: Invoice → prismaClient.invoice) でテーブルを指定する
//   モデル名はPrismaが自動でcamelCase化する (例: schema の Invoice → prismaClient.invoice)
//
// ■ 主なメソッド一覧
//   findMany   → SELECT ... (複数行を取得)
//   findUnique → SELECT ... WHERE id = $1 (主キーまたはユニーク制約で1行を特定)
//   count      → SELECT COUNT(*)
//   aggregate  → SELECT SUM / AVG / MIN / MAX など集計
//   create     → INSERT INTO
//   update     → UPDATE ... WHERE
//   delete     → DELETE ... WHERE
//
// ■ SQLキーワードとPrismaオプションの対応
//
//   SQL                                  Prisma
//   ─────────────────────────────────────────────────────────────────────────
//   SELECT col1, col2                    select: { col1: true, col2: true }
//   SELECT *                             select 省略 (または include を使用)
//   FROM table                           prismaClient.モデル名 で指定
//   JOIN t2 ON t1.fk = t2.id            select / include の中にリレーション名をネスト
//   WHERE col = val                      where: { col: val }
//   WHERE col LIKE '%val%'               where: { col: { contains: val } }
//   WHERE col ILIKE '%val%'              where: { col: { contains: val, mode: 'insensitive' } }
//   WHERE c1 OR c2                       where: { OR: [{ c1 }, { c2 }] }
//   WHERE c1 AND c2                      where: { AND: [{ c1 }, { c2 }] }
//   ORDER BY col ASC                     orderBy: { col: 'asc' }
//   ORDER BY col DESC                    orderBy: { col: 'desc' }
//   LIMIT n                              take: n
//   OFFSET n                             skip: n
//   COUNT(*)                             count() メソッド
//   SUM(col)                             aggregate({ _sum: { col: true } })
//
// ■ JOINの書き方
//   PrismaのJOINはスキーマの @relation 定義をもとに自動で組み立てられる
//   テーブル名やON句を書く必要はなく、フィールド名でネストするだけでよい
//
//   ① selectでネスト — 必要なカラムだけ指定して効率的に取得する (推奨)
//      select: { customer: { select: { name: true } } }
//      → SQL: SELECT customers.name FROM invoices JOIN customers ON ...
//
//   ② include — リレーション先の全カラムをまとめて取得する (SELECT * に近い)
//      include: { invoices: true }
//      → SQL: SELECT * FROM customers LEFT JOIN invoices ON ...
//      includeとselectを組み合わせて取得カラムを絞ることもできる
//      include: { invoices: { select: { amount: true } } }
//
// ■ フィールド名の変換
//   DBカラム名 (snake_case) とPrismaフィールド名 (camelCase) が対応している
//   例: image_url → imageUrl、customer_id → customerId
//   スキーマの @map("image_url") で対応が定義されており、Prismaが自動で変換する
//   取得結果の変数もcamelCaseになるため、models.tsやtypes.tsで定義したsnake_case型への変換が必要
//
// ─────────────────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6

/**
 * 全月の売上データを取得する
 *
 * @returns 月と売上金額(セント単位)の配列
 *
 * @remarks
 * チュートリアルのストリーミング章でローディング体験を示すため、3秒の遅延コードを用意している
 * 遅延を有効にするには `await new Promise(...)` の行のコメントを外す
 * 本番環境では遅延を有効にしない
 */
export async function fetchRevenue(): Promise<Revenue[]> {
  try {
    console.log('Fetching revenue data...')
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // SQL: SELECT * FROM revenue
    const data = await prismaClient.revenue.findMany()

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
    const invoices = await prismaClient.invoice.findMany({
      // SQL: ORDER BY date DESC
      orderBy: { date: 'desc' },
      // SQL: LIMIT 5
      take: 5,
      // SQL: SELECT id, amount, ... (SELECT * より効率的、必要なカラムだけ取得する)
      select: {
        id: true,
        amount: true,
        // SQL: JOIN customers ON invoices.customer_id = customers.id
        // スキーマの @relation 定義をもとにPrismaが自動でJOINを組み立てる
        // customer というフィールド名はスキーマの Invoice モデルに定義したリレーション名
        customer: {
          select: {
            name: true,
            // DBカラム名は image_url だがPrismaではcamelCaseのimageUrlで参照する
            imageUrl: true,
            email: true,
          },
        },
      },
    })

    // Prismaの取得結果はcamelCase (imageUrl) のため、definitions.tsの型 (image_url) に合わせて変換する
    const latestInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      amount: formatCurrency(invoice.amount),
      name: invoice.customer.name,
      image_url: invoice.customer.imageUrl,
      email: invoice.customer.email,
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
 * 4つのDBクエリをPromise.allで並列実行してレイテンシを抑える
 * paid / pendingをそれぞれ個別のaggregateクエリで集計することで条件付き合計を実現する
 */
export async function fetchCardData() {
  console.log('Fetching card data...')
  await new Promise((resolve) => setTimeout(resolve, 1000))
  try {
    const [numberOfInvoices, numberOfCustomers, paidSummary, pendingSummary] =
      await Promise.all([
        // SQL: SELECT COUNT(*) FROM invoices
        prismaClient.invoice.count(),
        // SQL: SELECT COUNT(*) FROM customers
        prismaClient.customer.count(),
        // SQL: SELECT SUM(amount) FROM invoices WHERE status = 'paid'
        prismaClient.invoice.aggregate({
          _sum: { amount: true }, // SUM(amount)
          where: { status: 'paid' },
        }),
        // SQL: SELECT SUM(amount) FROM invoices WHERE status = 'pending'
        prismaClient.invoice.aggregate({
          _sum: { amount: true },
          where: { status: 'pending' },
        }),
      ])

    // aggregate の _sum は対象行が0件のとき null になるため ?? 0 でデフォルト値を補う
    const totalPaidInvoices = formatCurrency(paidSummary._sum.amount ?? 0)
    const totalPendingInvoices = formatCurrency(pendingSummary._sum.amount ?? 0)

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
 * 元のSQL実装では金額と日付を文字列変換してILIKE検索していたが、Prismaはintフィールドの
 * テキスト変換検索を直接サポートしないため、顧客名・メール・ステータスの3フィールドを検索対象としている
 */
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
): Promise<InvoicesTable[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  try {
    const invoices = await prismaClient.invoice.findMany({
      where: {
        // SQL: WHERE ... OR ... OR ... (いずれかの条件に一致する行を取得する)
        OR: [
          // SQL: customers.name ILIKE '%query%'
          // customer.name のようにリレーション名でネストすると、JOINしたテーブルの条件になる
          { customer: { name: { contains: query, mode: 'insensitive' } } },
          // SQL: customers.email ILIKE '%query%'
          { customer: { email: { contains: query, mode: 'insensitive' } } },
          // SQL: invoices.status ILIKE '%query%'
          // mode: 'insensitive' で大文字小文字を区別しない (PostgreSQLのILIKE相当)
          { status: { contains: query, mode: 'insensitive' } },
        ],
      },
      // SQL: ORDER BY date DESC
      orderBy: { date: 'desc' },
      // SQL: LIMIT 6
      take: ITEMS_PER_PAGE,
      // SQL: OFFSET (currentPage - 1) * 6
      skip: offset,
      select: {
        id: true,
        // DBカラム名は customer_id、PrismaではcamelCaseのcustomerIdで参照する
        customerId: true,
        amount: true,
        date: true,
        status: true,
        // SQL: JOIN customers ON invoices.customer_id = customers.id
        customer: {
          select: {
            name: true,
            email: true,
            imageUrl: true, // DBカラム名は image_url
          },
        },
      },
    })

    return invoices.map((invoice) => ({
      id: invoice.id,
      customer_id: invoice.customerId,
      amount: invoice.amount,
      // Prismaは @db.Date 型をJavaScriptのDateオブジェクトとして返す
      // toISOString() で "YYYY-MM-DDTHH:mm:ss.sssZ" になるため split('T')[0] で日付部分だけ取り出す
      date: invoice.date.toISOString().split('T')[0],
      status: invoice.status as 'pending' | 'paid',
      name: invoice.customer.name,
      email: invoice.customer.email,
      image_url: invoice.customer.imageUrl,
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
    // SQL: SELECT COUNT(*) FROM invoices JOIN customers ON ... WHERE ...
    // count() は where オプションで条件を絞った件数を返す
    const count = await prismaClient.invoice.count({
      where: {
        OR: [
          { customer: { name: { contains: query, mode: 'insensitive' } } },
          { customer: { email: { contains: query, mode: 'insensitive' } } },
          { status: { contains: query, mode: 'insensitive' } },
        ],
      },
    })

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE)
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
 */
export async function fetchInvoiceById(id: string): Promise<InvoiceForm | undefined> {
  try {
    // SQL: SELECT id, customer_id, amount, status FROM invoices WHERE id = $1
    // findUnique は主キー (またはユニーク制約) で1行を特定する
    // 該当行が存在しない場合は null を返すため、後続で undefined チェックが必要
    const invoice = await prismaClient.invoice.findUnique({
      where: { id }, // WHERE id = $id (主キーによる検索)
      select: {
        id: true,
        customerId: true, // DBカラム名は customer_id
        amount: true,
        status: true,
      },
    })

    if (!invoice) return undefined

    return {
      id: invoice.id,
      customer_id: invoice.customerId,
      // セント単位で保存されているため100で割ってドルに変換する
      amount: invoice.amount / 100,
      status: invoice.status as 'pending' | 'paid',
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
    const customers = await prismaClient.customer.findMany({
      // SQL: ORDER BY name ASC
      orderBy: { name: 'asc' },
      // SQL: SELECT id, name (フォームのセレクトに必要な2フィールドのみ取得する)
      select: { id: true, name: true },
    })
    return customers
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
 * 顧客ごとに全請求書をまとめて取得し、JavaScript側でpaid/pendingに分けて集計する
 * 元のSQLのGROUP BYと条件付きSUM相当の処理をアプリ層で行っているため、顧客数が多い場合は注意が必要
 */
export async function fetchFilteredCustomers(
  query: string,
): Promise<FormattedCustomersTable[]> {
  try {
    const customers = await prismaClient.customer.findMany({
      where: {
        // SQL: WHERE name ILIKE '%query%' OR email ILIKE '%query%'
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      // SQL: ORDER BY name ASC
      orderBy: { name: 'asc' },
      // SQL: LEFT JOIN invoices ON customers.id = invoices.customer_id
      // selectではなくincludeを使うのは、顧客ごとの全請求書をJS側で集計するため全行が必要だから
      // include: { invoices: true } とすると全カラムが取れるが、集計に不要なカラムは省くため select で絞る
      include: {
        invoices: {
          select: { amount: true, status: true },
        },
      },
    })

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      image_url: customer.imageUrl, // DBカラム名は image_url
      // SQL: COUNT(invoices.id) — 取得済みの配列の長さで件数を代替する
      total_invoices: customer.invoices.length,
      // SQL: SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)
      // PrismaのORMでは条件付きSUMを直接表現できないため filter + reduce でJS側で計算する
      total_pending: formatCurrency(
        customer.invoices
          .filter((inv) => inv.status === 'pending') // CASE WHEN status = 'pending'
          .reduce((sum, inv) => sum + inv.amount, 0), // SUM(amount)
      ),
      // SQL: SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)
      total_paid: formatCurrency(
        customer.invoices
          .filter((inv) => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.amount, 0),
      ),
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
 *
 * @remarks
 * 認証フロー (nextauth.tsのauthorize) から呼ばれ、ログインフォームのメールアドレスに対応するユーザーを取得する
 */
export async function getUser(email: string): Promise<User | null> {
  try {
    const user = await prismaClient.user.findUnique({
      where: { email },
    })
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}
