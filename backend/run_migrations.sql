-- Миграция 1: Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    locale VARCHAR(10) DEFAULT 'ru',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Миграция 2: Добавление полей имени в users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Миграция 3: Создание таблицы subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Миграция 4: Создание таблицы payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INT REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(100),
    external_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Миграция 5: Создание таблицы lessons
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    instrument TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Миграция 6: Создание таблицы exercises
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    expected TEXT NOT NULL,
    type TEXT NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Миграция 7: Создание таблицы progress
CREATE TABLE IF NOT EXISTS progress (
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

-- Миграция 8: Добавление тестовых данных
INSERT INTO lessons (title, instrument, description) VALUES
('Основы гитары', 'guitar', 'Изучите базовые аккорды и технику игры на гитаре'),
('Основы пианино', 'piano', 'Первые шаги в изучении клавишных инструментов'),
('Простые аккорды', 'guitar', 'Научитесь играть основные аккорды Am, C, F, G'),
('Гаммы на пианино', 'piano', 'Изучите основные гаммы и аппликатуру');

-- Добавляем упражнения для урока "Основы гитары"
INSERT INTO exercises (lesson_id, title, expected, type, order_index) VALUES
(1, 'Сыграйте аккорд Am', 'Am', 'chord', 1),
(1, 'Сыграйте аккорд C', 'C', 'chord', 2),
(1, 'Сыграйте аккорд F', 'F', 'chord', 3),
(1, 'Сыграйте аккорд G', 'G', 'chord', 4);

-- Добавляем упражнения для урока "Основы пианино"
INSERT INTO exercises (lesson_id, title, expected, type, order_index) VALUES
(2, 'Сыграйте ноту C4', 'C4', 'note', 1),
(2, 'Сыграйте ноту D4', 'D4', 'note', 2),
(2, 'Сыграйте ноту E4', 'E4', 'note', 3),
(2, 'Сыграйте ноту F4', 'F4', 'note', 4);

-- Добавляем упражнения для урока "Простые аккорды"
INSERT INTO exercises (lesson_id, title, expected, type, order_index) VALUES
(3, 'Сыграйте аккорд Am', 'Am', 'chord', 1),
(3, 'Сыграйте аккорд C', 'C', 'chord', 2),
(3, 'Сыграйте аккорд F', 'F', 'chord', 3),
(3, 'Сыграйте аккорд G', 'G', 'chord', 4),
(3, 'Сыграйте аккорд Em', 'Em', 'chord', 5);

-- Добавляем упражнения для урока "Гаммы на пианино"
INSERT INTO exercises (lesson_id, title, expected, type, order_index) VALUES
(4, 'Сыграйте ноту C4', 'C4', 'note', 1),
(4, 'Сыграйте ноту D4', 'D4', 'note', 2),
(4, 'Сыграйте ноту E4', 'E4', 'note', 3),
(4, 'Сыграйте ноту F4', 'F4', 'note', 4),
(4, 'Сыграйте ноту G4', 'G4', 'note', 5),
(4, 'Сыграйте ноту A4', 'A4', 'note', 6),
(4, 'Сыграйте ноту B4', 'B4', 'note', 7);
