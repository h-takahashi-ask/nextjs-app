/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【売上グラフ】【概要】過去12ヶ月の月別売上データを棒グラフで表示するダッシュボードコンポーネント
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【売上グラフ】【関連】src/lib/database/queries.ts                     : fetchRevenueでデータ取得
 * 【Next.jsキャッチアップ】【Frontend】【Component】【売上グラフ】【関連】src/lib/utils.ts                                 : generateYAxisでY軸ラベルを生成
 * 【Next.jsキャッチアップ】【Frontend】【Component】【売上グラフ】【関連】src/app/(site)/dashboard/(overview)/page.tsx    : SuspenseでラップしてRevenueChartSkeletonをfallbackに指定
 * 【Next.jsキャッチアップ】【Frontend】【Component】【売上グラフ】【関連】src/components/common/skeletons.tsx             : RevenueChartSkeletonがSuspense中に表示される
 *
 * @remarks
 * 本コンポーネントはCSSのみで実装した簡易グラフ。本格的なグラフライブラリを使う場合は以下を参照:
 * https://www.tremor.so/ / https://www.chartjs.org/ / https://airbnb.io/visx/
 */
import { generateYAxis } from '@/lib/utils';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/components/common/fonts';
import { fetchRevenue } from '@/lib/db/prisma/queries';

/**
 * 月別売上棒グラフを構築するサーバーコンポーネント
 *
 * @remarks
 * 'use client'がないためサーバー側で実行されるコンポーネントとして動作し、fetchRevenue()でDBから直接データを取得する
 * page.tsxのSuspense内に置かれており、このコンポーネントが解決するまでRevenueChartSkeletonが表示される
 */
export default async function RevenueChart() {
  const revenue = await fetchRevenue();

  if (!revenue || revenue.length === 0) {
    const noData = <p className="mt-4 text-gray-400">No data available.</p>;
    return noData;
  }

  const chartHeight = 350;
  const { yAxisLabels, topLabel } = generateYAxis(revenue);

  const revenueChart = (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {revenue.map((month) => (
            <div key={month.month} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-blue-300"
                style={{
                  height: `${(chartHeight / topLabel) * month.revenue}px`,
                }}
              ></div>
              <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                {month.month}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Last 12 months</h3>
        </div>
      </div>
    </div>
  );
  return revenueChart;
}
