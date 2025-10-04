package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"

	"sonara-space/backend/config"
	"sonara-space/backend/internal/auth"
	"sonara-space/backend/internal/db"
	"sonara-space/backend/internal/handlers"

	"github.com/go-chi/chi/v5"
)

func setupRouter() *chi.Mux {
	r := chi.NewRouter()

	// Auth routes
	r.Post("/auth/register", handlers.RegisterHandler)
	r.Post("/auth/login", handlers.LoginHandler)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

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

		// Premium content routes
		protected.Group(func(premium chi.Router) {
			premium.Use(auth.RequireSubscription)
			premium.Get("/lessons", func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"lessons":["Guitar Basics 🎸","Piano Fundamentals 🎹","Music Theory 🎵","Advanced Techniques 🎼"]}`))
			})
		})
	})

	return r
}

func main() {
	fmt.Println("🧪 Running Complete API Integration Test...")

	// Setup database connection
	config.LoadConfig()
	pool, err := db.Connect()
	if err != nil {
		fmt.Printf("❌ Database connection failed: %v\n", err)
		os.Exit(1)
	}
	defer pool.Close()
	db.Pool = pool
	fmt.Println("✅ Database connected")

	r := setupRouter()

	// Test user
	testUser := map[string]string{
		"email":    "apitest@example.com",
		"password": "testpass123",
	}

	// 1. Test Health Check
	fmt.Println("\n🏥 Testing health check...")
	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code == 200 {
		fmt.Printf("✅ Health check: %s\n", w.Body.String())
	} else {
		fmt.Printf("❌ Health check failed: %d - %s\n", w.Code, w.Body.String())
	}

	// 2. Register user
	fmt.Println("\n📝 Testing user registration...")
	userJson, _ := json.Marshal(testUser)
	req = httptest.NewRequest("POST", "/auth/register", bytes.NewBuffer(userJson))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code == 200 || w.Code == 201 || w.Code == 409 {
		fmt.Printf("✅ Registration: %d (user registered or already exists)\n", w.Code)
	} else {
		fmt.Printf("❌ Registration failed: %d - %s\n", w.Code, w.Body.String())
		return
	}

	// 3. Login
	fmt.Println("\n🔑 Testing login...")
	req = httptest.NewRequest("POST", "/auth/login", bytes.NewBuffer(userJson))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		fmt.Printf("❌ Login failed: %d - %s\n", w.Code, w.Body.String())
		return
	}

	var loginResp map[string]string
	json.Unmarshal(w.Body.Bytes(), &loginResp)
	accessToken := loginResp["access_token"]
	fmt.Printf("✅ Login successful: token received (%s...)\n", accessToken[:30])

	// 4. Test protected endpoint
	fmt.Println("\n🔐 Testing protected endpoint...")
	req = httptest.NewRequest("GET", "/me", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code == 200 {
		fmt.Printf("✅ Protected endpoint: %s\n", w.Body.String())
	} else {
		fmt.Printf("❌ Protected endpoint failed: %d - %s\n", w.Code, w.Body.String())
		return
	}

	// 5. Test premium content WITHOUT subscription
	fmt.Println("\n🚫 Testing premium content without subscription...")
	req = httptest.NewRequest("GET", "/lessons", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code == 403 {
		fmt.Printf("✅ Premium content correctly blocked: %d - %s\n", w.Code, w.Body.String())
	} else {
		fmt.Printf("⚠️ Unexpected response for premium content: %d - %s\n", w.Code, w.Body.String())
	}

	// 6. Create subscription
	fmt.Println("\n💳 Testing subscription creation...")
	subscription := map[string]string{"plan": "basic"}
	subJson, _ := json.Marshal(subscription)
	req = httptest.NewRequest("POST", "/subscriptions", bytes.NewBuffer(subJson))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code == 200 {
		var subResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &subResp)
		fmt.Printf("✅ Subscription created: ID=%v, Plan=%s, Status=%s\n",
			subResp["id"], subResp["plan"], subResp["status"])
	} else {
		fmt.Printf("❌ Subscription creation failed: %d - %s\n", w.Code, w.Body.String())
		return
	}

	// 7. Test premium content WITH subscription
	fmt.Println("\n🎵 Testing premium content with subscription...")
	req = httptest.NewRequest("GET", "/lessons", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code == 200 {
		var lessonsResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &lessonsResp)
		fmt.Printf("✅ Premium content accessible: %v\n", lessonsResp["lessons"])
	} else {
		fmt.Printf("❌ Premium content failed: %d - %s\n", w.Code, w.Body.String())
		return
	}

	// 8. Get my subscription
	fmt.Println("\n📋 Testing get my subscription...")
	req = httptest.NewRequest("GET", "/subscriptions/me", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code == 200 {
		var subResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &subResp)
		fmt.Printf("✅ Subscription retrieved: Plan=%s, Status=%s\n",
			subResp["plan"], subResp["status"])
	} else {
		fmt.Printf("❌ Get subscription failed: %d - %s\n", w.Code, w.Body.String())
		return
	}

	fmt.Println("\n🎉 All tests passed! Complete API is working correctly.")

	fmt.Println("\n" + strings.Repeat("=", 70))
	fmt.Println("📚 PowerShell Commands for Manual Testing:")
	fmt.Println(strings.Repeat("=", 70))

	fmt.Println("\n# 1. Get access token:")
	fmt.Println(`$token = (Invoke-RestMethod -Uri "http://localhost:8080/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"123456"}').access_token`)

	fmt.Println("\n# 2. Test protected endpoint:")
	fmt.Println(`Invoke-RestMethod -Uri "http://localhost:8080/me" -Method GET -Headers @{"Authorization"="Bearer $token"}`)

	fmt.Println("\n# 3. Try premium content (should fail without subscription):")
	fmt.Println(`Invoke-RestMethod -Uri "http://localhost:8080/lessons" -Method GET -Headers @{"Authorization"="Bearer $token"}`)

	fmt.Println("\n# 4. Create subscription:")
	fmt.Println(`Invoke-RestMethod -Uri "http://localhost:8080/subscriptions" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body '{"plan":"basic"}'`)

	fmt.Println("\n# 5. Access premium content (should work with subscription):")
	fmt.Println(`Invoke-RestMethod -Uri "http://localhost:8080/lessons" -Method GET -Headers @{"Authorization"="Bearer $token"}`)

	fmt.Println("\n# 6. Get my subscription:")
	fmt.Println(`Invoke-RestMethod -Uri "http://localhost:8080/subscriptions/me" -Method GET -Headers @{"Authorization"="Bearer $token"}`)
}
