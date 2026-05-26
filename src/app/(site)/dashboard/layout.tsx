/**
 * 【Next.jsキャッチアップ】【Frontend】【Layout】【ダッシュボード】【概要】/dashboard配下の全ページに共通するネストレイアウト
 * 【Next.jsキャッチアップ】【Frontend】【Layout】【ダッシュボード】【概要】ナビゲーションなどダッシュボード共通UIをnavタグ内に追加すると全ダッシュボードページで表示される
 * 【Next.jsキャッチアップ】【Frontend】【Layout】【ダッシュボード】【概要】ルートレイアウトの子として適用され、さらにその子に各ページのコンテンツが入る
 *
 * 【Next.jsキャッチアップ】【Frontend】【Layout】【ダッシュボード】【関連】src/app/layout.tsx         : 本レイアウトを包む親のルートレイアウト
 * 【Next.jsキャッチアップ】【Frontend】【Layout】【ダッシュボード】【関連】src/app/dashboard/page.tsx : /dashboardページのコンテンツ
 */

import SideNav from '@/components/dashboard/sidenav';


/**
 * ダッシュボード全体のレイアウトコンポーネント
 *
 * @param children - /dashboard配下の各ページのコンテンツ
 *
 * @remarks
 * App Routerではフォルダ内のlayout.tsxが入れ子になって適用される
 * 本レイアウトは/dashboard、/dashboard/settingsなど/dashboard配下の全ルートに自動適用される
 * 【部分レンダリング】<Link>でページ遷移したとき、このレイアウトはアンマウントされずそのまま保持される
 * Next.jsはURLの変化したセグメント(page)だけを特定してlayoutは維持したままchildrenのみ差し替える
 * <a>タグに変えるとフルページリロードになりlayoutも含めてすべて作り直しになる
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      {/* h-screenで画面全体を占有 / md:overflow-hiddenでブラウザ本体のスクロールを封じる */}
      {/* サイドナビを固定したままコンテンツエリアのみをスクロールさせるための外側レイアウト設定 */}
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      {/* md:overflow-y-auto: コンテンツエリアのみをスクロール可能にする */}
      {/* 外側のmd:overflow-hiddenと組み合わせることでサイドナビは固定のままコンテンツだけがスクロールする */}
      {/* ── 部分レンダリング(Partial Rendering)の核心 ────────────────────────────── */}
      {/* <Link>によるページ遷移ではこのlayoutは再マウントされず、childrenの中身だけが差し替わる */}
      {/* SideNavを含むレイアウト全体のReact状態(スクロール位置・入力値など)がページをまたいで維持される */}
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}