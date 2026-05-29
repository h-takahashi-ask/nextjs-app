/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ログインフォーム】【概要】メール・パスワードを入力して認証を行うログインフォーム
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ログインフォーム】【概要】Server Action (authenticate) をフォームのactionに渡し、エラーメッセージをリアクティブに表示する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ログインフォーム】【関連】src/lib/actions/auth.ts         : ログイン処理を行うServer Action
 * 【Next.jsキャッチアップ】【Frontend】【Component】【ログインフォーム】【関連】src/app/(site)/login/page.tsx   : このコンポーネントをSuspenseで包むページ
 */
'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { lusitana } from '@/components/common/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/common/button';
import { authenticate } from '@/lib/actions/auth';

/**
 * メール・パスワードフォームとエラーメッセージ表示を持つログインフォームコンポーネント
 *
 * @remarks
 * `useActionState` (React 19で追加、Server Actionの前回の戻り値と送信中状態を管理するフック) でauthenticateを呼ぶ
 * authenticateがエラーメッセージ文字列を返すとerrorMessageに値が入り画面に表示される
 * proxy.tsが未認証リダイレクト時に付与する ?callbackUrl= クエリを読み取り、ログイン成功後に元のページへ戻す
 */
export default function LoginForm() {
  // ログイン成功後のリダイレクト先 (未指定なら /dashboard)
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // authenticate の戻り値がエラーメッセージ、formAction を form の action に渡す
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    // action に Server Action を直接渡すことで、ブラウザの通常フォーム送信と
    // 同じ感覚で Server Action を呼び出せる (JS がなくても動作する Progressive Enhancement)
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              {/* peer-focus: input にフォーカスが当たると親の .peer を通じてアイコン色が変わる */}
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        {/* ログイン成功後のリダイレクト先を hidden フィールドで Server Action に渡す */}
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        {/* aria-disabled で送信中はボタンを無効化 (disabled と違いフォーカスは維持される) */}
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        {/*
          aria-live="polite"  : 内容が変わったときスクリーンリーダーが読み上げる (アクセシビリティ対応)
          aria-atomic="true"  : 領域全体をひとまとまりとして読み上げる
        */}
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
