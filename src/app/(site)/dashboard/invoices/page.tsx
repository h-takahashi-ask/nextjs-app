/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書一覧】【概要】請求書一覧ページ(URLパス: /dashboard/invoices)を表示するページコンポーネント
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書一覧】【関連】src/app/dashboard/layout.tsx : 本ページを包むダッシュボードレイアウト
 */

/**
 * 請求書一覧ページのUIを構築するコンポーネント
 *
 * @remarks
 * DashboardLayoutのchildrenとしてレンダリングされる
 * /dashboard/invoicesにアクセスした際にこのコンポーネントの内容がlayout.tsxのchildren位置に差し込まれる
 */
export default function DashboardInvoicesPage() {
  const page = <p>Dashboard Invoices Page</p>;
  return page;
}