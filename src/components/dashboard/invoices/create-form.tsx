/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書作成フォーム】【概要】新規請求書を作成するフォームUI部品
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書作成フォーム】【概要】顧客選択・金額入力・ステータス選択の3項目を持つ
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書作成フォーム】【関連】src/app/(site)/dashboard/invoices/create/page.tsx : 本コンポーネントを呼び出すページ
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書作成フォーム】【関連】src/lib/actions/invoices.ts : createInvoice Server Action
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書作成フォーム】【関連】src/components/common/button.tsx : 送信ボタン
 */

// 'use client': useActionState(Reactフック)を使うため Client Component にする必要がある
'use client';

import { useActionState } from 'react';
import { CustomerField } from '@/lib/types';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/common/button';
import { createInvoice, type State } from '@/lib/actions/invoices';

/**
 * 新規請求書の作成フォームコンポーネント
 *
 * @param customers - ドロップダウンに表示する顧客一覧。親の create/page.tsx がサーバー側で取得して渡す
 *
 * @remarks
 * 【useActionState によるバリデーションエラー表示の流れ】
 *
 * ① ユーザーがフォームを送信する
 * ② createInvoice(prevState, formData) がサーバーで実行される
 * ③ バリデーション失敗時: `{ errors: { customerId: ['...'] }, message: '...' }` を return する
 * ④ useActionState が受け取った戻り値を state として保持する
 * ⑤ state.errors を参照してフィールドの下にエラーメッセージを表示する
 *
 * バリデーション成功時は createInvoice 内で redirect() が呼ばれるため、
 * state が更新されることなく一覧ページに遷移する
 */
export default function Form({ customers }: { customers: CustomerField[] }) {
  // initialState: useActionState の初期値。フォーム初回表示時(まだ送信前)の state として使われる
  // errors: {} にしておくことでエラーメッセージ領域が空の状態から始まる
  const initialState: State = { message: null, errors: {} };

  // useActionState: Server Action とフォームの状態を紐づける React フック
  // - state    : Server Action が最後に return した値(バリデーション結果など)
  //              初回は initialState がそのまま入る
  // - formAction: フォームの action 属性に渡す関数
  //              送信時に createInvoice(prevState, formData) をサーバーで呼び出す
  const [state, formAction] = useActionState(createInvoice, initialState);

  const form = (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            {/* name="customerId": フォーム送信時にこのフィールドの値が "customerId" というキーで渡される */}
            {/* defaultValue="": 非制御入力として「初期表示では何も選択されていない」状態を表す */}
            {/* aria-describedby="customer-error": このフィールドの補足説明が
                id="customer-error" の要素にあることをスクリーンリーダーに伝える
                エラーが表示されたとき、スクリーンリーダーは入力欄に続けてエラーメッセージも読み上げる */}
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="customer-error"
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {/* id="customer-error": aria-describedby と対応する ID。スクリーンリーダーが参照する
              aria-live="polite": 内容が動的に変わることを宣言する。"polite" は現在の読み上げを
              中断せず、読み終わってからエラーメッセージを読み上げる(穏やかな割り込み)
              aria-atomic="true": 要素内容が変わったとき変更部分だけでなく要素全体を読み上げる
              エラーメッセージを断片ではなく完全な文として伝えるために指定する */}
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {/* state.errors?.customerId: Server Action から返ってきたエラー配列
                ?.でoptional chaining: errors が undefined(初回表示・成功時)でも安全にアクセスできる
                配列になっているのは同じフィールドに複数エラーが重なる可能性があるため */}
            {state.errors?.customerId &&
              state.errors.customerId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              {/* aria-describedby="amount-error": エラー表示領域との紐づけ(customer と同じ仕組み) */}
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="amount-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="amount-error" aria-live="polite" aria-atomic="true">
              {state.errors?.amount &&
                state.errors.amount.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        {/* fieldset: 関連するフォーム要素をグループ化するHTML要素
            legend: スクリーンリーダーがラジオボタンを読み上げる際にグループ名も合わせて読み上げる */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                {/* name="status": 同じ name のラジオボタンは1つしか選べないグループになる */}
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                {/* aria-describedby="status-error": fieldset全体のエラーをこのラジオに紐づける */}
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby="status-error"
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status &&
              state.errors.status.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </fieldset>
      </div>

      {/* state.message: DB エラーなど全体に関わるメッセージを表示する領域
          フィールド個別エラーは state.errors に入るが、
          「作成に失敗しました」のような全体メッセージはここに表示する */}
      {state.message && (
        <p className="mt-2 text-sm text-red-500">{state.message}</p>
      )}

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
  return form;
}
