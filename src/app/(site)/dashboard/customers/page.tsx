/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【顧客一覧】【概要】顧客一覧ページ(URLパス: /dashboard/customers)を表示するページコンポーネント
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【顧客一覧】【関連】src/app/(site)/dashboard/layout.tsx : 本ページを包むダッシュボードレイアウト
 */

import { fetchFilteredCustomers } from '@/lib/database/queries';
import CustomersTable from '@/components/dashboard/customers/table';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customers',
};

/**
 * 顧客一覧ページのUIを構築するコンポーネント
 *
 * @remarks
 * DashboardLayoutのchildrenとしてレンダリングされる
 * /dashboard/customersにアクセスした際にこのコンポーネントの内容がlayout.tsxのchildren位置に差し込まれる
 */
export default async function DashboardCustomersPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

  const customers = await fetchFilteredCustomers(query);

  return (
    <main>
      <CustomersTable customers={customers} />
    </main>
  );
}