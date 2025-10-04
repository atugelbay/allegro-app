package auth

import (
	"context"
	"log"
	"net/http"
	"strings"
)

type contextKey string

const UserIDKey contextKey = "user_id"

func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("=== JWTMiddleware STARTED ===")
		log.Printf("JWTMiddleware: %s %s\n", r.Method, r.URL.Path)

		authHeader := r.Header.Get("Authorization")
		log.Printf("Auth header: %s\n", authHeader)

		if authHeader == "" {
			log.Printf("JWTMiddleware: missing token for %s %s\n", r.Method, r.URL.Path)
			http.Error(w, "missing token", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		log.Printf("Token string: %s\n", tokenStr[:50]+"...")

		claims, err := ParseToken(tokenStr)
		if err != nil {
			log.Printf("JWTMiddleware: invalid token for %s %s: %v\n", r.Method, r.URL.Path, err)
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		log.Printf("JWTMiddleware: valid token for userID=%d, path=%s\n", claims.UserID, r.URL.Path)
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		log.Printf("=== JWTMiddleware CALLING NEXT ===\n")
		next.ServeHTTP(w, r.WithContext(ctx))
		log.Printf("=== JWTMiddleware FINISHED ===\n")
	})
}
