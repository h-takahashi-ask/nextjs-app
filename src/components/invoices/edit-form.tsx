/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書編集フォーム】【概要】既存請求書を編集するフォームUI部品
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書編集フォーム】【概要】DBから取得した現在値を各フィールドの初期値として表示する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書編集フォーム】【関連】src/app/(site)/dashboard/invoices/[id]/edit/page.tsx : 本コンポーネントを呼び出すページ
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書編集フォーム】【関連】src/lib/actions/invoices.ts : updateInvoice Server Action
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書編集フォーム】【関連】src/components/invoices/create-form.tsx : 作成フォーム(構成が類似)
 */

// 'use client': updateInvoice.bind() でServer Actionに invoice.id を束縛するため
// Client Componentとして宣言する必要がある
'use client';

import { CustomerField, InvoiceForm } from '@/lib/types';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/components/common/button';
import { updateInvoice } from '@/lib/actions/invoices';

/**
 * 請求書編集フォームコンポーネント
 *
 * @param invoice   - 編集対象の請求書データ。各フィールドの初期値として使用する
 * @param customers - 顧客ドロップダウンに表示する一覧
 *
 * @remarks
 * Server Actionの `updateInvoice(id, formData)` はフォームの `action` 経由では
 * `formData` しか受け取れない。そこで `bind(null, invoice.id)` を使い、
 * `id` を第1引数に固定した新しい関数を作ってから `action` に渡す
 *
 * 【bind の仕組み】
 * ```
 * updateInvoice.bind(null, invoice.id)
 * // ↑ これは以下と同じ意味になる関数を生成する
 * (formData) => updateInvoice(invoice.id, formData)
 * ```
 * フォーム送信時に `formData` だけが自動で渡されるが、
 * `id` はすでに束縛済みのため `updateInvoice` は両方の引数を受け取れる
 */
export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm;
  customers: CustomerField[];
}) {
  // bind(null, invoice.id): updateInvoice の第1引数(id)を invoice.id で固定した関数を生成する
  // null は bind の第1引数(thisの値)。Server Actionは this を使わないため null を渡す
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);

  const form = (
    // action={updateInvoiceWithId}: フォーム送信時に updateInvoiceWithId(formData) が呼ばれる
    // → 内部で updateInvoice(invoice.id, formData) が実行される
    <form action={updateInvoiceWithId}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            {/* defaultValue={invoice.customer_id}: DBから取得した現在の顧客IDを初期選択状態にする
                create-form の defaultValue="" と異なり、既存データで選択済みの状態から始まる */}
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={invoice.customer_id}
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
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              {/* defaultValue={invoice.amount}: DBから取得した現在の金額を入力欄の初期値にする
                  DBではセント単位で保存されているため、表示時にドル単位に変換されている想定 */}
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={invoice.amount}
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                {/* defaultChecked={invoice.status === 'pending'}: 現在のステータスが 'pending' なら
                    このラジオボタンをチェック済みの状態で表示する
                    create-form にはなかった初期選択の仕組みで、編集フォーム固有の違い */}
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  defaultChecked={invoice.status === 'pending'}
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
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  defaultChecked={invoice.status === 'paid'}
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
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Invoice</Button>
      </div>
    </form>
  );
  return form;
}
