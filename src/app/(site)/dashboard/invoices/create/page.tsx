/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書作成】【概要】新規請求書を作成するページ(URLパス: /dashboard/invoices/create)
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書作成】【概要】顧客一覧をサーバーで取得し、作成フォームに渡す
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書作成】【関連】src/components/dashboard/invoices/create-form.tsx : 請求書作成フォーム
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書作成】【関連】src/components/dashboard/invoices/breadcrumbs.tsx : パンくずナビ
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書作成】【関連】src/app/(site)/dashboard/invoices/page.tsx : 請求書一覧(キャンセル時の戻り先)
 */

import Form from '@/components/dashboard/invoices/create-form';
import Breadcrumbs from '@/components/dashboard/invoices/breadcrumbs';
import { fetchCustomers } from '@/lib/database/queries';

/**
 * 請求書作成ページのUIを構築するサーバーコンポーネント
 *
 * @remarks
 * `'use client'`がないためApp RouterのデフォルトであるServer Componentとして動作する
 * async関数にすることでawaitを使いサーバー側でデータを取得してからレンダリングできる
 *
 * 顧客一覧をFormコンポーネント内で取得せず、このページで取得してpropsで渡している
 * Formをサーバーコンポーネントのままにし、クライアント化を避けるため
 * また、フォームが表示された時点で顧客一覧が確実に揃っている状態を保証するため
 */
export default async function Page() {
  // フォームのドロップダウンに表示する顧客一覧をサーバー側で取得する
  // ブラウザからではなくサーバーからDBに直接問い合わせるため、取得ロジックがブラウザに公開されない
  const customers = await fetchCustomers();

  return (
    <main>
      {/* Breadcrumbs: 「Invoices > Create Invoice」のように現在地をパス形式で表示するナビゲーション
          active: true を指定した項目が現在表示中のページとしてハイライトされる */}
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}
