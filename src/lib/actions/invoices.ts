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
 * Server Action がフォームに返すバリデーション結果の型
 *
 * @remarks
 * errors のキーは Zod の issue.path[0] から動的に生成されるため Record<string, string[]> で受ける
 * フォーム側では state.errors?.customerId のように任意のフィールド名でアクセスできる
 */
export type State = {
  errors?: Record<string, string[]>;
  message?: string | null;
};

/**
 * フォーム送信値のバリデーションスキーマ(Invoice モデル全体の形を定義)
 *
 * @remarks
 * `id` と `date` はサーバー側で生成するため、フォームからは受け取らない
 * それぞれ CreateInvoice / UpdateInvoice を派生させるときに omit で除外する
 */
const FormSchema = z.object({
  id: z.string(),
  // Zod v4 では invalid_type_error が廃止され error に統一された
  customerId: z.string({
    error: '顧客を選択してください',
  }),
  // gt(0): 0以下の金額は無効。フォームの number input は文字列で届くため coerce で数値に変換する
  amount: z.coerce.number().gt(0, { 
    message: '金額は0より大きい値を入力してください' 
  }),
  status: z.enum(['pending', 'paid'], {
    error: 'ステータスを選択してください',
  }),
  // date はサーバーで生成するため常に omit する。DBの型(DateTime)に合わせて z.date() を使う
  date: z.date(),
});

/**
 * 新規請求書をDBに保存するServer Action
 *
 * @param prevState - useActionState が管理する直前の状態。この引数は必須だが関数内では使わない
 *                    useActionState の仕様上、第1引数に必ず前の state が渡される
 * @param formData  - HTMLフォームの送信データ。name属性をキーとして各フィールドの値が含まれる
 *
 * @remarks
 * Server Actionはサーバーで実行されるため、フォームの action={createInvoice} に渡すだけで
 * クライアント側にロジックが漏れることなくDBへの書き込みができる
 *
 * 処理完了後は revalidatePath で請求書一覧ページのキャッシュを破棄し、
 * redirect で一覧ページに戻す
 *
 * 【redirect() を try の外に置く理由】
 * Next.js の redirect() は内部でエラーをスローして動作する特殊な関数
 * try ブロックの中に置くと catch がそのエラーを捕まえてしまい、リダイレクトが無効になる
 * そのため DB 操作だけを try でラップし、redirect() は try の外で呼ぶ
 */
export async function createInvoice(prevState: State, formData: FormData) {
  // フォームから受け取るフィールドのみに絞ったスキーマ(id・dateはサーバー生成のため除外)
  const CreateInvoice = FormSchema.omit({ id: true, date: true });

  // safeParse: バリデーション失敗時に例外をスローせず { success, data, error } を返す
  // parse() は ZodError をスローするため try/catch が必要だが、
  // safeParse() は戻り値で成否を判断できるため if 文だけで扱える
  const validatedFields  = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  if (!validatedFields.success) {
    // issues をフィールド名をキーにした文字列配列オブジェクトに変換する
    // flatten() は Zod v4 で非推奨のため、issues を直接 reduce して同等の形式を作る
    // 例: [{ path: ['amount'], message: '...' }] → { amount: ['...'] }
    const fieldErrors = validatedFields.error.issues.reduce<Record<string, string[]>>(
      (acc, issue) => {
        const key = String(issue.path[0]);
        acc[key] = [...(acc[key] ?? []), issue.message];
        return acc;
      },
      {},
    );
    return {
      errors: fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;

  // DBには金額をセント単位(整数)で保存する
  // Math.round: 浮動小数点誤差を防ぐ(例: 1.01 * 100 = 101.00000000000001 → 101)
  const amountInCents = Math.round(amount * 100);

  // 請求日は現在日時をサーバー側で生成する(フォームからは受け取らない)
  const date = new Date();

  // DB操作のみを try/catch でラップする
  try {
    const invoice = {
      data: { customerId, amount: amountInCents, status, date },
    };
    await prisma.invoice.create(invoice);
  } catch (error) {
    // DB接続エラー・制約違反など、Prismaが投げるエラーをここで捕捉する
    console.error('Database error (createInvoice):', error);
    throw new Error('請求書の作成に失敗しました');
  }

  // redirect() は try の外で呼ぶ。理由は関数の @remarks を参照
  revalidatePath(redirectUrl);
  redirect(redirectUrl);
}

/**
 * 既存請求書をDBで更新するServer Action
 *
 * @param id        - 更新対象の請求書ID。URLの動的セグメント `/invoices/[id]/edit` から取り出した値を
 *                    edit-form.tsx 側で `bind(null, invoice.id)` によって第1引数に自動注入する
 * @param prevState - useActionState が管理する直前の状態(createInvoice と同様、関数内では未使用)
 * @param formData  - HTMLフォームの送信データ
 *
 * @remarks
 * `create` と異なり `date` は更新しない(作成日は変えないため)
 * Prismaの `update` は `where` で更新対象を特定する必要がある点が `create` との違い
 *
 * redirect() を try の外に置く理由は createInvoice の @remarks を参照
 */
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
){
  // 更新では id・date ともにフォームから受け取らないため両方 omit する
  // date を omit することで作成日がそのまま保持される
  const UpdateInvoice = FormSchema.omit({ id: true, date: true });

  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  
  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.issues.reduce<Record<string, string[]>>(
      (acc, issue) => {
        const key = String(issue.path[0]);
        acc[key] = [...(acc[key] ?? []), issue.message];
        return acc;
      },
      {},
    );
    return {
      errors: fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;

  // Math.round: 浮動小数点誤差を防ぐ(例: 1.01 * 100 = 101.00000000000001 → 101)
  const amountInCents = Math.round(amount * 100);

  // DB操作のみを try/catch でラップする
  try {
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
  } catch (error) {
    console.error('Database error (updateInvoice):', error);
    throw new Error('請求書の更新に失敗しました');
  }

  // redirect() は try の外で呼ぶ。理由は createInvoice の @remarks を参照
  revalidatePath(redirectUrl);
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
  
  // TODO: error.tsx(エラー境界)の動作確認用。確認後は削除する
  // throw new Error('Failed to Delete Invoice');

  // DB操作のみを try/catch でラップする
  try {
    // 変数名を query にしているのは、関数名 deleteInvoice と同名にするとシャドウイングになるため
    const query = { where: { id } };
    await prisma.invoice.delete(query);
  } catch (error) {
    console.error('Database error (deleteInvoice):', error);
    throw new Error('請求書の削除に失敗しました');
  }

  // キャッシュ破棄: 削除後の一覧ページを最新状態で表示するためキャッシュを無効化する
  revalidatePath(redirectUrl);
}
