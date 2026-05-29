// 'use client' ディレクティブ: このファイルをクライアントコンポーネントとして宣言する。
// Next.js App Router のコンポーネントはデフォルトでサーバーコンポーネント（ブラウザのAPIや
// useState/useEffect が使えない）。useState や useEffect を使うファイルには必ずこの宣言が必要。
'use client';

// React フックのインポート。フックは "use" で始まる関数で、コンポーネントに機能を追加する。
import { useEffect, useRef, useState, useTransition } from 'react';
// useRouter: Next.js が提供するフック。router.refresh() でサーバーコンポーネントを再取得できる。
import { useRouter } from 'next/navigation';
import { lusitana } from '@/components/common/fonts';

// マジックナンバーを避けるための定数。
// 数値をそのまま書くと意味が分からなくなるため、名前をつけて意図を明確にしている。
const INTERVAL_SECS = 60;

/**
 * ダッシュボード全体を包むクライアントコンポーネント。
 * サーバーコンポーネント(CardWrapper等)を children として受け取り、
 * 自動更新の制御・フィードバック表示・更新中の半透明化を担う。
 *
 * ■ children パターンについて
 *   クライアントコンポーネントは 'use client' のため、内部でサーバーコンポーネントを
 *   直接レンダリングできない。しかし props.children として「外から渡す」形にすると、
 *   サーバーコンポーネントをそのまま子要素として使える。
 *   page.tsx（サーバーコンポーネント）側で children を組み立てて渡しているのはそのため。
 */
