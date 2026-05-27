SET search_path TO financial_dashboard;

INSERT INTO revenue (month, revenue) VALUES
    ('Jan', 2000),
    ('Feb', 1800),
    ('Mar', 2200),
    ('Apr', 2500),
    ('May', 2300),
    ('Jun', 3200),
    ('Jul', 3500),
    ('Aug', 3700),
    ('Sep', 2500),
    ('Oct', 2800),
    ('Nov', 3000),
    ('Dec', 4800)
ON CONFLICT (month) DO NOTHING;
