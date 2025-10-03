package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"allegro/backend/config"
	"allegro/backend/internal/auth"
	"allegro/backend/internal/db"
	"allegro/backend/internal/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

// Handlers для подписок
func createSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIDKey).(int64)

	var req struct {
		Plan string `json:"plan"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Проверяем валидность плана
	if req.Plan != "basic" && req.Plan != "pro" && req.Plan != "family" {
		http.Error(w, "Invalid plan", http.StatusBadRequest)
		return
	}

	database := db.GetDB()
	ctx := r.Context()

	// Проверяем, есть ли уже активная подписка
	var existingID int64
	err := database.QueryRow(ctx, `
		SELECT id FROM subscriptions 
		WHERE user_id = $1 AND status IN ('active', 'trialing')
	`, userID).Scan(&existingID)

	if err == nil {
		// Активная подписка уже есть
		http.Error(w, "User already has active subscription", http.StatusConflict)
		return
	}

	// Создаем новую подписку
	var subID int64
	err = database.QueryRow(ctx, `
		INSERT INTO subscriptions (user_id, plan, status, started_at, trial_until)
		VALUES ($1, $2, 'trialing', NOW(), NOW() + INTERVAL '7 days')
		RETURNING id
	`, userID, req.Plan).Scan(&subID)

	if err != nil {
		log.Printf("Error creating subscription: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      subID,
		"plan":    req.Plan,
		"status":  "trialing",
		"message": "Subscription created with 7-day trial",
	})
}

func getMySubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIDKey).(int64)

	database := db.GetDB()
	ctx := r.Context()

	var sub struct {
		ID         int64   `json:"id"`
		Plan       string  `json:"plan"`
		Status     string  `json:"status"`
		StartedAt  string  `json:"started_at"`
		TrialUntil *string `json:"trial_until,omitempty"`
	}

	err := database.QueryRow(ctx, `
		SELECT id, plan, status, started_at, trial_until
		FROM subscriptions 
		WHERE user_id = $1 AND status IN ('active', 'trialing')
		ORDER BY created_at DESC
		LIMIT 1
	`, userID).Scan(&sub.ID, &sub.Plan, &sub.Status, &sub.StartedAt, &sub.TrialUntil)

	if err != nil {
		// Нет активной подписки
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"subscription":          nil,
			"hasActiveSubscription": false,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"subscription":          sub,
		"hasActiveSubscription": true,
	})
}

func main() {
	// Загружаем конфиг
	_, err := config.LoadConfig()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}
	// Роутер
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // где крутится vite
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Подключение к БД
	pool, err := db.Connect()
	if err != nil {
		log.Fatalf("db connect error: %v", err)
	}
	defer pool.Close()
	db.Pool = pool

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// Auth
	r.Post("/auth/register", handlers.RegisterHandler)
	r.Post("/auth/login", handlers.LoginHandler)

	// Защищённые роуты
	r.Group(func(protected chi.Router) {
		protected.Use(auth.JWTMiddleware)

		// тестовый эндпоинт
		protected.Get("/me", func(w http.ResponseWriter, r *http.Request) {
			userID := r.Context().Value(auth.UserIDKey).(int64)

			// Получаем информацию о пользователе из БД
			var email, locale, firstName, lastName string
			var createdAt time.Time
			err := db.Pool.QueryRow(
				context.Background(),
				"SELECT email, locale, first_name, last_name, created_at FROM users WHERE id=$1",
				userID,
			).Scan(&email, &locale, &firstName, &lastName, &createdAt)

			if err != nil {
				http.Error(w, "user not found", http.StatusNotFound)
				return
			}

			// Получаем информацию о подписке
			var subscriptionPlan, subscriptionStatus string
			var subscriptionID *int64
			subscriptionErr := db.Pool.QueryRow(
				context.Background(),
				`SELECT id, plan, status FROM subscriptions 
				 WHERE user_id=$1 AND status IN ('active', 'trialing') 
				 ORDER BY created_at DESC LIMIT 1`,
				userID,
			).Scan(&subscriptionID, &subscriptionPlan, &subscriptionStatus)

			response := map[string]interface{}{
				"id":         userID,
				"email":      email,
				"first_name": firstName,
				"last_name":  lastName,
				"locale":     locale,
				"created_at": createdAt.Format(time.RFC3339),
			}

			// Добавляем информацию о подписке, если есть
			if subscriptionErr == nil && subscriptionID != nil {
				response["subscription"] = map[string]interface{}{
					"id":     *subscriptionID,
					"plan":   subscriptionPlan,
					"status": subscriptionStatus,
				}
			} else {
				response["subscription"] = nil
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)
		})

		// платежи
		protected.Post("/payments", handlers.CreatePaymentHandler)
		r.Post("/payments/callback", handlers.PaymentCallbackHandler)

		// подписки
		protected.Post("/subscriptions", createSubscriptionHandler)
		protected.Get("/subscriptions/me", getMySubscriptionHandler)

		// контент, доступный только подписчикам
		protected.Group(func(sub chi.Router) {
			sub.Use(auth.RequireSubscription)
			sub.Get("/lessons", func(w http.ResponseWriter, r *http.Request) {
				w.Write([]byte("Welcome to premium lessons 🎸🎹"))
			})
		})
	})

	// Запуск
	log.Println("Server running on :8080")
	http.ListenAndServe(":8080", r)
}
