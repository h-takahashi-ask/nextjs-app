/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【概要】ログインフォームから呼ばれる認証処理のServer Action
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【概要】NextAuthのsignIn()を呼び出し、エラー種別に応じたメッセージを返す
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【関連】src/lib/auth/nextauth.ts            : signInをエクスポートしているNextAuthインスタンス
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【関連】src/components/login/login-form.tsx : useActionStateでこの関数を呼ぶフォームコンポーネント
 *
 * @remarks
 * 'use server'ディレクティブをファイル先頭に書くと、ファイル内のすべてのexport関数がServer Actionになる
 * Server Actionはサーバー上で実行され、クライアントから直接呼び出すことができる (HTTPエンドポイントが自動生成される)
 * DBアクセスやパスワード検証など、ブラウザに見せてはいけない処理をここに書く
 */
'use server';

import { signIn } from '@/lib/auth/nextauth';
import { AuthError } from 'next-auth';

/**
 * ログインフォームの送信を処理するServer Action
 *
 * @param _prevState - useActionStateが管理する前回のエラーメッセージ (初回は undefined、このActionでは参照しない)
 * @param formData - フォームの入力値 (email / password / redirectTo)
 * @returns エラー時はメッセージ文字列、成功時はリダイレクト例外がthrowされるためreturnしない
 *
 * @remarks
 * NextAuthはログイン成功後のリダイレクトを「例外をthrowする」という独自の仕組みで実装している
 * そのためtry-catchで全部握りつぶすと、成功してもリダイレクトされなくなる
 * AuthError (認証失敗) だけcatchしてエラーメッセージを返し、それ以外 (リダイレクト例外など) は必ずthrowし直す
 */
export async function authenticate(
    _prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      // signIn('credentials', formData) で nextauth.ts の authorize() が呼ばれる
      // 成功するとリダイレクト例外が throw され、ブラウザが /dashboard へ遷移する
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        // 認証失敗時: エラー種別に応じたメッセージを return → useActionState の state に反映
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      // 認証成功後のリダイレクト例外など AuthError 以外は必ず再 throw する
      throw error;
    }
  }
