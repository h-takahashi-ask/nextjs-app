/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【404ページ(請求書編集)】【概要】請求書編集ルートの404ページ
 * 【Next.jsキャッチアップ】【Frontend】【Page】【404ページ(請求書編集)】【概要】edit/page.tsx で notFound() が呼ばれたときにこのコンポーネントが表示される
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【404ページ(請求書編集)】【関連】src/app/(site)/dashboard/invoices/[id]/edit/page.tsx : notFound() を呼び出すページ
 */

import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

/**
 * 請求書編集ルート専用の404ページコンポーネント
 *
 * @remarks
 * `not-found.tsx` はNext.jsが予約しているファイル名で、同じルートセグメントまたは
 * 子セグメントで `notFound()` が呼ばれたときに自動的にレンダリングされる
 *
 * このファイルは `[id]/edit/` フォルダに置かれているため、
 * 存在しないIDでアクセスされた場合のみ表示される(他のルートには影響しない)
 *
 * アプリルート直下に置いた `not-found.tsx` はグローバルな404ページになるが、
 * このようにルートごとに置くことでルート専用のメッセージを表示できる
 */
export default function NotFound() {
  const page = (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-gray-400" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested invoice.</p>
      {/* 戻り先は請求書一覧。存在しない請求書の編集ページから直接リンクはできないため */}
      <Link
        href="/dashboard/invoices"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
      >
        Go Back
      </Link>
    </main>
  );
  return page;
}
