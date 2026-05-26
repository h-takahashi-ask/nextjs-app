-- ============================================================
-- FINANCIAL DASHBOARD DDL
-- ============================================================

SET search_path TO financial_dashboard;

-- ============================================================
-- users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id       UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    name     VARCHAR(255) NOT NULL,
    email    TEXT         NOT NULL UNIQUE,
    password TEXT         NOT NULL
);

COMMENT ON TABLE  users           IS 'アプリケーションユーザー';
COMMENT ON COLUMN users.id        IS 'ユーザーID（UUID）';
COMMENT ON COLUMN users.name      IS 'ユーザー名';
COMMENT ON COLUMN users.email     IS 'メールアドレス（一意制約）';
COMMENT ON COLUMN users.password  IS 'ハッシュ化済みパスワード';

-- ============================================================
-- customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id        UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    name      VARCHAR(255) NOT NULL,
    email     VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL
);

COMMENT ON TABLE  customers           IS '請求先顧客';
COMMENT ON COLUMN customers.id        IS '顧客ID（UUID）';
COMMENT ON COLUMN customers.name      IS '顧客名';
COMMENT ON COLUMN customers.email     IS 'メールアドレス';
COMMENT ON COLUMN customers.image_url IS 'プロフィール画像URL';

-- ============================================================
-- invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
    id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID         NOT NULL,
    amount      INT          NOT NULL,
    status      VARCHAR(255) NOT NULL,
    date        DATE         NOT NULL,
    CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES customers (id)
);

COMMENT ON TABLE  invoices             IS '請求書';
COMMENT ON COLUMN invoices.id          IS '請求書ID（UUID）';
COMMENT ON COLUMN invoices.customer_id IS '顧客ID（customers.id への外部キー）';
COMMENT ON COLUMN invoices.amount      IS '請求金額（セント単位）';
COMMENT ON COLUMN invoices.status      IS '支払いステータス（pending / paid）';
COMMENT ON COLUMN invoices.date        IS '請求日';

-- ============================================================
-- revenue
-- ============================================================
CREATE TABLE IF NOT EXISTS revenue (
    month   VARCHAR(4) NOT NULL UNIQUE,
    revenue INT        NOT NULL
);

COMMENT ON TABLE  revenue         IS '月次売上';
COMMENT ON COLUMN revenue.month   IS '対象月（例: Jan, Feb ...）';
COMMENT ON COLUMN revenue.revenue IS '売上金額（セント単位）';
