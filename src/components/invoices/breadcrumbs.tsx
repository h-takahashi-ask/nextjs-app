/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【パンくずナビ】【概要】現在地をパス形式で表示するナビゲーションUI部品
 * 【Next.jsキャッチアップ】【Frontend】【Component】【パンくずナビ】【概要】「Invoices > Create Invoice」のように階層構造を示し、現在地をハイライトする
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【パンくずナビ】【関連】src/app/(site)/dashboard/invoices/create/page.tsx : 本コンポーネントの利用画面
 */

import { clsx } from 'clsx';
import Link from 'next/link';
import { lusitana } from '@/components/common/fonts';

/**
 * パンくずナビの各項目を表す型
 *
 * @property label - 画面に表示するテキスト(例: 'Invoices', 'Create Invoice')
 * @property href  - クリック時の遷移先URL
 * @property active - true のとき現在地としてハイライト表示する。省略時は false 扱い
 */
interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

/**
 * パンくずナビゲーションコンポーネント
 *
 * @param breadcrumbs - 表示する項目の配列。配列の順番がそのままパスの階層順になる
 *
 * @remarks
 * `<nav>` はブラウザやスクリーンリーダーがナビゲーション領域として認識するHTML5のランドマーク要素
 * `aria-label="Breadcrumb"` を付けることで、ページに複数のナビゲーションがあっても
 * スクリーンリーダーが「これはパンくずナビ」と区別して読み上げられる
 *
 * `<ol>` (ordered list) を使うのはパンくずナビが「順序のある階層」を表すため
 * `<ul>` (unordered list) は順不同のリストに使うので、階層には `<ol>` が適切
 */
export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: Breadcrumb[];
}) {
  const nav = (
    // aria-label="Breadcrumb": ページ内に複数の<nav>がある場合に区別するためのラベル
    // スクリーンリーダーは「Breadcrumb ナビゲーション」と読み上げ、ユーザーが目的のナビを見つけやすくなる
    <nav aria-label="Breadcrumb" className="mb-6 block">
      {/* <ol>: 階層に順序があるためunordered list(<ul>)ではなくordered list(<ol>)を使う */}
      <ol className={clsx(lusitana.className, 'flex text-xl md:text-2xl')}>
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            // key={breadcrumb.href}: パンくずナビの各項目はhrefが一意になるため、keyに使う
            key={breadcrumb.href}
            // aria-current={breadcrumb.active}: 現在表示中のページの要素に付ける属性
            // スクリーンリーダーが「現在地」であることを読み上げる。active が false/undefined のときは undefined が渡り、属性は出力されない
            aria-current={breadcrumb.active}
            className={clsx(
              // active なら濃い色、そうでなければグレーで表示してどれが現在地かを視覚的に区別する
              breadcrumb.active ? 'text-gray-900' : 'text-gray-500',
            )}
          >
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            {/* 最後の項目(現在地)の後にはセパレータ "/" を表示しない
                index < breadcrumbs.length - 1 が true = まだ後ろに項目がある = セパレータを表示する */}
            {index < breadcrumbs.length - 1 ? (
              <span className="mx-3 inline-block">/</span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
  return nav;
}
