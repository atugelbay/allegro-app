package auth

import (
	"net/http"
)

func RequireSubscription(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Временно отключаем проверку подписки для тестирования
		// userID := r.Context().Value(UserIDKey).(int64)

		// var exists bool
		// err := db.Pool.QueryRow(
		// 	context.Background(),
		// 	"SELECT EXISTS (SELECT 1 FROM subscriptions WHERE user_id=$1 AND status IN ('active', 'trialing'))",
		// 	userID,
		// ).Scan(&exists)

		// if err != nil || !exists {
		// 	http.Error(w, "subscription required", http.StatusPaymentRequired)
		// 	return
		// }

		next.ServeHTTP(w, r)
	})
}
