package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"sonara-space/backend/internal/auth"
	"sonara-space/backend/internal/db"
)

type SubscriptionRequest struct {
	Plan string `json:"plan"`
}

func CreateSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	var req SubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// проверяем план
	if req.Plan != "basic" && req.Plan != "pro" && req.Plan != "family" {
		http.Error(w, "invalid plan", http.StatusBadRequest)
		return
	}

	// достаём user_id из контекста
	userID := r.Context().Value(auth.UserIDKey).(int64)

	// Сначала отменяем все активные подписки пользователя
	cancelSQL := `UPDATE subscriptions 
	              SET status = 'canceled', canceled_at = NOW() 
	              WHERE user_id = $1 AND status IN ('active', 'trialing')`

	_, err := db.Pool.Exec(context.Background(), cancelSQL, userID)
	if err != nil {
		http.Error(w, "db error: cancel existing subscriptions", http.StatusInternalServerError)
		return
	}

	// Создаём новую подписку
	insertSQL := `INSERT INTO subscriptions (user_id, plan, status, started_at, renew_at)
	              VALUES ($1, $2, 'active', NOW(), NOW() + interval '30 days')
	              RETURNING id, status, plan, started_at, renew_at`

	var id int64
	var status, plan string
	var startedAt, renewAt time.Time

	err = db.Pool.QueryRow(context.Background(), insertSQL, userID, req.Plan).
		Scan(&id, &status, &plan, &startedAt, &renewAt)
	if err != nil {
		http.Error(w, "db error: create subscription", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         id,
		"plan":       plan,
		"status":     status,
		"started_at": startedAt,
		"renew_at":   renewAt,
	})
}

func GetMySubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIDKey).(int64)

	sql := `SELECT id, plan, status, started_at, renew_at 
	        FROM subscriptions WHERE user_id=$1 LIMIT 1`

	var id int64
	var plan, status string
	var startedAt, renewAt time.Time

	err := db.Pool.QueryRow(context.Background(), sql, userID).
		Scan(&id, &plan, &status, &startedAt, &renewAt)
	if err != nil {
		http.Error(w, "no subscription found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         id,
		"plan":       plan,
		"status":     status,
		"started_at": startedAt,
		"renew_at":   renewAt,
	})
}
