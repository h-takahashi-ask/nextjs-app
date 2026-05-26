SET search_path TO financial_dashboard;

INSERT INTO invoices (customer_id, amount, status, date) VALUES
    ('d6e15727-9fe1-4961-8c5b-ea44a9bd81aa', 15795, 'pending', '2022-12-06'),
    ('3958dc9e-712f-4377-85e9-fec4b6a6442a', 20348, 'pending', '2022-11-14'),
    ('cc27c14a-0acf-4f4a-a6c9-d45682c144b9',  3040, 'paid',    '2022-10-29'),
    ('76d65c26-f784-44a2-ac19-586678f7c2f2', 44800, 'paid',    '2023-09-10'),
    ('13d07535-c59e-4157-a011-f8d2ef4e0cbb', 34577, 'pending', '2023-08-05'),
    ('3958dc9e-742f-4377-85e9-fec4b6a6442a', 54246, 'pending', '2023-07-16'),
    ('d6e15727-9fe1-4961-8c5b-ea44a9bd81aa',   666, 'pending', '2023-06-27'),
    ('76d65c26-f784-44a2-ac19-586678f7c2f2', 32545, 'paid',    '2023-06-09'),
    ('cc27c14a-0acf-4f4a-a6c9-d45682c144b9',  1250, 'paid',    '2023-06-17'),
    ('13d07535-c59e-4157-a011-f8d2ef4e0cbb',  8546, 'paid',    '2023-06-07'),
    ('3958dc9e-712f-4377-85e9-fec4b6a6442a',   500, 'paid',    '2023-08-19'),
    ('13d07535-c59e-4157-a011-f8d2ef4e0cbb',  8945, 'paid',    '2023-06-03'),
    ('3958dc9e-742f-4377-85e9-fec4b6a6442a',  1000, 'paid',    '2022-06-05');
