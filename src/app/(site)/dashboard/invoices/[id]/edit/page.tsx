/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書編集】【概要】既存請求書を編集するページ(URLパス: /dashboard/invoices/[id]/edit)
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書編集】【概要】URLの[id]で対象請求書を特定し、現在の値をフォームに初期表示する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書編集】【関連】src/components/invoices/edit-form.tsx : 請求書編集フォーム
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書編集】【関連】src/components/invoices/breadcrumbs.tsx : パンくずナビ
 * 【Next.jsキャッチアップ】【Frontend】【Page】【請求書編集】【関連】src/lib/actions/invoices.ts : updateInvoice Server Action
 */

import Form from '@/components/invoices/edit-form';
import Breadcrumbs from '@/components/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/lib/database/queries';
import { notFound } from 'next/navigation';

/**
 * 請求書編集ページのUIを構築するサーバーコンポーネント
 *
 * @param props.params - URLの動的セグメントを含むPromise。`[id]` フォルダ名がキーになる
 *                       例: /dashboard/invoices/abc-123/edit → params.id = 'abc-123'
 *
 * @remarks
 * フォルダ名を `[id]` のように [] で囲むと動的セグメントになり、
 * 任意の文字列にマッチするURLパターンを1つのファイルで処理できる
 *
 * Next.js 15以降、`params` は非同期になったため `await` が必要
 *
 * `Promise.all` で請求書と顧客一覧を並列取得することで、
 * 逐次 `await` するより合計待ち時間を短縮できる
 * (例: 各100ms → 逐次200ms、並列100ms)
 */
export default async function Page(props: { params: Promise<{ id: string }> }) {
  // Next.js 15以降 params は Promise として渡されるため await で取り出す
  const params = await props.params;
  const id = params.id;

  // Promise.all: 2つのDBクエリを並列実行する
  // - fetchInvoiceById: フォームの初期値として表示する対象請求書のデータを取得
  // - fetchCustomers: 顧客ドロップダウンの選択肢一覧を取得
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  // 指定IDの請求書が存在しない場合は404ページを表示する
  // notFound(): Next.jsが用意する関数で、呼び出すと最寄りの not-found.tsx をレンダリングする
  if (!invoice) notFound();

  const page = (
    <main>
      {/* Breadcrumbs: 「Invoices > Edit Invoice」のように現在地をパス形式で表示するナビゲーション
          hrefにidを含めることで、パンくずが正しい編集ページURLを指すようにする */}
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      {/* invoice: フォームの各フィールドに初期値として表示する既存データ
          customers: 顧客ドロップダウンの選択肢 */}
      <Form invoice={invoice} customers={customers} />
    </main>
  );
  return page;
}
