/**
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ブログ記事】【概要】ブログ個別記事ページ(URLパス: /blog/[slug])を表示するページコンポーネント
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ブログ記事】【概要】URLのslugパラメータをもとに対応する記事を特定して表示する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Page】【ブログ記事】【関連】src/app/layout.tsx : 本ページを包むルートレイアウト
 */

/**
 * ブログ個別記事のUIを構築するコンポーネント
 *
 * @param params - URLパラメータのPromise
 *                 slug: URLの動的セグメント(/blog/[slug]の[slug]部分)
 *
 * @remarks
 * [slug]はURLの可変部分で、たとえば/blog/my-first-postにアクセスするとslug = "my-first-post"が渡される
 * paramsはPromise型で提供されるためawaitで解決してから使う(Next.js 16からの仕様)
 * コンポーネントをasync functionにしているのはawaitが必要なため
 */
export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const page = <div>My Post: {slug}</div>;
    return page;
}