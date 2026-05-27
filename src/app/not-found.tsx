/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【404エラー】【概要】存在しないURLにアクセスした際に表示される404エラーページ
 * 【Next.jsキャッチアップ】【Frontend】【Page】【404エラー】【概要】Next.jsはURLが一致するpage.tsxを見つけられない場合にnot-found.tsxを自動で表示する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【404エラー】【関連】src/app/layout.tsx : 本ページを包むルートレイアウト
 */
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
}

/**
 * 404エラーページのUIを構築するコンポーネント
 *
 * @remarks
 * not-found.tsxというファイル名にするだけで、存在しないURLにアクセスした際にNext.jsが自動でこのページを表示する
 * コード内でnotFound()関数を呼び出した場合にも同じページが表示される
 */
export default function NotFoundPage() {
  const page = (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50">
      {/* 背景装飾: ページに奥行きを出すぼかしグラデーション */}
      {/* aria-hiddenでスクリーンリーダーからは非表示にしてアクセシビリティを保つ */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-blue-500 opacity-10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-400 opacity-10 blur-3xl" />
      </div>

      <div className="px-6 text-center lg:px-8">
        {/* エラーコードラベル */}
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          Error
        </p>

        {/* 404 メインビジュアル */}
        <p className="mt-2 text-[9rem] font-black leading-none tracking-tight text-gray-900 sm:text-[14rem]">
          404
        </p>

        {/* アクセントライン */}
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-blue-500" />

        {/* ページタイトル */}
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
          Page Not Found
        </h1>

        {/* 説明文 */}
        <p className="mt-3 text-base leading-7 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* ホームへ戻るCTAボタン */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-400"
          >
            ← Go back home
          </Link>
        </div>
      </div>
    </main>
  );
  return page;
}
