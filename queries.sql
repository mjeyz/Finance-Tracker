CREATE Table users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    email VARCHAR(250) NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE transaction (
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL,
    amount DECIMAL NOT NULL,
    expenses INTEGER NOT NULL,
    type VARCHAR(200),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE events  (
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL,
    name TEXT,
    date TIMESTAMP,
    location VARCHAR(250),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE saving (
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL,
    goal VARCHAR(250) NOT NULL ,
    targetAmount INTEGER NOT NULL,
    savedAmount INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO events (user_id, name, date, location) VALUES (2, '🎨 Design Workshop"', 'June 10, 2025', 'Creative Hub');

insert INTO saving (user_id, goal, targetAmount, savedAmount) VALUES (1, '🌴 Dream Vacation', 4500, 1875);

ALTER TABLE transaction ADD COLUMN description TEXT;

INSERT INTO transaction (user_id, amount, expenses, type, description) VALUES (1,  3450.75, 20000, 'expense', '💼 Salary (Freelance)');


ALTER TABLE users ADD COLUMN expenses INTEGER;

UPDATE users SET income = 21000, expenses = 16000 Where id = 1;

ALTER TABLE transaction DROP COLUMN expenses;

ALTER TABLE transaction ADD COLUMN date DATE DEFAULT CURRENT_DATE;

ALTER TABLE transaction ADD COLUMN  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

INSERT INTO transaction (user_id, description, amount, type, date) VALUES
(1, '💼 Salary (Freelance)', 3450.75, 'income', '2026-05-01'),
(1, '🛒 Groceries & Supermarket', 128.40, 'expense', '2026-05-15'),
(2, '☕ Coffee & Workspace', 42.30, 'expense', '2026-05-16'),
(2, '📱 Phone & Internet Bill', 89.99, 'expense', '2026-05-17'),
(3, '🎁 Bonus & Cashback', 120.00, 'income', '2026-05-18'),
(3, '🚗 Fuel & Transport', 55.20, 'expense', '2026-05-19');

ALTER TABLE users ADD COLUMN otp_expiry TIME;