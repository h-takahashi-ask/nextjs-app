/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書ステータス】【概要】請求書の支払い状態(未払い・支払済み)をバッジで表示するUI部品
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書ステータス】【関連】src/components/invoices/table.tsx : 本コンポーネントの利用箇所
 */

import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

/**
 * 請求書の支払い状態をバッジで表示するコンポーネント
 *
 * @param status - 支払い状態 `'pending'`(未払い)または `'paid'`(支払済み)
 *
 * @remarks
 * clsxはCSSクラスを条件付きで結合するユーティリティ関数
 * オブジェクト形式 `{ 'クラス名': 条件 }` で「条件がtrueのときそのクラスを適用する」と書ける
 * 基本クラス(形・サイズ)と条件付きクラス(色)を一か所にまとめて管理できる
 * 未払いはグレー+時計アイコン、支払済みはグリーン+チェックアイコンで視覚的に区別する
 */
export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-gray-100 text-gray-500': status === 'pending',
          'bg-green-500 text-white': status === 'paid',
        },
      )}
    >
      {status === 'pending' ? (
        // <>: Reactフラグメント。複数の要素(テキスト+アイコン)をDOMノードを増やさずにまとめる記法
        // Reactでは複数要素を返す場合に必ず一つの親要素で囲む必要があるが、
        // <div>などで囲むとバッジのレイアウトが崩れるため、DOMに出力されないフラグメントを使っている
        <>
          Pending
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {status === 'paid' ? (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}
