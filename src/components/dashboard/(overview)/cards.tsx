/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ダッシュボードカード】【概要】ダッシュボードの集計カード4枚を表示するコンポーネント群
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ダッシュボードカード】【概要】CardWrapperがDBからデータを取得し、Cardコンポーネントで1枚ずつ描画する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ダッシュボードカード】【関連】src/lib/database/queries.ts                  : fetchCardDataでデータ取得
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ダッシュボードカード】【関連】src/app/(site)/dashboard/(overview)/page.tsx  : SuspenseでCardWrapperをラップして使用
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ダッシュボードカード】【関連】src/components/common/skeletons.tsx           : CardsSkeleton がSuspense中に表示される
 */
import {
    BanknotesIcon,
    ClockIcon,
    UserGroupIcon,
    InboxIcon,
  } from '@heroicons/react/24/outline';
  import { fetchCardData } from '@/lib/db/prisma/queries';
  import { lusitana } from '@/components/common/fonts';
  
  const iconMap = {
    collected: BanknotesIcon,
    customers: UserGroupIcon,
    pending: ClockIcon,
    invoices: InboxIcon,
  };
  
  /**
   * 集計カード4枚分のデータを取得してCardを並べるサーバーコンポーネント
   *
   * @remarks
   * 'use client'がないためサーバー側で実行されるコンポーネントとして動作し、fetchCardData()でDBから直接データを取得する
   * page.tsxのSuspense内に置かれており、このコンポーネントが解決するまでCardsSkeleton(4枚)が表示される
   */
  export default async function CardWrapper() {
    const {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices,
      totalPendingInvoices,
    } = await fetchCardData();
    return (
      <>
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </>
    );
  }
  
  /**
   * 集計カード1枚を描画するUIコンポーネント
   *
   * @param title - カードのラベル
   * @param value - 表示する集計値
   * @param type - アイコンの種類を決定するキー
   */
  export function Card({
    title,
    value,
    type,
  }: {
    title: string;
    value: number | string;
    type: 'invoices' | 'customers' | 'pending' | 'collected';
  }) {
    const Icon = iconMap[type];
  
    return (
      <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
        <div className="flex p-4">
          {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
          <h3 className="ml-2 text-sm font-medium">{title}</h3>
        </div>
        <p
          className={`${lusitana.className}
            truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {value}
        </p>
      </div>
    );
  }
  