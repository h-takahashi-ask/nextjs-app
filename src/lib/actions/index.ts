/**
 * 【Next.jsキャッチアップ】【Backend】【Server Actions】【エントリーポイント】【概要】全Server Actionをまとめて再エクスポートするバレルファイル
 * 【Next.jsキャッチアップ】【Backend】【Server Actions】【エントリーポイント】【概要】import元を '@/lib/actions' に統一することで、ファイル分割後もインポートパスを変えずに済む
 */

export { createInvoice } from './invoices';
