/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボード】【概要】ダッシュボードのトップページ(URLパス: /dashboard)を表示するページコンポーネント
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボード】【概要】3つのセクションをそれぞれSuspenseでラップし、データ取得を独立して並列ストリーミングする
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボード】【関連】src/app/(site)/dashboard/layout.tsx                  : 本ページを包むダッシュボードレイアウト
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボード】【関連】src/app/(site)/dashboard/(overview)/loading.tsx       : ページ全体のフォールバック (Next.jsが自動でSuspenseを生成)
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ダッシュボード】【関連】src/components/common/skeletons.tsx                   : 各SuspenseのfallbackになるSkeletonコンポーネント群
 */

import { Suspense } from 'react';
import CardWrapper from '@/components/dashboard/cards';
import RevenueChart from '@/components/dashboard/revenue-chart';
import LatestInvoices from '@/components/dashboard/latest-invoices';
import DashboardShell from '@/components/dashboard/dashboard-shell';
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardsSkeleton,
} from '@/components/common/skeletons';

/**
 * /dashboardのUIを構築するページコンポーネント
 *
 * @remarks
 * DashboardLayoutのchildrenとしてレンダリングされる
 * /dashboardにアクセスした際にこのコンポーネントの内容がlayout.tsxのchildren位置に差し込まれる
 *
 * ■ Suspense + Streaming の仕組み
 *   <Suspense>で囲まれた子コンポーネント(CardWrapper等)はサーバー側で非同期に実行され、内部でデータ取得を行う
 *   Next.jsはブラウザへのHTML送信を止めずに、データ取得が終わったコンポーネントから順次HTMLに差し込む(ストリーミング)
 *   データ取得中はfallbackに指定したSkeletonが表示され、取得完了後に実際のコンテンツへ自動で切り替わる
 *   各Suspenseが独立して動作するため、遅いコンポーネントが他のコンポーネントの表示をブロックしない
 */
export default async function Page() {
  const page = (
    <DashboardShell>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* CardWrapperが内部でfetchCardDataを呼ぶ。取得中はCardsSkeleton(4枚のカードプレースホルダー)を表示する */}
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* RevenueChartが内部でfetchRevenueを呼ぶ。取得中はチャート形状のSkeletonを表示する */}
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        {/* LatestInvoicesが内部でfetchLatestInvoicesを呼ぶ。取得中はリスト形状のSkeletonを表示する */}
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </DashboardShell>
  );
  return page;
}
