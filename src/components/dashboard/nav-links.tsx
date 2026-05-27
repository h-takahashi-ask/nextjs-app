/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ナビゲーションリンク】【概要】サイドナビゲーション内に表示するリンク一覧UI部品
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ナビゲーションリンク】【概要】現在のURLパスと一致するリンクをハイライト表示する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ナビゲーションリンク】【関連】src/components/dashboard/sidenav.tsx : 本コンポーネントを使用するサイドナビ
 */
'use client';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// 実際のアプリでは規模に応じてDBで管理することを想定している
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

/**
 * サイドナビゲーション内のリンク一覧を構築するUI部品
 *
 * @remarks
 * 'use client'を付けているのは`usePathname`でブラウザの現在URLを読み取るため
 * サーバーコンポーネントではブラウザのURL情報にアクセスできないためクライアントコンポーネントとして動作させる必要がある
 * 【部分レンダリングとの関係】usePathnameが変わるとNavLinksだけが再レンダリングされる
 * Reactの再レンダリングは親へは伝播しないため、親のSideNav(サーバーコンポーネント)やDashboardLayoutは再レンダリングされず保持される
 */
export default function NavLinks() {
  const pathname = usePathname();
  const navLinks = (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;

        // ── <Link> と <a> の違いを体験する ────────────────────────────────────────────
        // 【<Link>】(現在の実装) クライアントサイドナビゲーション
        //   ページ全体を再描画せずURLとコンテンツだけ切り替える(SPAの動作)
        //   ブラウザのタブにスピナーが出ない / Reactのstateが保持される / 本番では事前読み込みが効く
        //   Next.jsがURLの変化したセグメント(page)だけを特定してlayoutは保持したまま差し替える(部分レンダリング)
        //
        // 【<a>】 フルページリロード
        //   サーバーに新しいHTMLをリクエストしページ全体を再描画する
        //   ブラウザのタブにスピナーが出る / Reactのstateはリセットされる
        //
        // ▼ <a>に切り替えて挙動の違いを確認する手順:
        //   1. 下の return ( <Link 〜 </Link> ); を /* */ で囲んでコメントアウト
        //   2. 下の /* <a>版 */ ブロックのコメントを外す
        // ─────────────────────────────────────────────────────────────────────────────
        const linkElement = (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
        return linkElement;
        /* ── <a>タグ版 (上の return(...)をコメントアウトしてから下のコメントを外す) ────
        // return (
        //   <a
        //     key={link.name}
        //     href={link.href}
        //     className={clsx(
        //       'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
        //       {
        //         'bg-sky-100 text-blue-600': pathname === link.href,
        //       },
        //     )}
        //   >
        //     <LinkIcon className="w-6" />
        //     <p className="hidden md:block">{link.name}</p>
        //   </a>
        // );
        // ─────────────────────────────────────────────────────────────────────────────── */
      })}
    </>
  );
  return navLinks;
}
