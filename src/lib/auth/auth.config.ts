/**
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【概要】Edgeランタイム対応のNextAuth軽量設定ファイル
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【概要】Proxy (proxy.ts)から参照するためNode.js専用モジュール (bcrypt / Prisma) を含まない
 *
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【関連】src/lib/auth/nextauth.ts : フル機能のNextAuth設定 (DBアクセス・パスワード検証を含む)
 * 【Next.jsキャッチアップ】【Frontend】【Lib】【ログイン認証】【関連】src/proxy.ts             : この設定を読み込んでEdgeで認証チェックを行う
 *
 * @remarks
 * NextAuthの設定ファイルを2つに分割するのはNext.jsの推奨パターン
 * auth.config.ts (このファイル)  ← Edgeランタイム用 (proxy.tsが参照)
 * nextauth.ts                    ← Node.jsランタイム用 (サーバーコンポーネント・Server Actionが参照)
 *
 * EdgeはCDNに近い軽量な実行環境で高速だがNode.jsの全機能が使えない
 * Proxyは全リクエストをインターセプトするためEdgeで動く
 * そのため重い処理 (DB接続・bcrypt) を持ち込めず、ルーティングルールだけを定義したこのファイルを分離している
 */
import type { NextAuthConfig, Session } from 'next-auth';
import type { NextRequest } from 'next/server';

/**
 * Proxyを経由するリクエストを許可するかどうかを判定するコールバック
 *
 * @param auth - NextAuthのセッション情報、未ログインなら null
 * @param request - 受信したリクエスト (URLパスの判定に使用)
 * @returns true ならそのまま通過、false なら /login へリダイレクト、Response.redirect() なら指定URLへ強制遷移
 *
 * @remarks
 * ダッシュボード配下 (/dashboard/*) への未ログインアクセスは false を返してログインページへ誘導する
 * ログイン済みでトップや /login にアクセスした場合は /dashboard へリダイレクトする
 * 上記以外は未ログインでも通過させる (/ や /login は認証不要のため)
 */
function authorized({ auth, request: { nextUrl } }: { auth: Session | null; request: NextRequest }) {
  const isLoggedIn = !!auth?.user;
  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
  if (isOnDashboard) {
    if (isLoggedIn) return true;
    // 未ログインでダッシュボードにアクセス → /login へリダイレクト
    return false;
  } else if (isLoggedIn) {
    // ログイン済みで / や /login にアクセス → /dashboard へリダイレクト
    return Response.redirect(new URL('/dashboard', nextUrl));
  }
  return true;
}

export const authConfig = {
  pages: {
    // 未認証でダッシュボードにアクセスした際のリダイレクト先を指定
    signIn: '/login',
  },
  callbacks: { authorized },
  // providers はここでは空。実際の認証ロジックは nextauth.ts の Credentials provider に定義する
  providers: [],
} satisfies NextAuthConfig;
