/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書作成フォーム】【概要】新規請求書を作成するフォームUI部品
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書作成フォーム】【概要】顧客選択・金額入力・ステータス選択の3項目を持つ
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書作成フォーム】【関連】src/app/(site)/dashboard/invoices/create/page.tsx : 本コンポーネントを呼び出すページ
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書作成フォーム】【関連】src/components/common/button.tsx : 送信ボタン
 */

import { CustomerField } from '@/lib/types';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/common/button';
import { createInvoice } from '@/lib/actions';

/**
 * 新規請求書の作成フォームコンポーネント
 *
 * @param customers - ドロップダウンに表示する顧客一覧。親の create/page.tsx がサーバー側で取得して渡す
 *
 * @remarks
 * `'use client'`がないためApp RouterのデフォルトであるServer Componentとして動作する
 * サーバーコンポーネントのままにすることで、顧客データの取得ロジックがブラウザに公開されない
 *
 * 現時点では `<form>` に `action` 属性(Server Action)が設定されていないため、
 * 送信ボタンを押してもデータは保存されない。次の章でServer Actionを追加する予定
 */
export default function Form({ customers }: { customers: CustomerField[] }) {
  const form = (
    <form action={createInvoice}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            {/* name="customerId": フォーム送信時にこのフィールドの値が "customerId" というキーで渡される
                HTMLフォームはname属性をキー、入力値をバリューとしてサーバーに送る */}
            {/* defaultValue="": 非制御入力として「初期表示では何も選択されていない」状態を表す
                value="" にすると React が値を管理する制御入力になり、
                onChange なしだと選択できなくなるため defaultValue を使う */}
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
            >
              {/* value="" disabled: プレースホルダー的な役割。選択不可にすることで
                  「必ずいずれかの顧客を選んだ状態でしか送信できない」ことを促す */}
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {/* pointer-events-none: このアイコンはデコレーション目的のため、
                クリックイベントを受け取らないようにする。クリックが透過して下のselectに届く */}
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              {/* type="number": 数値のみ入力できる。スマートフォンでは数字キーボードが表示される
                  step="0.01": 入力できる最小単位を0.01(セント)にする。小数点2桁まで許可する設定
                  name="amount": 送信時に "amount" というキーで値が渡される */}
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              {/* peer-focus:text-gray-900: inputにpeerクラスが付いており、
                  フォーカスが当たったときにこのアイコンの色が濃くなる(Tailwindのpeer機能)
                  pointer-events-none: アイコンへのクリックを透過させる */}
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        {/* fieldset: 関連するフォーム要素をグループ化するHTML要素
            legend: fieldsetのグループ名。スクリーンリーダーはラジオボタンを読み上げる際に
            legendのテキストも合わせて読み上げるため、アクセシビリティが向上する */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                {/* name="status": 同じname属性を持つラジオボタンは1つしか選べないグループになる
                    value="pending": このラジオボタンが選ばれると "status": "pending" として送信される */}
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                {/* htmlFor="pending": このlabelがid="pending"のinputと紐づく
                    ラベルをクリックするとラジオボタンが選択されるようになる */}
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
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
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        {/* キャンセル時は請求書一覧ページに戻る。<a>タグではなくNext.jsのLinkを使うことで
            ページ全体のリロードを避け、クライアントサイドナビゲーションで遷移する */}
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
