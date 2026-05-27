/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【顧客一覧】【概要】顧客一覧ページ(URLパス: /dashboard/customers)を表示するページコンポーネント
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【顧客一覧】【関連】src/app/dashboard/layout.tsx : 本ページを包むダッシュボードレイアウト
 */

/**
 * 顧客一覧ページのUIを構築するコンポーネント
 *
 * @remarks
 * DashboardLayoutのchildrenとしてレンダリングされる
 * /dashboard/customersにアクセスした際にこのコンポーネントの内容がlayout.tsxのchildren位置に差し込まれる
 */
export default function DashboardCustomersPage() {
  const page = <p>Dashboard Customers Page</p>;
  return page;
}