/**
 * 【Next.jsキャッチアップ】【Frontend】【Component】【検索入力】【概要】テキスト入力でURLのクエリパラメータを更新する検索フォームUI部品
 * 【Next.jsキャッチアップ】【Frontend】【Component】【検索入力】【概要】入力文字をURLに反映することで、サーバーコンポーネントが新しいパラメータで再実行されてデータが更新される
 * 【Next.jsキャッチアップ】【Frontend】【Component】【検索入力】【概要】入力のたびにURLが変わると通信が頻発するため、300ms入力が止んだ後にのみURLを更新する
 *
 * 【Next.jsキャッチアップ】【Frontend】【Component】【検索入力】【関連】src/app/(site)/dashboard/invoices/page.tsx : 本コンポーネントの利用画面
 */

// 'use client': このコンポーネントはユーザーのキー入力に反応してURLを書き換えるため
// ブラウザ側でのみ動作するフック(useSearchParams・usePathname・useRouter)が必要
// そのためClient Componentにする必要がある
'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

/**
 * テキスト入力でURLクエリパラメータを更新する検索フォーム
 *
 * @param placeholder - 入力欄に表示するプレースホルダーテキスト
 *
 * @remarks
 * App RouterではURLのクエリパラメータ(`?query=xxx`)が変わるとサーバーコンポーネントが
 * 新しいパラメータで再実行されてデータが更新される
 * 入力のたびにURLが変わると1文字ごとにサーバーへの問い合わせが発生するため、
 * 300ms入力が止んだタイミングでのみURLを更新して処理を間引く
 */
export default function Search({ placeholder }: { placeholder: string }) {
  // useSearchParams: 現在のURLのクエリパラメータ(例: ?query=abc&page=2)を読み取り専用オブジェクトとして取得するフック
  // Client ComponentではServer ComponentのようにpropsでsearchParamsを受け取れないため、
  // クライアント側でURLパラメータを読むにはこのフックを使う必要がある
  const searchParams = useSearchParams();

  // usePathname: 現在のURLのパス部分(例: /dashboard/invoices)を文字列で取得するフック
  // 検索後もURLのパスを維持したまま?以降のクエリ部分だけを書き換えるために使う
  const pathname = usePathname();

  // useRouter: ページ遷移を行うフック
  // replace()を使うことでブラウザの「戻る」履歴を増やさずにURLを書き換えられる
  // push()だと検索するたびに履歴が積まれて「戻る」ボタンを何度も押す必要が生じるためreplaceを選択している
  const { replace } = useRouter();

  // useDebouncedCallback: 連続して呼ばれる処理を「最後の呼び出しからN ms後に1回だけ実行」に変える関数
  // 例: 'apple'と入力すると 'a' 'ap' 'app' 'appl' 'apple' と5回呼ばれるが、
  // 300ms間引くことで入力が落ち着いた'apple'の1回だけURLが変わりサーバーへの問い合わせも1回に絞れる
  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);
    // 現在の全クエリパラメータを引き継いだ上で変更する
    // new URLSearchParams(searchParams)で既存の?page=2&sort=ascなどを保持したまま更新できる
    const params = new URLSearchParams(searchParams);
    // 検索語が変わったときは1ページ目から表示し直す
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      // 入力を空にしたときは空文字をセットするのではなくqueryパラメータ自体を除去する
      // URLを?query=のような中途半端な形にしないためのクリーンアップ
      params.delete('query');
    }
    // ① URLを書き換える → Next.jsがこの変化を検知してpage.tsxをサーバーで再実行する(→ ②へ)
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      {/* htmlFor="search": このlabelがどのinputと対応するかをid属性で紐付けるHTML標準の属性
          sr-only: 視覚的には非表示にしつつスクリーンリーダー(視覚障害者が使う読み上げツール)には
          読み上げられるTailwindクラス。虫眼鏡アイコンだけでは何の入力欄か判別できないため、
          ラベルで「検索欄」であることをスクリーンリーダーに伝えている */}
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      {/* defaultValueにURLのqueryパラメータ値を渡すことで、ページをリロードしたり
          直接URLを開いたとき入力欄に検索語が復元されて表示されるようにする
          valueではなくdefaultValueを使うのは「非制御入力」として扱うため
          valueを使うとReactがinputの値を管理し、state変更のたびに再レンダリングが走る構造になる
          ここでは入力値の管理をURLに任せているため、defaultValueで初期値を渡すだけで十分 */}
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      {/* inputに付いたpeerクラスにより、後続の兄弟要素でpeer-*バリアントが使える
          peer-focus:text-gray-900 は「inputにフォーカスが当たったときにこのアイコンの色を変える」という意味
          Tailwindの仕組みで、CSSの兄弟セレクタ(~)をJavaScriptなしで扱える
          inputとMagnifyingGlassIconは兄弟要素であり、inputの状態変化がアイコンのスタイルに伝わる */}
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
