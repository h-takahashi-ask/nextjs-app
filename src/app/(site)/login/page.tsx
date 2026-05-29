/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ログイン】【概要】ログインページ (URLパス: /login) を表示するページコンポーネント
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ログイン】【概要】未認証でダッシュボードにアクセスするとproxy.tsが /login にリダイレクトする
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ログイン】【関連】src/proxy.ts                      : 未認証時に /login へリダイレクトするProxy
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ログイン】【関連】src/components/login/login-form.tsx : フォームUIと認証ロジック
 */
import { Suspense } from 'react';
import AcmeLogo from '@/components/common/acme-logo';
import LoginForm from '@/components/login/login-form';

/**
 * /login のページコンポーネント
 *
 * @remarks
 * LoginFormは`useSearchParams()`を使っているため必ず`<Suspense>`で包む必要がある
 * `useSearchParams()`はURL の ?callbackUrl=... を読む処理でサーバー側レンダリング時に値が確定しない場合があるため
 * Reactが「まだ準備中」として扱えるようSuspenseが必要になる
 */
export default function LoginPage() {
  const page = (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        {/* useSearchParams() を使う CC は必ず Suspense で包む */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
  return page;
}
