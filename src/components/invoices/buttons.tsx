/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書操作ボタン】【概要】請求書一覧画面で使う操作ボタン(新規作成・更新・削除)のUI部品
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書操作ボタン】【関連】src/components/invoices/table.tsx : UpdateInvoice / DeleteInvoiceの利用箇所
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書操作ボタン】【関連】src/app/(site)/dashboard/invoices/page.tsx : CreateInvoiceの利用箇所
 */

// 'use client': DeleteInvoice で useRef(dialogの参照)と onClick を使うため Client Component にする
// CreateInvoice / UpdateInvoice は Link のみで状態不要だが、同一ファイルのため一緒にクライアント化する
'use client';

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { deleteInvoice } from '@/lib/actions/invoices';
import { formatCurrency, formatDateToLocal } from '@/lib/utils';
import InvoiceStatus from '@/components/invoices/status';
import { InvoicesTable } from '@/lib/types';

/**
 * 新規請求書作成画面へ遷移するリンクボタン
 *
 * @remarks
 * モバイルではアイコンのみ表示し、PCではテキスト+アイコンで表示する
 * focus-visible:outline-* はキーボード(Tabキー)でフォーカスが当たったときのみ外枠を表示する
 * マウスクリックでは表示されないため、キーボード操作ユーザーへのアクセシビリティ対応
 */
export function CreateInvoice() {
  const button = (
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
  return button;
}

/**
 * 請求書の編集画面へ遷移するリンクボタン
 *
 * @param id - 編集対象の請求書ID
 */
export function UpdateInvoice({ id }: { id: string }) {
  const button = (
    <Link
      href={`/dashboard/invoices/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
  return button;
}

/**
 * 請求書を削除するボタン。クリックで確認モーダルを表示し、確認後に削除を実行する
 *
 * @param invoice - 削除対象の請求書データ。モーダルの表示と削除アクションに使う
 *
 * @remarks
 * HTML標準の `<dialog>` 要素をモーダルとして使う
 * `showModal()` で開くと backdrop(背景オーバーレイ)が自動で表示され、
 * Escキーで閉じる・フォーカストラップなどのアクセシビリティ機能が組み込みで動作する
 *
 * Server Actionへの id の渡し方は edit-form と同じ bind パターンを使う
 */
export function DeleteInvoice({ invoice }: { invoice: InvoicesTable }) {
  // useRef: <dialog> DOM要素への参照を保持する
  // dialogRef.current?.showModal() / .close() でモーダルの開閉を制御する
  const dialogRef = useRef<HTMLDialogElement>(null);

  // bind(null, invoice.id): deleteInvoice の第1引数(id)を固定した関数を生成する
  // フォーム送信時に formData だけが渡されるが、id はすでに束縛済みのため両方の引数を受け取れる
  const deleteInvoiceWithId = deleteInvoice.bind(null, invoice.id);

  const button = (
    <>
      {/* ゴミ箱アイコンのボタン: クリックで確認ダイアログを開く(まだ削除は実行しない) */}
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>

      {/* <dialog>: HTML標準のモーダルダイアログ要素
          showModal() で開いた場合のみ backdrop(背景オーバーレイ)が表示される
          backdrop: Tailwindの backdrop: バリアントで ::backdrop 疑似要素にスタイルを当てる
          w-full max-w-md: 横幅を最大 448px に制限しつつ、小さい画面では全幅に広がる */}
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-md rounded-lg p-6 shadow-xl backdrop:bg-black/50"
      >
        <p className="mb-1 text-base font-semibold">請求書を削除しますか？</p>
        <p className="mb-4 text-sm text-gray-500">この操作は取り消せません。</p>

        {/* 削除対象の請求書情報 */}
        <dl className="mb-6 divide-y rounded-md border text-sm">
          <div className="flex items-center justify-between px-4 py-2">
            <dt className="text-gray-500">顧客</dt>
            <dd className="flex items-center gap-2 font-medium">
              <Image
                src={invoice.image_url}
                alt={`${invoice.name}'s profile picture`}
                width={24}
                height={24}
                className="rounded-full"
              />
              {invoice.name}
            </dd>
          </div>
          <div className="flex justify-between px-4 py-2">
            <dt className="text-gray-500">金額</dt>
            <dd className="font-medium">{formatCurrency(invoice.amount)}</dd>
          </div>
          <div className="flex justify-between px-4 py-2">
            <dt className="text-gray-500">日付</dt>
            <dd className="font-medium">{formatDateToLocal(invoice.date)}</dd>
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <dt className="text-gray-500">ステータス</dt>
            <dd><InvoiceStatus status={invoice.status} /></dd>
          </div>
        </dl>

        <div className="flex justify-end gap-3">
          {/* キャンセル: dialog を閉じるだけ。削除は実行しない */}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
          >
            キャンセル
          </button>
          {/* 削除確認フォーム: submit で deleteInvoiceWithId(formData) が呼ばれ実際に削除される */}
          <form action={deleteInvoiceWithId}>
            <button
              type="submit"
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              削除する
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
  return button;
}
