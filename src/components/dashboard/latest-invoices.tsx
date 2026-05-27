/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【最新請求書】【概要】最新5件の請求書を顧客アイコン付きで表示するダッシュボードコンポーネント
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【最新請求書】【関連】src/lib/database/queries.ts                     : fetchLatestInvoicesでデータ取得
 * 【Next.jsキャッチアップ】【Frontend】【Component】【最新請求書】【関連】src/app/(site)/dashboard/(overview)/page.tsx    : SuspenseでラップしてLatestInvoicesSkeletonをfallbackに指定
 * 【Next.jsキャッチアップ】【Frontend】【Component】【最新請求書】【関連】src/components/common/skeletons.tsx             : LatestInvoicesSkeletonがSuspense中に表示される
 */
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import { lusitana } from '@/components/common/fonts';
import { fetchLatestInvoices } from '@/lib/database/queries';


/**
 * 最新5件の請求書一覧を構築するサーバーコンポーネント
 *
 * @remarks
 * 'use client'がないためサーバー側で実行されるコンポーネントとして動作し、fetchLatestInvoices()でDBから直接データを取得する
 * page.tsxのSuspense内に置かれており、このコンポーネントが解決するまでLatestInvoicesSkeletonが表示される
 */
export default async function LatestInvoices() {
  const latestInvoices = await fetchLatestInvoices();
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Invoices
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {latestInvoices.map((invoice, i) => {
            return (
              <div
                key={invoice.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  <Image
                    src={invoice.image_url}
                    alt={`${invoice.name}'s profile picture`}
                    className="mr-4 rounded-full"
                    width={32}
                    height={32}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {invoice.name}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {invoice.email}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base`}
                >
                  {invoice.amount}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}