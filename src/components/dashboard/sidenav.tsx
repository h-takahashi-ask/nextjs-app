/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【サイドナビゲーション】【概要】ダッシュボード画面の左側に表示するナビゲーションバーUI部品
 * 【Next.jsキャッチアップ】【Frontend】【Component】【サイドナビゲーション】【概要】Acmeロゴ、ナビゲーションリンク、サインアウトボタンで構成する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【サイドナビゲーション】【関連】src/app/dashboard/layout.tsx          : 本コンポーネントを配置するダッシュボードレイアウト
 * 【Next.jsキャッチアップ】【Frontend】【Component】【サイドナビゲーション】【関連】src/components/dashboard/nav-links.tsx : ナビゲーションリンク一覧
 * 【Next.jsキャッチアップ】【Frontend】【Component】【サイドナビゲーション】【関連】src/components/common/acme-logo.tsx   : ロゴUI部品
 */
import Link from 'next/link';
import NavLinks from '@/components/dashboard/nav-links';
import AcmeLogo from '@/components/common/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';

/**
 * ダッシュボードのサイドナビゲーションを構築するUI部品
 *
 * @remarks
 * モバイルでは画面上部に横並び、デスクトップ(md以上)では画面左に縦並びで表示する
 * 【Server Component】'use client'がないためサーバーコンポーネントとして動作し、クライアント側のページ遷移時に再レンダリングされない
 * 子のNavLinksはClient Componentなので、URLが変わるとNavLinksだけが再レンダリングされてハイライトを更新する
 * SideNav自身は再レンダリングされないため、ページ遷移をまたいでスクロール位置や表示状態が保たれる
 */
export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        {/* デスクトップ(md以上)でNavLinksとSign Outの間を埋めるスペーサー */}
        {/* growで残りスペースを占有してSign Outを最下部に固定する */}
        {/* モバイルではhiddenで非表示のためNavLinksとSign Outが横並びになる */}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        {/* Server Actionsでサインアウト処理を実装するためformタグで囲んでいる(現時点はデザインのみ) */}
        {/* Server Actionsはformのaction属性にサーバー側の関数を渡すことでJavaScriptなしでも動作するNext.js固有の仕組み */}
        <form>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
