CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    instrument TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
