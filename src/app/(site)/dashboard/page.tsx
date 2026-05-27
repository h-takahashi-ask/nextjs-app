/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボード】【概要】ダッシュボードのトップページ(URLパス: /dashboard)を表示するページコンポーネント
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボード】【関連】src/app/(site)/dashboard/layout.tsx : 本ページを包むダッシュボードレイアウト
 */

/**
 * /dashboardのUIを構築するコンポーネント
 *
 * @remarks
 * DashboardLayoutのchildrenとしてレンダリングされる
 * /dashboardにアクセスした際にこのコンポーネントの内容がlayout.tsxのchildren位置に差し込まれる
 */
export default function DashboardPage() {
  const page = <p>Dashboard Page</p>;
  return page;
}