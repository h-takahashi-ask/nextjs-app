/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書一覧テーブル】【概要】請求書データを一覧形式で表示するテーブルUI部品
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書一覧テーブル】【概要】PCはテーブル表示、モバイルはカード表示でレスポンシブに切り替える
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書一覧テーブル】【関連】src/app/(site)/dashboard/invoices/page.tsx : 本コンポーネントの利用画面(Suspenseでラップされる)
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書一覧テーブル】【関連】src/lib/database/queries.ts : fetchFilteredInvoicesの提供元
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書一覧テーブル】【関連】src/components/invoices/buttons.tsx : 更新・削除ボタン
 * 【Next.jsキャッチアップ】【Frontend】【Component】【請求書一覧テーブル】【関連】src/components/invoices/status.tsx : ステータスバッジ
 */

import Image from 'next/image';
import { UpdateInvoice, DeleteInvoice } from '@/components/invoices/buttons';
import InvoiceStatus from '@/components/invoices/status';
import { formatDateToLocal, formatCurrency } from '@/lib/utils';
import { fetchFilteredInvoices } from '@/lib/database/queries';

/**
 * 請求書データをテーブル形式で表示するサーバーコンポーネント
 *
 * @param query - 検索キーワード。顧客名・メールアドレス・金額等で絞り込む
 * @param currentPage - 表示するページ番号
 *
 * @remarks
 * `'use client'`ディレクティブがないファイルはApp Routerではデフォルトでサーバーコンポーネントになる
 * サーバーコンポーネントはasync関数として定義でき、awaitでデータを直接取得できる
 * 親のpage.tsxがSuspenseでラップしているため、このコンポーネントのデータ取得中はスケルトンUIが表示される
 */
export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const invoices = await fetchFilteredInvoices(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* モバイル専用のカード形式表示 (md=768px以上の画面幅では hidden で非表示)
              情報量の多いテーブルはモバイルで横スクロールになりやすいため、
              モバイルはカード形式、PCはテーブル形式でそれぞれ最適なレイアウトに切り替えている */}
          <div className="md:hidden">
            {/* invoices?. のオプショナルチェーン: invoicesがnullやundefinedの場合に
                mapの呼び出しでエラーが起きるのを防ぐ安全な呼び出し方 */}
            {invoices?.map((invoice) => (
              <div
                key={invoice.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={invoice.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      />
                      <p>{invoice.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{invoice.email}</p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p>{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice invoice={invoice} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* PC専用のテーブル表示 (デフォルトは hidden で非表示、md=768px以上で table として表示)
              上の md:hidden カードと組み合わせて、同じデータをモバイル/PCで別レイアウトで表示している */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                {/* scope="col": このヘッダーセルが「列の見出し」であることをスクリーンリーダーに伝えるHTML標準の属性
                    テーブルを読み上げるとき「Customer列の〇〇」と正しく案内できるようになる */}
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices?.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  {/* [&:first-child>td:first-child]:rounded-tl-lg のような記法はTailwindの任意バリアント
                      [] 内に通常のCSSセレクタを書くことで、Tailwindに用意されていないスタイルも直接指定できる
                      & は現在の要素(tr)を指す。先頭行の左上・右上角と末尾行の左下・右下角だけを丸くしている
                      last-of-type:border-none は最終行の下罫線を消し、テーブルの末尾がすっきり見えるようにする */}
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={invoice.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      />
                      <p>{invoice.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {invoice.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(invoice.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={invoice.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice invoice={invoice} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
