package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"allegro/backend/internal/auth"
	"allegro/backend/internal/db"
)

type CreatePaymentRequest struct {
	Plan   string `json:"plan"`
	Amount int    `json:"amount"` // пока руками (например, 3990)
}

func CreatePaymentHandler(w http.ResponseWriter, r *http.Request) {
	var req CreatePaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value(auth.UserIDKey).(int64)

	// вставляем запись в payments
	sql := `INSERT INTO payments (user_id, provider, amount_kzt, status, created_at)
	        VALUES ($1, 'kaspi', $2, 'pending', NOW())
	        RETURNING id`
	var paymentID int64
	err := db.Pool.QueryRow(context.Background(), sql, userID, req.Amount).Scan(&paymentID)
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	// вместо реального Kaspi пока эмуляция:
	paymentURL := "https://kaspi.kz/pay/sandbox/" // сюда обычно приходит от Kaspi API

	json.NewEncoder(w).Encode(map[string]interface{}{
		"payment_id": paymentID,
		"plan":       req.Plan,
		"url":        paymentURL,
	})
}

func PaymentCallbackHandler(w http.ResponseWriter, r *http.Request) {
	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid callback", http.StatusBadRequest)
		return
	}

	// достаём id платежа и статус
	providerPaymentID := payload["paymentId"].(string)
	status := payload["status"].(string)
	userID := int64(payload["userId"].(float64)) // зависит от того, что шлёт Kaspi

	// обновляем запись в payments
	sql := `UPDATE payments SET status=$1, provider_payment_id=$2, raw_payload=$3, paid_at=NOW()
	        WHERE user_id=$4 RETURNING id`
	var id int64
	err := db.Pool.QueryRow(context.Background(), sql, status, providerPaymentID, payload, userID).Scan(&id)
	if err != nil {
		http.Error(w, "db error", http.StatusInternalServerError)
		return
	}

	// если оплата прошла — активируем подписку
	if status == "succeeded" {
		_, err = db.Pool.Exec(context.Background(),
			`UPDATE subscriptions SET status='active', started_at=NOW(), renew_at=NOW()+interval '30 days'
			 WHERE user_id=$1`, userID)
		if err != nil {
			http.Error(w, "subscription update failed", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("callback processed"))
}
