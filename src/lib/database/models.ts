/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ドメインモデル】【概要】データベーステーブルの行構造をそのまま表すエンティティ型定義
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ドメインモデル】【概要】User・Customer・Invoice・Revenueの4エンティティを定義する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ドメインモデル】【関連】src/lib/database/queries.ts : 各エンティティを返すクエリ関数
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ドメインモデル】【関連】src/lib/types.ts            : UI表示・フォーム用の派生型
 */

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};
