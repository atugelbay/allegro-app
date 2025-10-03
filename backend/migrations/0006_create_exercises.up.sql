CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    expected TEXT NOT NULL,
    type TEXT NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
