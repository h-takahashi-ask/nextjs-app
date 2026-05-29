/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書ページネーション】【概要】現在のページ番号と総ページ数をもとにページ移動ナビゲーションを表示するUI部品
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書ページネーション】【概要】ページ番号クリックでURLのpageパラメータを更新し、サーバーコンポーネントが対応ページのデータを取得し直す
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書ページネーション】【関連】src/app/(site)/dashboard/invoices/page.tsx : 本コンポーネントの利用画面
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書ページネーション】【関連】src/lib/utils.ts : generatePaginationの提供元
 */

// 'use client': usePathname / useSearchParams はブラウザ側でのみ動作するフックのため
// このコンポーネントはClient Componentにする必要がある
// ページ番号のクリック自体はLinkコンポーネントで対応できるが、
// 現在のURLを読み取って「今何ページ目か」を判定するにはクライアント側のフックが必要なため
'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { generatePagination } from '@/lib/utils';



/**
 * ページ移動ナビゲーションを表示するコンポーネント
 *
 * @param totalPages - 表示可能な総ページ数
 *
 * @remarks
 * URLのpageパラメータを読み取って現在のページを判定する
 * ページ番号や矢印をクリックするとURLのpageパラメータが更新され、
 * サーバーコンポーネントが新しいページのデータを取得し直す
 * ページ状態をURLで管理することで、ブラウザの戻る/進むでページ移動の履歴を保持できる
 */
export default function Pagination({ totalPages }: { totalPages: number }) {
  // NOTE: Uncomment this code in Chapter 10

  // usePathname: 現在のURLのパス部分(例: /dashboard/invoices)を文字列で取得するフック
  // ページ移動後もパスを変えずにクエリパラメータ(?page=2)だけを書き換えるために使う
  const pathname = usePathname();

  // useSearchParams: URLのクエリパラメータ(例: ?query=abc&page=2)を読み取るフック
  // 検索語(query)など既存のパラメータを保持したままpageだけを差し替えるために使う
  const searchParams = useSearchParams();

  // URLにpageパラメータがなければ初回アクセスとみなして1ページ目を表示する
  const currentPage = Number(searchParams.get('page')) || 1;

  // 既存のクエリパラメータ(検索語など)を引き継ぎ、pageだけ差し替えたURLを返す内部関数
  // new URLSearchParams(searchParams) で現在の?query=abc&sort=asc などをコピーしてから
  // page のみを上書きすることで、他のパラメータを誤って消さないようにしている
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // generatePagination: 現在ページと総ページ数から表示するページ番号一覧を生成する
  // ページ数が多いとき中間を'...'で省略して「1 2 ... 8 9 10」のように表示する
  const allPages = generatePagination(currentPage, totalPages);

  return (
    <>
      {/*  NOTE: Uncomment this code in Chapter 10 */}

      <div className="inline-flex">
        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        <div className="flex -space-x-px">
          {allPages.map((page, index) => {
            // position: ボタン列の中での位置を表し、左端・右端・単独・中間で角丸スタイルを切り替えるために使う
            // if を連続で並べることで後の条件が前の条件を上書きできる設計になっている
            // 例: ページが1件だけのとき
            //   1. index===0 → 'first'
            //   2. index===length-1(=0) → 'last' に上書き
            //   3. length===1 → 'single' にさらに上書き  ← 最終的に 'single' になる
            // else if にすると 'single' が後から上書きできないため、意図的にif を連続で使っている
            let position: 'first' | 'last' | 'single' | 'middle' | undefined;

            if (index === 0) position = 'first';
            if (index === allPages.length - 1) position = 'last';
            if (allPages.length === 1) position = 'single';
            if (page === '...') position = 'middle';

            return (
              // key に page だけを使わず index も加えるのは、'...' が2箇所に現れたときに重複キーになるのを防ぐため
              // 例: ページ数が多いと [1, '...', 5, 6, 7, '...', 10] のように '...' が2つ存在する
              <PaginationNumber
                key={`${page}-${index}`}
                href={createPageURL(page)}
                page={page}
                position={position}
                isActive={currentPage === page}
              />
            );
          })}
        </div>

        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div>
    </>
  );
}

/**
 * 個々のページ番号ボタンを表示するUI部品
 *
 * @param page - 表示するページ番号、または省略記号`'...'`
 * @param href - クリック時に遷移するURL
 * @param isActive - このページが現在表示中のページかどうか
 * @param position - ボタン列内での位置(角丸スタイルの切り替えに使用)
 *
 * @remarks
 * 現在のページ(`isActive`が`true`)と省略記号(`position === 'middle'`)はクリックしても意味がないため
 * Linkではなくdivとして表示してクリック不可にする
 * それ以外はLinkコンポーネントでページ遷移できるリンクとして表示する
 */
function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: 'first' | 'last' | 'middle' | 'single';
  isActive: boolean;
}) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center text-sm border',
    {
      'rounded-l-md': position === 'first' || position === 'single',
      'rounded-r-md': position === 'last' || position === 'single',
      'z-10 bg-blue-600 border-blue-600 text-white': isActive,
      'hover:bg-gray-100': !isActive && position !== 'middle',
      'text-gray-300': position === 'middle',
    },
  );

  // すでに表示中のページ(isActive)と省略記号(middle)はクリックしても意味がないためdivで表示する
  // それ以外のページ番号はLinkコンポーネントでクリック可能なリンクとして表示する
  return isActive || position === 'middle' ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

/**
 * 前ページ・次ページへ移動する矢印ボタンを表示するUI部品
 *
 * @param href - クリック時に遷移するURL
 * @param direction - 矢印の向き(`'left'`が前ページ、`'right'`が次ページ)
 * @param isDisabled - 移動先がない場合(1ページ目の前、最終ページの次)に`true`を渡してクリックを無効化する
 *
 * @remarks
 * 無効時はLinkではなくdivとして表示し、pointer-events-noneのCSSクラスでクリックを無効化する
 * `<Link>`要素にはHTMLの`disabled`属性が使えないため、CSSで代替している
 */
function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center rounded-md border',
    {
      // pointer-events-none: CSSでマウス操作を無効化するクラス
      // <Link>はHTMLのdisabled属性が使えないため、CSSで代替している
      'pointer-events-none text-gray-300': isDisabled,
      'hover:bg-gray-100': !isDisabled,
      'mr-2 md:mr-4': direction === 'left',
      'ml-2 md:ml-4': direction === 'right',
    },
  );

  const icon =
    direction === 'left' ? (
      <ArrowLeftIcon className="w-4" />
    ) : (
      <ArrowRightIcon className="w-4" />
    );

  // 無効時はdivで表示してクリックを受け付けない
  // 有効時はLinkコンポーネントで前/次ページへ遷移できるリンクとして表示する
  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  );
}
