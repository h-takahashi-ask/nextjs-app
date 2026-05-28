/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【エラー境界(請求書)】【概要】請求書ルート配下で予期しないエラーが発生したときに表示するエラー画面
 * 【Next.jsキャッチアップ】【Frontend】【Page】【エラー境界(請求書)】【概要】このファイルが置かれた /invoices 以下のルート全体をエラー境界でラップする
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【エラー境界(請求書)】【関連】src/lib/actions/invoices.ts : エラーをスローする Server Action
 * 【Next.jsキャッチアップ】【Frontend】【Page】【エラー境界(請求書)】【関連】src/app/(site)/dashboard/invoices/[id]/edit/not-found.tsx : 404専用のエラーページ
 */

// 'use client': React のエラー境界(Error Boundary)はクライアント側の機能のため必須
// サーバーコンポーネントではエラー境界を実装できない
'use client';

import { useEffect } from 'react';

/**
 * 請求書ルート配下のエラー境界コンポーネント
 *
 * @param error - キャッチされたエラーオブジェクト
 *               `digest` はサーバーサイドエラーをクライアントに安全に伝えるためのハッシュ値(任意)
 *               実際のエラー内容はサーバーログにだけ記録され、ブラウザには漏れない
 * @param reset - エラー境界をリセットしてルートの再レンダリングを試みる関数
 *               ページ全体のリロードではなく、該当セグメントだけを再試行する
 *
 * @remarks
 * `error.tsx` はNext.jsが予約しているファイル名
 * 置かれたフォルダ以下のルートセグメントをReactのエラー境界で自動的にラップする
 *
 * 【エラー境界の動作フロー】
 * ① Server Action や fetchXxx でエラーがスローされる
 * ② Next.jsがエラーを捕捉し、このコンポーネントを表示する
 * ③ ユーザーが「Try again」を押すと reset() が呼ばれてセグメントを再レンダリングする
 *
 * 【適用範囲】
 * このファイルは `/dashboard/invoices/` に置かれているため
 * `/dashboard/invoices/*` 全体(一覧・作成・編集)のエラーを捕捉する
 * ダッシュボード全体やサイドナビなどには影響しない
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーの内容を外部のエラー収集サービス(Sentry等)に送る場合はここで行う
    // 現状はコンソールへの出力のみ
    console.error(error);
  // error が変わるたびに再実行する(同じエラーを重複ログしないため依存配列に含める)
  }, [error]);

  const page = (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      {/* reset(): ページ全体をリロードせず、このセグメントだけ再レンダリングを試みる
          一時的なDB接続エラーなど、再試行で回復できるケースに有効 */}
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
  return page;
}
