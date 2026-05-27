/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【UI型定義】【概要】画面表示とフォーム入出力に使うビュー型・フォーム型の定義
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【UI型定義】【概要】テーブル表示・最新一覧・顧客集計・フォーム入力の4グループを提供する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【UI型定義】【関連】src/lib/database/models.ts  : 元となるDBエンティティ型
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【UI型定義】【関連】src/lib/database/queries.ts : これらの型を返すクエリ関数
 */

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};
