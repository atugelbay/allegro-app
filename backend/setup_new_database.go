package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	// Подключение к PostgreSQL
	db, err := sql.Open("postgres", "user=sonara_space password=sonara_space_pass dbname=sonara_space host=127.0.0.1 port=5432 sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Проверка подключения
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	fmt.Println("✅ Connected to Sonara Space database successfully!")

	// Выполнение миграций
	migrations := []string{
		// 1. Создание таблицы users
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			first_name VARCHAR(100),
			last_name VARCHAR(100),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,

		// 2. Создание таблицы subscriptions
		`CREATE TABLE IF NOT EXISTS subscriptions (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			plan VARCHAR(50) NOT NULL,
			status VARCHAR(20) DEFAULT 'active',
			start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			end_date TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,

		// 3. Создание таблицы payments
		`CREATE TABLE IF NOT EXISTS payments (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
			amount DECIMAL(10,2) NOT NULL,
			currency VARCHAR(3) DEFAULT 'USD',
			status VARCHAR(20) DEFAULT 'pending',
			payment_method VARCHAR(50),
			transaction_id VARCHAR(255),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,

		// 4. Создание таблицы lessons
		`CREATE TABLE IF NOT EXISTS lessons (
			id SERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			instrument VARCHAR(50) NOT NULL,
			description TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,

		// 5. Создание таблицы exercises
		`CREATE TABLE IF NOT EXISTS exercises (
			id SERIAL PRIMARY KEY,
			lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			expected VARCHAR(100) NOT NULL,
			type VARCHAR(50) NOT NULL,
			sequence TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,

		// 6. Создание таблицы progress
		`CREATE TABLE IF NOT EXISTS progress (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
			status VARCHAR(20) DEFAULT 'pending',
			completed_at TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(user_id, exercise_id)
		);`,
	}

	// Выполнение миграций
	for i, migration := range migrations {
		fmt.Printf("Executing migration %d...\n", i+1)
		if _, err := db.Exec(migration); err != nil {
			log.Fatalf("Failed to execute migration %d: %v", i+1, err)
		}
	}

	fmt.Println("✅ All migrations completed successfully!")

	// Добавление тестовых данных
	fmt.Println("Adding sample lessons...")

	// Добавляем уроки
	lessons := []struct {
		title       string
		instrument  string
		description string
	}{
		{"Базовые аккорды гитары", "guitar", "Изучите основные аккорды C, Am, F, G"},
		{"Базовые аккорды пианино", "piano", "Изучите основные аккорды C, Am, F, G на пианино"},
		{"Ноты гитары", "guitar", "Изучите отдельные ноты на гитаре"},
		{"Ноты пианино", "piano", "Изучите отдельные ноты на пианино"},
		{"Последовательности аккордов", "guitar", "Изучите популярные последовательности аккордов"},
		{"Песни и мелодии", "guitar", "Изучите популярные песни и мелодии"},
	}

	for _, lesson := range lessons {
		var lessonID int
		err := db.QueryRow(`
			INSERT INTO lessons (title, instrument, description) 
			VALUES ($1, $2, $3) 
			ON CONFLICT DO NOTHING 
			RETURNING id
		`, lesson.title, lesson.instrument, lesson.description).Scan(&lessonID)

		if err != nil && err != sql.ErrNoRows {
			log.Printf("Warning: Failed to insert lesson %s: %v", lesson.title, err)
		} else if err == nil {
			fmt.Printf("✅ Added lesson: %s (ID: %d)\n", lesson.title, lessonID)
		}
	}

	fmt.Println("✅ Database setup completed successfully!")
	fmt.Println("🎉 Sonara Space database is ready to use!")
}
