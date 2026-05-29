/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボードローディング】【概要】/dashboardページ全体のローディング中に表示するフォールバックUI
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボードローディング】【関連】src/components/dashboard/(overview)/skeletons.tsx  : DashboardSkeletonコンポーネントの実装
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボードローディング】【関連】src/app/(site)/dashboard/(overview)/page.tsx    : フォールバック対象のページ
 *
 * ■ loading.tsx の仕組み
 *   Next.jsはlayout.tsxと同じフォルダに置いたloading.tsxを自動的に認識する
 *   該当ルートのpage.tsxをSuspenseでラップし、loading.tsxの内容をfallbackに使う動作をフレームワーク側が行う
 *   つまり loading.tsx を置くだけで <Suspense fallback={<Loading />}><Page /></Suspense> と同等の効果が得られる
 *   (overview)はURLに影響しないルートグループ用フォルダ名で、このloading.tsxは /dashboard に適用される
 *
 * ■ page.tsx内のSuspenseとの違い
 *   loading.tsx → ページ全体が切り替わる際（初回ナビゲーション・ハードリフレッシュ）のフォールバック
 *   page.tsx内の各Suspense → ページ内の特定セクションごとのフォールバック（他セクションの表示をブロックしない）
 */
import DashboardSkeleton from '@/components/dashboard/(overview)/skeletons';

/**
 * /dashboardページ全体のローディングフォールバック
 *
 * @remarks
 * Next.jsがこのコンポーネントをSuspenseのfallbackとして自動的に使用する
 */
export default function Loading() {
  const loading = <DashboardSkeleton />;
  return loading;
}
