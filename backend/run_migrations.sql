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

-- Миграция 9: Добавление уроков с песнями
INSERT INTO lessons (title, instrument, description) VALUES
('Первые песни на гитаре', 'guitar', 'Изучите простые песни с базовыми аккордами Am, C, G, F'),
('Простые мелодии на пианино', 'piano', 'Научитесь играть простые мелодии правой рукой'),
('Популярные аккорды', 'guitar', 'Изучите самые популярные аккорды для игры песен'),
('Гаммы и мелодии', 'piano', 'Комбинация гамм и простых мелодий');

-- Добавляем упражнения для урока "Первые песни на гитаре" (ID: 5)
INSERT INTO exercises (lesson_id, title, expected, type, order_index) VALUES
-- Аккорды для песен
(5, 'Изучите аккорд Am', 'Am', 'chord', 1),
(5, 'Изучите аккорд C', 'C', 'chord', 2),
(5, 'Изучите аккорд G', 'G', 'chord', 3),
(5, 'Изучите аккорд F', 'F', 'chord', 4),
-- Простые песни
(5, 'Песня "Happy Birthday" - аккорд Am', 'Am', 'chord', 5),
(5, 'Песня "Happy Birthday" - аккорд C', 'C', 'chord', 6),
(5, 'Песня "Happy Birthday" - аккорд G', 'G', 'chord', 7),
(5, 'Песня "Happy Birthday" - аккорд F', 'F', 'chord', 8);

-- Добавляем упражнения для урока "Простые мелодии на пианино" (ID: 6)
INSERT INTO exercises (lesson_id, title, expected, type, order_index) VALUES
-- Базовые ноты
(6, 'Нота C4', 'C4', 'note', 1),
(6, 'Нота D4', 'D4', 'note', 2),
(6, 'Нота E4', 'E4', 'note', 3),
(6, 'Нота F4', 'F4', 'note', 4),
(6, 'Нота G4', 'G4', 'note', 5),
(6, 'Нота A4', 'A4', 'note', 6),
(6, 'Нота B4', 'B4', 'note', 7),
-- Простые мелодии
(6, 'Мелодия "До-ре-ми" - нота C4', 'C4', 'note', 8),
(6, 'Мелодия "До-ре-ми" - нота D4', 'D4', 'note', 9),
(6, 'Мелодия "До-ре-ми" - нота E4', 'E4', 'note', 10);

-- Добавляем упражнения для урока "Популярные аккорды" (ID: 7)
INSERT INTO exercises (lesson_id, title, expected, type, order_index) VALUES
-- Основные аккорды
(7, 'Мажорный аккорд C', 'C', 'chord', 1),
(7, 'Мажорный аккорд G', 'G', 'chord', 2),
(7, 'Мажорный аккорд D', 'D', 'chord', 3),
(7, 'Минорный аккорд Am', 'Am', 'chord', 4),
(7, 'Минорный аккорд Dm', 'Dm', 'chord', 5),
(7, 'Минорный аккорд Em', 'Em', 'chord', 6),
-- Сложные аккорды
(7, 'Септаккорд C7', 'C7', 'chord', 7),
(7, 'Септаккорд G7', 'G7', 'chord', 8);

-- Добавляем упражнения для урока "Гаммы и мелодии" (ID: 8)
INSERT INTO exercises (lesson_id, title, expected, type, order_index) VALUES
-- Гамма C мажор
(8, 'Гамма C мажор - C4', 'C4', 'note', 1),
(8, 'Гамма C мажор - D4', 'D4', 'note', 2),
(8, 'Гамма C мажор - E4', 'E4', 'note', 3),
(8, 'Гамма C мажор - F4', 'F4', 'note', 4),
(8, 'Гамма C мажор - G4', 'G4', 'note', 5),
(8, 'Гамма C мажор - A4', 'A4', 'note', 6),
(8, 'Гамма C мажор - B4', 'B4', 'note', 7),
(8, 'Гамма C мажор - C5', 'C5', 'note', 8),
-- Простые мелодии
(8, 'Мелодия "Twinkle Twinkle" - C4', 'C4', 'note', 9),
(8, 'Мелодия "Twinkle Twinkle" - G4', 'G4', 'note', 10);
