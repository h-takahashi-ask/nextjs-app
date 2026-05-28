/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書操作ボタン】【概要】請求書一覧画面で使う操作ボタン(新規作成・更新・削除)のUI部品
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書操作ボタン】【関連】src/components/invoices/table.tsx : UpdateInvoice / DeleteInvoiceの利用箇所
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書操作ボタン】【関連】src/app/(site)/dashboard/invoices/page.tsx : CreateInvoiceの利用箇所
 */

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * 新規請求書作成画面へ遷移するリンクボタン
 *
 * @remarks
 * モバイルではアイコンのみ表示し、PCではテキスト+アイコンで表示する
 * focus-visible:outline-* はキーボード(Tabキー)でフォーカスが当たったときのみ外枠を表示する
 * マウスクリックでは表示されないため、キーボード操作ユーザーへのアクセシビリティ対応
 */
export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      {/* hidden md:block: テキストはモバイルでは非表示、PCでは表示する
          {' '}: テキストとアイコンの間に半角スペースを挿入する
          JSXではHTMLと異なりタグ間の改行・空白が自動で詰められるため、
          表示上のスペースが必要な場合は明示的に{' '}と書く */}
      <span className="hidden md:block">Create Invoice</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

/**
 * 請求書の編集画面へ遷移するリンクボタン
 *
 * @param id - 編集対象の請求書ID
 */
export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href="/dashboard/invoices"
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

/**
 * 請求書を削除するボタン
 *
 * @param id - 削除対象の請求書ID
 */
export function DeleteInvoice({ id }: { id: string }) {
  return (
    <>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </>
  );
}