export default function DashboardShell({
  children,
}: {
  // React.ReactNode: JSX要素・文字列・null など「Reactが描画できるもの全般」を表す型。
  // children に型をつけることで「JSXを受け取れるコンポーネント」であることを明示できる。
  children: React.ReactNode;
}) {
  // useRouter: Next.js のルーター操作フック。
  // router.refresh() を呼ぶと、現在のルートのサーバーコンポーネントを再実行して
  // 最新データを取得し直す（ページ遷移なしで画面を更新できる）。
  const router = useRouter();

  // useState: コンポーネントの「状態（state）」を管理するフック。
  // 状態が変わると React が自動的に再レンダリングを行う。
  // 構文: const [値, 値を変える関数] = useState(初期値)
  //
  // enabled: トグルのON/OFF。初期値 true = ページ表示時から自動更新が有効。
  const [enabled, setEnabled] = useState(true);

  // useTransition: 「優先度の低い更新」をマークするフック。
  // startTransition でラップした処理は、完了するまで既存の画面表示を維持する
  // （スケルトンを再表示しない）。isPending は処理中かどうかを示す boolean。
  // 構文: const [進行中か, ラップ関数] = useTransition()
  const [isPending, startTransition] = useTransition();

  // countdown: 次の更新まで何秒かを表示するためのカウンター。
  // 初期値は INTERVAL_SECS（60）。カウントダウン中に useEffect ③ が1秒ごとに減算する。
  const [countdown, setCountdown] = useState(INTERVAL_SECS);

  // lastUpdated: 最後にデータ取得が完了した時刻。
  // Date | null の型は「Date か null のどちらか」という意味。
  // 初期値を null にすることで「まだ一度も更新していない」状態を表現している。
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // useRef: 「再レンダリングを起こさずに値を保持する」フック。
  // useState との違い: useRef の値を変えても画面は再描画されない。
  // setInterval の戻り値（タイマーID）はキャンセル用に保持しておく必要があるが、
  // 変わっても画面に影響しないため useRef が適切。
  //
  // 型 ReturnType<typeof setInterval> は「setInterval が返す型」を自動的に取得する書き方。
  // ブラウザでは number、Node.js では NodeJS.Timeout と環境によって異なるため
  // この書き方でどちらでも対応できる。
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─────────────────────────────────────────────
  // useEffect ①: isPending の変化を監視して最終更新時刻を記録する
  //
  // ■ useEffect が呼ばれるタイミング（重要）
  //   useEffect はレンダリングが終わって画面に反映された「後」に実行される。
  //   依存配列 [isPending] を指定しているので、以下の2タイミングで呼ばれる:
  //     1. コンポーネントが初めて表示された直後（マウント時）
  //     2. isPending の値が変わって再レンダリングされた直後
  //
  // ■ なぜ依存配列が必要か
  //   依存配列を省略 → 毎回のレンダリング後に実行（意図しない動作になりやすい）
  //   []            → マウント時の1回だけ実行
  //   [isPending]   → isPending が変わったときだけ実行  ← 今回の目的に合う
  //
  // ■ prevPendingRef を使う理由
  //   isPending は「false→true（更新開始）」「true→false（更新完了）」の2方向に変化する。
  //   「完了」の瞬間だけを検知するために直前の値を ref に保持し、変化の方向を判定している。
  //   ref は値を変えても再レンダリングを起こさないため「前回値の記憶」用途に最適。
  // ─────────────────────────────────────────────
  const prevPendingRef = useRef(false);
  useEffect(() => {
    // prevPendingRef.current が true（前回は更新中）かつ isPending が false（今回は完了）
    // → 更新完了の瞬間なので最終更新時刻を記録する
    if (prevPendingRef.current && !isPending) {
      setLastUpdated(new Date());
    }
    // 今回の isPending を「前回値」として保存しておき、次回の呼び出しで比較に使う
    prevPendingRef.current = isPending;
  }, [isPending]);

  // ─────────────────────────────────────────────
  // useEffect ②: リフレッシュタイマーの起動・停止・Page Visibility 連携
  //
  // ■ useEffect が呼ばれるタイミング
  //   依存配列 [enabled, router] のどちらかが変わると再実行される:
  //     1. マウント時（初回表示後）→ タイマーを起動する
  //     2. enabled が変わったとき（トグル操作後）→ タイマーを作り直す
  //
  // ■ setInterval をコンポーネント直下に書いてはいけない理由
  //   コンポーネント関数はレンダリングのたびに実行される。
  //   useEffect の外に setInterval を書くと、レンダリングごとに新しいタイマーが
  //   どんどん増えてしまう。useEffect の中に書くことで「必要なタイミングで1回だけ登録」できる。
  //
  // ■ クリーンアップ関数（return () => { ... }）の役割
  //   この return の中身は「このuseEffectが再実行される直前」と
  //   「コンポーネントが破棄されるとき（アンマウント時）」の両方で呼ばれる。
  //
  //   例: トグルで enabled を true→false に変えた場合の流れ
  //     ① クリーンアップ実行 → stop()で古いタイマー破棄、removeEventListenerでリスナー解除
  //     ② 新しい effect 実行 → enabled=false なので start() を呼ばず、タイマーなしの状態へ
  //   これにより「画面を離れた後もタイマーが動き続ける」メモリリークを防いでいる。
  // ─────────────────────────────────────────────
  useEffect(() => {
    const performRefresh = () => {
      // リフレッシュ開始と同時にカウントダウンを60にリセットする
      setCountdown(INTERVAL_SECS);
      // startTransition でラップすることで isPending=true になり、
      // データ取得中もスケルトンを表示せず既存の画面を維持する
      startTransition(() => router.refresh());
    };

    const start = () => {
      // すでにタイマーが動いていれば二重起動しない
      if (intervalRef.current !== null) return;
      intervalRef.current = setInterval(performRefresh, INTERVAL_SECS * 1000);
    };

    const stop = () => {
      // タイマーが存在しない場合は何もしない
      if (intervalRef.current === null) return;
      clearInterval(intervalRef.current);
      // null に戻すことで「タイマーが存在しない」状態を明示する
      intervalRef.current = null;
    };

    // Page Visibility API: ブラウザのタブが「非表示 / 表示」に切り替わったときに
    // 呼ばれるイベントハンドラ。別タブを見ているときは不要なリクエストを停止する。
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else if (enabled) {
        // タブに戻ってきて、かつトグルが ON なら再開する
        start();
      }
    };

    // マウント時または enabled が true になったとき: タブが表示中ならタイマーを開始する
    if (enabled && document.visibilityState === 'visible') {
      start();
    }

    // イベントリスナーを登録する（タブの表示・非表示の検知）
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // クリーンアップ関数: useEffect が再実行される直前 or アンマウント時に呼ばれる
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, router]);

  // ─────────────────────────────────────────────
  // useEffect ③: カウントダウン表示（1秒ごとに残り秒数を減算）
  //
  // ■ useEffect が呼ばれるタイミング
  //   依存配列 [enabled] なので、マウント時とトグル操作のたびに実行される。
  //
  // ■ 早期 return したときのクリーンアップについて
  //   enabled=false のとき、setCountdown してから return している。
  //   この return はクリーンアップ関数ではなく「何もしないで effect を終わらせる」だけ。
  //   setInterval を登録していないので解除するものがなく、クリーンアップ関数は不要。
  //   （クリーンアップ関数を返すのは「登録したものを解除する必要があるとき」だけでよい）
  //
  // ■ setCountdown に関数を渡す理由（prev => ...）
  //   setInterval のコールバックは登録時点の countdown 変数を「閉じ込めて」しまう（クロージャ）。
  //   直接 setCountdown(countdown - 1) と書くと、常に初回の値のまま減算し続けてしまう。
  //   setCountdown(prev => prev - 1) のように関数形式で渡すと、
  //   Reactが「最新の状態」を prev に渡してくれるため、この問題を回避できる。
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      // トグルOFFになったらカウンターを初期値に戻して終了する
      setCountdown(INTERVAL_SECS);
      return;
    }

    const tick = setInterval(() => {
      // prev（直前の値）を受け取り、1以下になったらリセット、それ以外は1減らす
      setCountdown((prev) => (prev <= 1 ? INTERVAL_SECS : prev - 1));
    }, 1000);

    // tick（タイマーID）を clearInterval に渡してタイマーを解除する
    return () => clearInterval(tick);
  }, [enabled]);

  const shell = (
    <main>
      {/* ヘッダー行: justify-between で左(タイトル)と右(コントロール群)に分ける */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className={`${lusitana.className} text-xl md:text-2xl`}>
          Dashboard
        </h1>

        <div className="flex items-center gap-3">
          {/*
            条件付きレンダリング: {条件 && <JSX>} の書き方。
            条件が false のときは何も表示されない。
            lastUpdated が null（初回更新前）または isPending 中は表示しない。
          */}
          {lastUpdated && !isPending && (
            <span className="text-xs text-gray-400">
              {/* toLocaleTimeString: Date オブジェクトを「時:分:秒」形式の文字列に変換する */}
              最終更新 {lastUpdated.toLocaleTimeString('ja-JP')}
            </span>
          )}

          {/* enabled が true のときだけ更新状態インジケーターを表示する */}
          {enabled && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              {/*
                三項演算子: 条件 ? 真のとき : 偽のとき
                isPending が true → スピナー＋「更新中…」
                isPending が false → 「○秒後に更新」
              */}
              {isPending ? (
                <>
                  {/*
                    <> ... </> は React.Fragment の省略記法。
                    複数の要素をひとまとめにしたいが、余分な div を増やしたくないときに使う。
                  */}
                  <svg
                    className="h-3 w-3 animate-spin text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    // aria-hidden="true": スクリーンリーダーに読み上げさせない装飾要素であることを示す
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  更新中…
                </>
              ) : (
                // テンプレートリテラル: バッククォートで囲み ${} に変数を埋め込む
                `${countdown}秒後に更新`
              )}
            </span>
          )}

          <span className="text-sm text-gray-600">自動更新</span>
          <button
            // prev => !prev: 直前の値を受け取り反転させる。enabled が true なら false、false なら true。
            onClick={() => setEnabled((prev) => !prev)}
            // role="switch": ボタンではなくトグルスイッチであることをアクセシビリティツールに伝える
            role="switch"
            // aria-checked: スクリーンリーダーに現在のON/OFF状態を伝えるHTML属性
            aria-checked={enabled}
            aria-label="自動更新の切り替え"
            // テンプレートリテラルで enabled の値に応じてクラスを切り替える
            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            {/* トグルの丸いつまみ部分。translate-x でON/OFFの位置を切り替える */}
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>

          {/* トグルOFF時だけ「停止中」を表示する */}
          {!enabled && (
            <span className="text-xs text-gray-400">停止中</span>
          )}
        </div>
      </div>

      {/*
        更新中（isPending=true）はコンテンツ全体を opacity-50 で半透明にする。
        transition-opacity duration-300 で透明度の変化をアニメーションさせる。
        children（CardWrapper・RevenueChart・LatestInvoices）はサーバーコンポーネントで、
        page.tsx 側で組み立てて props として渡されている。
      */}
      <div
        className={`transition-opacity duration-300 ${
          isPending ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </main>
  );
  return shell;
}
