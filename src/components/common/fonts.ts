/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【フォント設定】【概要】アプリ全体で使用するGoogleフォントのインスタンスを定義するモジュール
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【フォント設定】【概要】next/font/googleを使うとフォント読み込み時のレイアウトのズレ(FOUT)が自動防止される
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【フォント設定】【関連】src/app/page.tsx                    : lusitanaを使用
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【フォント設定】【関連】src/components/common/acme-logo.tsx : lusitanaを使用
 */
import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({ 
    subsets: ['latin'], 
    weight: ['400', '700'] 
});
