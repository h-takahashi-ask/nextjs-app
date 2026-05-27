/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ユーティリティ】【概要】通貨・日付フォーマットとグラフ・ページネーション用のUI生成ユーティリティ関数群
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ユーティリティ】【概要】売上グラフのY軸ラベル計算とページネーション番号列の生成を提供する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ユーティリティ】【関連】src/lib/database/models.ts                     : Revenue型を参照
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ユーティリティ】【関連】src/components/dashboard/revenue-chart.tsx     : generateYAxisを使用
 */
import { Revenue } from '@/lib/database/models';

/**
 * セント単位の金額を米ドル表記の文字列に変換する
 *
 * @param amount - セント単位の金額 (例: 1234 → "$12.34")
 * @returns 通貨フォーマット済み文字列
 */
export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

/**
 * ISO日付文字列をロケールに合わせた表示形式に変換する
 *
 * @param dateStr - ISO形式の日付文字列 (例: "2024-01-15")
 * @param locale - ロケール文字列 (デフォルト: 'en-US')
 * @returns ロケール対応の日付文字列 (例: "Jan 15, 2024")
 */
export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

/**
 * 売上データからY軸ラベルとグラフ最大値を計算する
 *
 * @param revenue - 月別売上データの配列
 * @returns yAxisLabels: 上から順に並んだ "$XK" 形式のラベル配列、topLabel: Y軸の最大値(1000単位で切り上げ)
 *
 * @remarks
 * 最高売上を1000単位で切り上げてY軸の上限とし、そこから1000ずつ減らしたラベルを生成する
 * グラフの棒の高さは `(chartHeight / topLabel) * month.revenue` で算出できる
 */
export const generateYAxis = (revenue: Revenue[]) => {
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

/**
 * ページネーションに表示するページ番号と省略記号の配列を生成する
 *
 * @param currentPage - 現在のページ番号
 * @param totalPages - 総ページ数
 * @returns ページ番号と省略記号を混在させた配列 (例: [1, '...', 4, 5, 6, '...', 10])
 *
 * @remarks
 * 7ページ以下は全て並べ、8ページ以上は現在地によって3パターンで省略記号を挿入する
 * 7という閾値はUIの横幅に収まるページボタン数の上限として設定している
 */
export const generatePagination = (currentPage: number, totalPages: number) => {
  // 7以下は省略なしで全ページを表示できる
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // 先頭寄りの場合: [1, 2, 3, ..., n-1, n]
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // 末尾寄りの場合: [1, 2, ..., n-2, n-1, n]
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // 中間の場合: [1, ..., p-1, p, p+1, ..., n]
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
