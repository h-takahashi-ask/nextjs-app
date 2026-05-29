/**
 * Drizzle ORM スキーマ定義
 *
 * このファイルは「現在 DB に存在するテーブル」だけを定義する。
 * 将来の変更（カラム追加・新規テーブル）はこのファイルを編集して
 * drizzle:generate でマイグレーション SQL を生成する。
 *
 * Better Auth テーブル（user / session / account / verification）は
 * まだ DB に存在しないため、ここには含めない。
 * Better Auth テーブルは別途 drizzle:generate で追加する予定。
 *
 * すべて financial_dashboard PostgreSQL スキーマ内に配置する。
 * Prisma は @@map でテーブル名を指定しているため、Drizzle 側も同じ物理名を使う。
 */
import {
  date,
  integer,
  pgSchema,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const financialSchema = pgSchema('financial_dashboard')

// ─── 既存テーブル（Prisma スキーマと同一構造）────────────────────────────────

export const users = financialSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
})

export const customers = financialSchema.table('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
})

export const invoices = financialSchema.table('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id),
  amount: integer('amount').notNull(),
  status: varchar('status', { length: 255 }).notNull(),
  date: date('date').notNull(),
})

export const revenue = financialSchema.table('revenue', {
  month: varchar('month', { length: 4 }).primaryKey(),
  revenue: integer('revenue').notNull(),
})
