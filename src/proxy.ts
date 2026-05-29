/**
 * 【Next.jsキャッチアップ】【Frontend】【Proxy】【ログイン認証】【概要】全リクエストをページ描画前に横断し、未認証アクセスを/loginへリダイレクトするProxy
 * 【Next.jsキャッチアップ】【Frontend】【Proxy】【ログイン認証】【概要】NextAuthのauth()をそのままexportすることでセッションなしなら/loginへ自動リダイレクトする
 *
 * 【Next.jsキャッチアップ】【Frontend】【Proxy】【ログイン認証】【関連】src/lib/auth/auth.config.ts : Edgeランタイムで動かすための軽量な認証設定
 *
 * @remarks
 * proxy.tsはNext.jsのファイル規約
 * src/proxy.tsに置くだけでリクエストごとに自動実行される（旧名はsrc/middleware.ts）
 * ページコンポーネントより先に実行されるため、認証・リダイレクト・ヘッダー操作に使う
 *
 * EdgeランタイムとはVercelのCDNエッジサーバーで動く軽量な実行環境
 * 通常のNode.jsサーバーではなく世界中のCDNノードで並列実行されるため、ユーザーに近い場所で高速に動く
 * ただしNode.js専用の機能（bcrypt・Prisma・ファイルシステムなど）は使えない制約がある
 * auth.config.tsだけをimportするのはこの制約のためで
 * Node.js専用モジュールを含むnextauth.tsの代わりにEdge対応のauth.config.tsだけを参照する
 *
 * matcherはProxyを実行するURLパターンを絞り込む設定
 * api・静的ファイル・画像を除外し、それ以外のすべてのページリクエストで認証チェックを走らせる
 */
import NextAuth from 'next-auth';
import { authConfig } from './lib/auth/auth.config';

// NextAuthのauth関数をProxy関数としてexportする
// Next.jsはこのファイルのdefault exportをProxy関数として認識する
export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  // Proxyを実行しないURLパターン（api・静的ファイル・画像を除外し、それ以外の全ページで認証チェックを実行）
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
