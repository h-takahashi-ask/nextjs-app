SET search_path TO financial_dashboard;

INSERT INTO customers (id, name, email, image_url) VALUES
    ('d6e15727-9fe1-4961-8c5b-ea44a9bd81aa', 'Evil Rabbit',       'evil@rabbit.com',   '/customers/evil-rabbit.png'),
    ('3958dc9e-712f-4377-85e9-fec4b6a6442a', 'Delba de Oliveira', 'delba@oliveira.com', '/customers/delba-de-oliveira.png'),
    ('3958dc9e-742f-4377-85e9-fec4b6a6442a', 'Lee Robinson',      'lee@robinson.com',   '/customers/lee-robinson.png'),
    ('76d65c26-f784-44a2-ac19-586678f7c2f2', 'Michael Novotny',   'michael@novotny.com','/customers/michael-novotny.png'),
    ('cc27c14a-0acf-4f4a-a6c9-d45682c144b9', 'Amy Burns',         'amy@burns.com',      '/customers/amy-burns.png'),
    ('13d07535-c59e-4157-a011-f8d2ef4e0cbb', 'Balazs Orban',      'balazs@orban.com',   '/customers/balazs-orban.png')
ON CONFLICT (id) DO NOTHING;
