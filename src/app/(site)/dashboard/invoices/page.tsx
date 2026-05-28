/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書一覧】【概要】請求書一覧ページ(URLパス: /dashboard/invoices)を表示するページコンポーネント
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書一覧】【関連】src/app/(site)/dashboard/layout.tsx : 本ページを包むダッシュボードレイアウト
 */

import { Suspense } from 'react';
import Pagination from '@/components/invoices/pagination';
import Search from '@/components/common/search';
import Table from '@/components/invoices/table';  
import { CreateInvoice } from '@/components/invoices/buttons';
import { lusitana } from '@/components/common/fonts';
import { InvoicesTableSkeleton } from '@/components/common/skeletons';
import { fetchInvoicesPages } from '@/lib/database/queries';



/**
 * 請求書一覧ページのUIを構築するコンポーネント
 *
 * @remarks
 * DashboardLayoutのchildrenとしてレンダリングされる
 * /dashboard/invoicesにアクセスした際にこのコンポーネントの内容がlayout.tsxのchildren位置に差し込まれる
 * URLのクエリパラメータ(query・page)をprops.searchParams経由でサーバー側で受け取り、
 * データ取得の絞り込みとページ移動に使う
 * App RouterではServer ComponentのみがこのようにpropsでURLパラメータを直接受け取れる
 * Client ComponentではuseSearchParamsフックを使う必要がある点が異なる
 *
 * 【Search入力からTable・Paginationに結果が表示されるまでの流れ】
 *
 * ① ユーザーがSearchコンポーネントに文字を入力する (search.tsx)
 *    → 300ms後にURLが /dashboard/invoices?query=xxx&page=1 に書き換わる
 *
 * ② Next.jsがURLの変化を検知し、このServer Component(DashboardInvoicesPage)をサーバーで再実行する
 *    → searchParamsに新しいquery・pageの値が入った状態でこの関数全体が動き直す
 *
 * ③ fetchInvoicesPages(query) で新しいクエリ条件に合わせた総ページ数を計算する
 *    → この値はPaginationに渡すためだけに存在する(Tableは自分でページ数を計算しない)
 *
 * ④ query・currentPageをTableに渡す
 *    → TableがDBから絞り込んだ請求書一覧を取得して表示する(table.tsx)
 *    → Suspenseがデータ取得完了まで InvoicesTableSkeleton を表示する
 *
 * ⑤ totalPagesをPaginationに渡す
 *    → Paginationが総ページ数に合ったページ番号ナビを表示する(pagination.tsx)
 *    → Paginationは現在ページをuseSearchParamsでURLから自分で読み取る
 *
 * 【ページ番号クリック時の流れ】
 *    Paginationのクリック → URLの page パラメータだけが変わる → ②〜⑤と同じ流れで更新される
 */
export default async function DashboardInvoicesPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  // ─── ② URLの変化を受けてこのServer Componentがサーバーで再実行される ───────────────────────
  // Next.js 15以降、searchParamsなど動的なAPIはPromiseとして渡されるようになった
  // awaitで中身を取り出してから使う
  // (変更理由: サーバーがリクエストを受け取る前にレスポンスの準備を始められるよう非同期化された)
  const searchParams = await props.searchParams;
  // searchParamsがundefined(初回アクセスなどURLにパラメータがない場合)のとき空文字を使い、全件取得する
  const query = searchParams?.query || '';
  // pageパラメータがない場合は1ページ目として扱う
  const currentPage = Number(searchParams?.page) || 1;
  // ─── ③ クエリ条件を踏まえた総ページ数を計算する(Paginationに渡すため) ───────────────────────
  const totalPages = await fetchInvoicesPages(query);

  // プロジェクト規約: 戻り値は直接returnせず変数に代入してからreturnする
  // ブレークポイントで戻り値を確認できるようにするためのデバッグ配慮
  const page = (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        {/* ① ユーザーが入力する起点。入力後300msでURLが更新され、②の再実行が始まる */}
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      {/* ④ query・currentPageを受け取ったTableがDBから絞り込みデータを取得して表示する
          Suspense: Tableのデータ取得が完了するまでの間、スケルトンを表示する
          key={query + currentPage}が変わるたびにSuspenseが新しい読み込みとみなしスケルトンを再表示する */}
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        {/* ⑤ totalPagesを受け取ったPaginationがページ番号ナビを表示する
            現在ページはPaginationがURLからuseSearchParamsで自分で読み取る */}
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
  return page;
}