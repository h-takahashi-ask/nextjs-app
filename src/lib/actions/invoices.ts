'use server';

/**
 * 【Next.jsキャッチアップ】【Backend】【Server Actions】【請求書操作】【概要】請求書の作成・更新・削除を行うServer Action群
 * 【Next.jsキャッチアップ】【Backend】【Server Actions】【請求書操作】【概要】'use server'ディレクティブにより、これらの関数はサーバー側でのみ実行される
 *
 * 【Next.jsキャッチアップ】【Backend】【Server Actions】【請求書操作】【関連】src/components/invoices/create-form.tsx : createInvoiceを呼び出すフォーム
 * 【Next.jsキャッチアップ】【Backend】【Server Actions】【請求書操作】【関連】src/components/invoices/edit-form.tsx : updateInvoiceを呼び出すフォーム
 * 【Next.jsキャッチアップ】【Backend】【Server Actions】【請求書操作】【関連】src/app/(site)/dashboard/invoices/[id]/edit/page.tsx : 編集ページ
 */

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/database/client';

// 請求書一覧ページのURL。revalidatePath と redirect の両方で使うため定数化
const redirectUrl = '/dashboard/invoices';

/**
 * フォーム送信値のバリデーションスキーマ(Invoice モデル全体の形を定義)
 *
 * @remarks
 * `id` と `date` はサーバー側で生成するため、フォームからは受け取らない
 * それぞれ CreateInvoice / UpdateInvoice を派生させるときに omit で除外する
 */
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  // gt(0): 0以下の金額は無効。フォームの number input は文字列で届くため coerce で数値に変換する
  amount: z.coerce.number().gt(0, { message: '金額は0より大きい値を入力してください' }),
  status: z.enum(['pending', 'paid']),
  // date はサーバーで生成するため常に omit する。DBの型(DateTime)に合わせて z.date() を使う
  date: z.date(),
});


/**
 * 新規請求書をDBに保存するServer Action
 *
 * @param formData - HTMLフォームの送信データ。name属性をキーとして各フィールドの値が含まれる
 *
 * @remarks
 * Server Actionはサーバーで実行されるため、フォームの action={createInvoice} に渡すだけで
 * クライアント側にロジックが漏れることなくDBへの書き込みができる
 *
 * 処理完了後は revalidatePath で請求書一覧ページのキャッシュを破棄し、
 * redirect で一覧ページに戻す
 */
export async function createInvoice(formData: FormData) {

  // フォームから受け取るフィールドのみに絞ったスキーマ(id・dateはサーバー生成のため除外)
  const CreateInvoice = FormSchema.omit({ id: true, date: true });

  // フォームデータを取り出してバリデーション。失敗時は ZodError がスローされる
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // DBには金額をセント単位(整数)で保存する
  // Math.round: 浮動小数点誤差を防ぐ(例: 1.01 * 100 = 101.00000000000001 → 101)
  const amountInCents = Math.round(amount * 100);

  // 請求日は現在日時をサーバー側で生成する(フォームからは受け取らない)
  const date = new Date();

  const invoice = {
    data: {
      customerId,
      amount: amountInCents,
      status,
      // date はサーバーで生成するため常に omit する。DBの型(DateTime)に合わせて z.date() を使う
      date,
    },
  };
  await prisma.invoice.create(invoice);

  // キャッシュ破棄: 静的にキャッシュされた請求書一覧ページを無効化して最新データを表示させる
  revalidatePath(redirectUrl);
  // 作成完了後は請求書一覧ページにリダイレクトする
  redirect(redirectUrl);
}

/**
 * 既存請求書をDBで更新するServer Action
 *
 * @param id       - 更新対象の請求書ID。URLの動的セグメント `/invoices/[id]/edit` から取り出した値を
 *                   edit-form.tsx 側で `bind(null, invoice.id)` によって第1引数に自動注入する
 * @param formData - HTMLフォームの送信データ
 *
 * @remarks
 * `create` と異なり `date` は更新しない(作成日は変えないため)
 * Prismaの `update` は `where` で更新対象を特定する必要がある点が `create` との違い
 */
export async function updateInvoice(id: string, formData: FormData) {
  // 更新では id・date ともにフォームから受け取らないため両方 omit する
  // date を omit することで作成日がそのまま保持される
  const UpdateInvoice = FormSchema.omit({ id: true, date: true });

  // フォームデータを取り出してバリデーション。失敗時は ZodError がスローされる
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // Math.round: 浮動小数点誤差を防ぐ(例: 1.01 * 100 = 101.00000000000001 → 101)
  const amountInCents = Math.round(amount * 100);

  const invoice = {
    // where: 更新対象のレコードをIDで特定する。createにはwhereは不要だがupdateでは必須
    where: { id },
    data: {
      customerId,
      amount: amountInCents,
      status,
      // date は意図的に含めない。作成日を上書きせず、最初に保存した日付を維持する
    },
  };
  await prisma.invoice.update(invoice);

  // キャッシュ破棄: 更新後の一覧ページを最新状態で表示するためキャッシュを無効化する
  revalidatePath(redirectUrl);
  // 更新完了後は請求書一覧ページにリダイレクトする
  redirect(redirectUrl);
}


/**
 * 請求書をDBから削除するServer Action
 *
 * @param id - 削除対象の請求書ID。buttons.tsx で `bind(null, id)` によって自動注入される
 *
 * @remarks
 * 削除後は revalidatePath でキャッシュを破棄して一覧を最新状態にする
 * redirect は不要。削除ボタンは一覧ページ上にあるため、現在のページに留まる
 */
export async function deleteInvoice(id: string) {
  // 変数名を query にしているのは、関数名 deleteInvoice と同名にするとシャドウイングになるため
  const query = {
    where: { id },
  };
  await prisma.invoice.delete(query);
  // キャッシュ破棄: 削除後の一覧ページを最新状態で表示するためキャッシュを無効化する
  revalidatePath(redirectUrl);
}