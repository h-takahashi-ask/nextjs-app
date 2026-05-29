/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ボタン】【概要】フォームの送信ボタンとして使う汎用ボタンUI部品
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ボタン】【関連】src/components/dashboard/invoices/create-form.tsx : 請求書作成フォームの送信ボタン
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ボタン】【関連】src/components/dashboard/invoices/edit-form.tsx  : 請求書編集フォームの送信ボタン
 */

import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
