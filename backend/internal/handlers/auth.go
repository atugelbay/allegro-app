package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"allegro/backend/internal/auth"
	"allegro/backend/internal/db"
	"allegro/backend/internal/models"
)

type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Валидация обязательных полей
	if req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" {
		http.Error(w, "all fields are required", http.StatusBadRequest)
		return
	}

	// Хэш пароля
	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	// Вставляем в БД
	sql := `INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, created_at`
	var user models.User
	err = db.Pool.QueryRow(context.Background(), sql, req.Email, hash, req.FirstName, req.LastName).Scan(&user.ID, &user.CreatedAt)
	if err != nil {
		http.Error(w, "user already exists or database error", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         user.ID,
		"email":      req.Email,
		"first_name": req.FirstName,
		"last_name":  req.LastName,
	})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// ищем юзера
	sql := `SELECT id, password_hash FROM users WHERE email=$1`
	var id int64
	var hash string
	err := db.Pool.QueryRow(context.Background(), sql, req.Email).Scan(&id, &hash)
	if err != nil {
		http.Error(w, "user not found", http.StatusUnauthorized)
		return
	}

	// сравниваем пароль
	if !auth.CheckPasswordHash(req.Password, hash) {
		http.Error(w, "invalid password", http.StatusUnauthorized)
		return
	}

	// генерируем токены
	access, _ := auth.GenerateAccessToken(id)
	refresh, _ := auth.GenerateRefreshToken(id)

	json.NewEncoder(w).Encode(map[string]string{
		"access_token":  access,
		"refresh_token": refresh,
	})
}
