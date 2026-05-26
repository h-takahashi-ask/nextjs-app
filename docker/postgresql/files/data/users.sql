SET search_path TO financial_dashboard, public;

-- bcrypt ハッシュ生成（$2a$ → $2b$ に prefix 変換）と INSERT を一括実行
-- seed スクリプト（bcryptjs）と同じ $2b$10$ 形式に合わせる
WITH hashed AS (
    SELECT '$2b' || substr(crypt('123456', gen_salt('bf', 10)), 4) AS password
)
INSERT INTO users (id, name, email, password)
SELECT
    '410544b2-4001-4271-9855-fec4b6a6442a',
    'User',
    'user@nextmail.com',
    password
FROM hashed
ON CONFLICT (id) DO NOTHING;
