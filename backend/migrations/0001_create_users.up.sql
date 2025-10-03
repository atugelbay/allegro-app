CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    locale VARCHAR(10) DEFAULT 'ru',
    created_at TIMESTAMP DEFAULT NOW()
);
