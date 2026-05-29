This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

---

## ランタイム・ツール

### Bun（インストール済み）

**パッケージマネージャー・スクリプトランナー**として使用できます。  
フルランタイムとしての使用は Prisma のネイティブバイナリ依存により非推奨です。

**インストール（Windows）**

```powershell
winget install Oven-sh.Bun
```

シェルを再起動後、バージョンを確認：

```sh
bun --version
```

**使用例**

```sh
bun install        # pnpm install の代替
bun run dev        # 開発サーバー起動
bun run build      # ビルド
bun prisma/seed.ts # tsx を使わず TypeScript ファイルを直接実行
```

---

### Deno（インストール済み）

このプロジェクトスタック（Prisma + next-auth）では **実行はサポートしていません**。  
Deno の学習・比較目的でインストールしています。

**インストール（Windows）**

```powershell
winget install DenoLand.Deno
```

シェルを再起動後、バージョンを確認：

```sh
deno --version
```

Deno 単体のスクリプト実行には利用可能です：

```sh
deno run --allow-read script.ts
```

---

## データベース（Prisma / Drizzle）

このプロジェクトは **Prisma と Drizzle ORM を並行して保持** しています（学習目的）。

| | Prisma | Drizzle |
|---|---|---|
| スキーマ | `prisma/schema.prisma` | `src/lib/db/drizzle/schema.ts` |
| クライアント | `src/lib/database/client.ts` | `src/lib/db/drizzle/index.ts` |
| 設定 | `prisma.config.ts` | `drizzle.config.ts` |
| マイグレーション | `prisma/migrations/` | `drizzle/migrations/` |

**Drizzle スクリプト**

```sh
pnpm drizzle:generate   # スキーマ変更からマイグレーション SQL を生成
pnpm drizzle:migrate    # マイグレーションを DB に適用
pnpm drizzle:push       # マイグレーションファイルなしで直接 DB に反映（開発初期向け）
pnpm drizzle:studio     # ブラウザで DB の内容を確認・編集する GUI を起動
```

**Drizzle を使ったテーブル初期化（初回のみ）**

```sh
pnpm drizzle:push
```

---

## 認証（next-auth / Better Auth）

このプロジェクトは **next-auth v5 と Better Auth を並行して保持** しています（学習目的）。

| | next-auth v5 | Better Auth |
|---|---|---|
| サーバー設定 | `src/lib/auth/nextauth.ts` | `src/lib/auth/better-auth/auth.ts` |
| Edge 設定 | `src/lib/auth/auth.config.ts` | — |
| クライアント | — | `src/lib/auth/better-auth/auth-client.ts` |
| DB テーブル | `financial_dashboard.users` | `financial_dashboard.user` |
| ORM | Prisma | Drizzle |

Better Auth のテーブル（`user` / `session` / `account` / `verification`）は  
`pnpm drizzle:push` を実行すると `financial_dashboard` スキーマ内に作成されます。

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
