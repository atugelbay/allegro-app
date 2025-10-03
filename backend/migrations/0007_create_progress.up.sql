CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    best_score DECIMAL(5,2) DEFAULT 0.00,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, exercise_id)
);
