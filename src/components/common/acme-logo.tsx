/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【Acmeロゴ】【概要】ヘッダーやサイドナビに表示するAcmeブランドのロゴUI部品
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【Acmeロゴ】【関連】src/app/page.tsx                       : トップページヘッダーで使用
 * 【Next.jsキャッチアップ】【Frontend】【Component】【Acmeロゴ】【関連】src/components/dashboard/sidenav.tsx   : ダッシュボードサイドナビで使用
 * 【Next.jsキャッチアップ】【Frontend】【Component】【Acmeロゴ】【関連】src/components/common/fonts.ts         : lusitanaフォントの定義元
 */
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/components/common/fonts';

/**
 * GlobeAltIconとAcme文字列を横並びに配置するロゴUI部品
 */
export default function AcmeLogo() {
  const logo = (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      {/* leading-noneは親divに指定した設定 / テキストのデフォルト行間を除去してアイコンと文字の高さをコンテンツに揃える */}
      {/* rotate-[15deg]: デザインのアクセントとして地球アイコンをわずかに傾ける */}
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px]">Acme</p>
    </div>
  );
  return logo;
}
