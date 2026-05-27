/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボード】【概要】ダッシュボードのトップページ(URLパス: /dashboard)を表示するページコンポーネント
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボード】【関連】src/app/(site)/dashboard/layout.tsx : 本ページを包むダッシュボードレイアウト
 */

import { Card } from '@/components/dashboard/cards';
import RevenueChart from '@/components/dashboard/revenue-chart';
import LatestInvoices from '@/components/dashboard/latest-invoices';
import { lusitana } from '@/components/common/fonts';
import { fetchRevenue, fetchLatestInvoices, fetchCardData } from '@/lib/database/queries';

/**
 * /dashboardのUIを構築するコンポーネント
 *
 * @remarks
 * DashboardLayoutのchildrenとしてレンダリングされる
 * /dashboardにアクセスした際にこのコンポーネントの内容がlayout.tsxのchildren位置に差し込まれる
 */
export default async function Page() {
  const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  const { 
    totalPaidInvoices, 
    totalPendingInvoices, 
    numberOfInvoices, 
    numberOfCustomers 
  } = await fetchCardData();
  
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue}  />
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}