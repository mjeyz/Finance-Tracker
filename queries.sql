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

