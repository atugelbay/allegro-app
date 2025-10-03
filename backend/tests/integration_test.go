package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"allegro/backend/config"
	"allegro/backend/internal/auth"
	"allegro/backend/internal/db"
	"allegro/backend/internal/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupTestRouter создает тестовый роутер
func setupTestRouter() *chi.Mux {
	r := chi.NewRouter()

	// Auth routes
	r.Post("/auth/register", handlers.RegisterHandler)
	r.Post("/auth/login", handlers.LoginHandler)

	// Protected routes
	r.Group(func(protected chi.Router) {
		protected.Use(auth.JWTMiddleware)

		protected.Get("/me", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"message":"Hello, authenticated user!"}`))
		})

		// Subscription routes
		protected.Post("/subscriptions", handlers.CreateSubscriptionHandler)
		protected.Get("/subscriptions/me", handlers.GetMySubscriptionHandler)

		// Premium content (requires subscription)
		protected.Group(func(premium chi.Router) {
			premium.Use(auth.RequireSubscription)
			premium.Get("/lessons", func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"lessons":["Guitar Basics","Piano Fundamentals","Music Theory"]}`))
			})
		})
	})

	return r
}

// setupTestDB инициализирует подключение к тестовой БД
func setupTestDB(t *testing.T) {
	if db.Pool == nil {
		config.LoadConfig()
		pool, err := db.Connect()
		if err != nil {
			t.Skip("Skipping test: could not connect to database:", err)
		}
		db.Pool = pool
	}
}

func TestHealthEndpoint(t *testing.T) {
	r := setupTestRouter()

	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	// Ожидаем 404, так как в тестовом роутере нет /health
	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestSubscriptionEndpointExists(t *testing.T) {
	r := setupTestRouter()

	// Тестируем, что эндпоинт существует (без аутентификации должен вернуть 401)
	req := httptest.NewRequest("POST", "/subscriptions", bytes.NewBufferString(`{"plan":"basic"}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	// Должен вернуть 401 Unauthorized, а не 404 Not Found
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestUserRegistration(t *testing.T) {
	setupTestDB(t)
	r := setupTestRouter()

	user := map[string]string{
		"email":    "test@integration.com",
		"password": "testpass123",
	}

	userJson, _ := json.Marshal(user)
	req := httptest.NewRequest("POST", "/auth/register", bytes.NewBuffer(userJson))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	t.Logf("Response status: %d", w.Code)
	t.Logf("Response body: %s", w.Body.String())

	// Проверяем, что регистрация работает или пользователь уже существует
	assert.True(t, w.Code == http.StatusOK || w.Code == http.StatusCreated || w.Code == http.StatusConflict)
}

func TestCompleteUserFlow(t *testing.T) {
	setupTestDB(t)
	r := setupTestRouter()

	// 1. Регистрация пользователя
	user := map[string]string{
		"email":    "flowtest@integration.com",
		"password": "testpass123",
	}

	userJson, _ := json.Marshal(user)
	req := httptest.NewRequest("POST", "/auth/register", bytes.NewBuffer(userJson))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// 2. Логин
	req = httptest.NewRequest("POST", "/auth/login", bytes.NewBuffer(userJson))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Login response status: %d", w.Code)
	t.Logf("Login response body: %s", w.Body.String())

	require.Equal(t, http.StatusOK, w.Code)

	var loginResp map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &loginResp)
	require.NoError(t, err)
	require.NotEmpty(t, loginResp["access_token"])

	accessToken := loginResp["access_token"]

	// 3. Доступ к защищенному эндпоинту
	req = httptest.NewRequest("GET", "/me", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	// 4. Попытка доступа к премиум контенту без подписки
	req = httptest.NewRequest("GET", "/lessons", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Lessons without subscription - status: %d, body: %s", w.Code, w.Body.String())
	// Должен быть запрещен доступ без подписки
	assert.Equal(t, http.StatusForbidden, w.Code)

	// 5. Создание подписки
	subscription := map[string]string{"plan": "basic"}
	subJson, _ := json.Marshal(subscription)
	req = httptest.NewRequest("POST", "/subscriptions", bytes.NewBuffer(subJson))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Subscription response status: %d", w.Code)
	t.Logf("Subscription response body: %s", w.Body.String())

	assert.Equal(t, http.StatusOK, w.Code)

	var subResp map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &subResp)
	require.NoError(t, err)
	assert.Equal(t, "basic", subResp["plan"])
	assert.Equal(t, "active", subResp["status"])

	// 6. Доступ к премиум контенту с подпиской
	req = httptest.NewRequest("GET", "/lessons", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Lessons with subscription - status: %d, body: %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusOK, w.Code)

	var lessonsResp map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &lessonsResp)
	require.NoError(t, err)
	assert.NotEmpty(t, lessonsResp["lessons"])
}
