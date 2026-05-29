/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【概要】NextAuthのフル設定 - Credentialsプロバイダーでメール・パスワード認証を行う
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【概要】auth / signIn / signOut をexportし、サーバーコンポーネントやServer Actionから利用する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【関連】src/lib/auth/auth.config.ts  : Edgeランタイム用の軽量設定 (このファイルのauthConfigをスプレッドで継承)
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【関連】src/lib/actions/auth.ts      : signInを呼び出すServer Action
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【関連】src/lib/database/client.ts   : Prismaクライアント
 *
 * @remarks
 * Proxy (Edge) とサーバー側で同じルーティングルール (pages / callbacks) を使い回すために
 * { ...authConfig, providers: [...] } でauth.config.tsのルールを引き継ぎつつ
 * Node.jsでしか動かないprovidersだけをここで追加している
 */
import NextAuth from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { getUser } from '@/lib/db/prisma/queries';

/**
 * Credentialsプロバイダーがフォームのメールとパスワードを検証するコールバック
 *
 * @param credentials - フォームから送信された入力値 (email / password を含む)
 * @returns 認証成功時はユーザーオブジェクト、失敗時は null (NextAuthが認証エラーとして扱う)
 *
 * @remarks
 * zodでメール形式・パスワード長を先にバリデーションして無効な入力を弾く
 * バリデーション通過後にDBからユーザーを取得し、bcryptでフォームの平文パスワードとDBのハッシュを安全に比較する
 * userを返すとNextAuthがセッションを発行し、nullを返すと認証失敗となりログインフォームにエラーが返る
 */
async function authorize(credentials: Partial<Record<string, unknown>>) {
  const parsedCredentials = z
    .object({ email: z.email(), password: z.string().min(6) })
    .safeParse(credentials);
  if (parsedCredentials.success) {
    const { email, password } = parsedCredentials.data;
    const user = await getUser(email);
    if (!user) return null;
    // bcrypt.compare: 平文パスワードと DB のハッシュを安全に比較する
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch) return user;
  }
  console.log('Invalid credentials');
  return null;
}

export const { auth, signIn, signOut } = NextAuth({
  // auth.config.ts のルーティングルール (pages / callbacks) を継承
  ...authConfig,
  providers: [Credentials({ authorize })],
});
