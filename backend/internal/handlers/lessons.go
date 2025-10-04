package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"allegro/backend/internal/auth"
	"allegro/backend/internal/db"
	"allegro/backend/internal/models"
)

// LessonWithExercises представляет урок с упражнениями
type LessonWithExercises struct {
	models.Lesson
	Exercises []models.Exercise `json:"exercises"`
}

// ProgressRequest представляет запрос на обновление прогресса
type ProgressRequest struct {
	ExerciseID int64  `json:"exercise_id"`
	Status     string `json:"status"`
}

// ProgressResponse представляет ответ с прогрессом пользователя
type ProgressResponse struct {
	UserID             int64   `json:"user_id"`
	LessonID           int64   `json:"lesson_id"`
	LessonTitle        string  `json:"lesson_title"`
	TotalExercises     int     `json:"total_exercises"`
	CompletedExercises int     `json:"completed_exercises"`
	Progress           float64 `json:"progress"`
}

// GetLessonsHandler возвращает список всех уроков
func GetLessonsHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	query := `SELECT id, title, instrument, description, created_at FROM lessons ORDER BY created_at`
	rows, err := db.Pool.Query(ctx, query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var lessons []models.Lesson
	for rows.Next() {
		var lesson models.Lesson
		err := rows.Scan(&lesson.ID, &lesson.Title, &lesson.Instrument, &lesson.Description, &lesson.CreatedAt)
		if err != nil {
			http.Error(w, "Database scan error", http.StatusInternalServerError)
			return
		}
		lessons = append(lessons, lesson)
	}

	if err = rows.Err(); err != nil {
		http.Error(w, "Database rows error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lessons)
}

// GetLessonHandler возвращает урок с упражнениями по ID
func GetLessonHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Получаем ID из URL
	lessonIDStr := r.URL.Path[len("/lessons/"):]
	lessonID, err := strconv.ParseInt(lessonIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid lesson ID", http.StatusBadRequest)
		return
	}

	// Получаем урок
	var lesson models.Lesson
	lessonQuery := `SELECT id, title, instrument, description, created_at FROM lessons WHERE id = $1`
	err = db.Pool.QueryRow(ctx, lessonQuery, lessonID).Scan(
		&lesson.ID, &lesson.Title, &lesson.Instrument, &lesson.Description, &lesson.CreatedAt)
	if err != nil {
		http.Error(w, "Lesson not found", http.StatusNotFound)
		return
	}

	// Получаем упражнения для урока
	exercisesQuery := `SELECT id, lesson_id, title, expected, type, order_index, created_at 
		FROM exercises WHERE lesson_id = $1 ORDER BY order_index`
	rows, err := db.Pool.Query(ctx, exercisesQuery, lessonID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var exercises []models.Exercise
	for rows.Next() {
		var exercise models.Exercise
		err := rows.Scan(&exercise.ID, &exercise.LessonID, &exercise.Title,
			&exercise.Expected, &exercise.Type, &exercise.OrderIndex, &exercise.CreatedAt)
		if err != nil {
			http.Error(w, "Database scan error", http.StatusInternalServerError)
			return
		}
		exercises = append(exercises, exercise)
	}

	if err = rows.Err(); err != nil {
		http.Error(w, "Database rows error", http.StatusInternalServerError)
		return
	}

	// Формируем ответ
	lessonWithExercises := LessonWithExercises{
		Lesson:    lesson,
		Exercises: exercises,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lessonWithExercises)
}

// UpdateProgressHandler обновляет прогресс пользователя по упражнению
func UpdateProgressHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("=== UpdateProgressHandler STARTED ===")
	log.Printf("Request method: %s, URL: %s", r.Method, r.URL.String())

	userID := r.Context().Value(auth.UserIDKey).(int64)
	ctx := r.Context()

	log.Printf("UserID from context: %d", userID)

	if userID == 0 {
		log.Printf("Error: userID is 0, user not authenticated")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req ProgressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding JSON: %v", err)
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	log.Printf("UpdateProgressHandler: userID=%d, exerciseID=%d, status=%s", userID, req.ExerciseID, req.Status)

	// Проверяем, что упражнение существует
	var exercise models.Exercise
	exerciseQuery := `SELECT id, lesson_id, title, expected, type, order_index, created_at 
		FROM exercises WHERE id = $1`
	err := db.Pool.QueryRow(ctx, exerciseQuery, req.ExerciseID).Scan(
		&exercise.ID, &exercise.LessonID, &exercise.Title,
		&exercise.Expected, &exercise.Type, &exercise.OrderIndex, &exercise.CreatedAt)
	if err != nil {
		log.Printf("Exercise not found: %v", err)
		http.Error(w, "Exercise not found", http.StatusNotFound)
		return
	}
	log.Printf("Exercise found: ID=%d, Title=%s, Expected=%s, Type=%s", exercise.ID, exercise.Title, exercise.Expected, exercise.Type)

	// Обновляем или создаем прогресс
	var completed bool
	if req.Status == "done" {
		completed = true
	}

	// Используем UPSERT для обновления или создания записи прогресса
	upsertQuery := `
		INSERT INTO progress (user_id, exercise_id, status, completed, attempts, best_score, completed_at, updated_at)
		VALUES ($1, $2, $3, $4, 1, $5, $6, $7)
		ON CONFLICT (user_id, exercise_id) 
		DO UPDATE SET 
			status = $3,
			completed = $4,
			attempts = progress.attempts + 1,
			best_score = GREATEST(progress.best_score, $5),
			completed_at = CASE WHEN $4 = true THEN COALESCE(progress.completed_at, $6) ELSE progress.completed_at END,
			updated_at = $7
	`

	var completedAt *time.Time
	now := time.Now()
	if completed {
		completedAt = &now
	}

	log.Printf("Executing SQL with params: userID=%d, exerciseID=%d, status=%s, completed=%t, best_score=100.00, completedAt=%v, now=%v",
		userID, req.ExerciseID, req.Status, completed, completedAt, now)

	_, err = db.Pool.Exec(ctx, upsertQuery, userID, req.ExerciseID, req.Status, completed, "100.00", completedAt, now)
	if err != nil {
		log.Printf("Database error in UpdateProgressHandler: %v", err)
		log.Printf("SQL query: %s", upsertQuery)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	log.Printf("SQL executed successfully")

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Progress updated successfully",
	})
}

// GetUserProgressHandler возвращает прогресс пользователя по всем урокам
func GetUserProgressHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIDKey).(int64)
	ctx := r.Context()

	// Получаем прогресс пользователя по всем урокам
	progressQuery := `
		SELECT 
			l.id as lesson_id,
			l.title as lesson_title,
			COUNT(e.id) as total_exercises,
			COUNT(CASE WHEN p.completed = true THEN 1 END) as completed_exercises
		FROM lessons l
		LEFT JOIN exercises e ON l.id = e.lesson_id
		LEFT JOIN progress p ON e.id = p.exercise_id AND p.user_id = $1
		GROUP BY l.id, l.title
		ORDER BY l.created_at
	`

	rows, err := db.Pool.Query(ctx, progressQuery, userID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var progress []ProgressResponse
	for rows.Next() {
		var p ProgressResponse
		var total, completed int
		err := rows.Scan(&p.LessonID, &p.LessonTitle, &total, &completed)
		if err != nil {
			http.Error(w, "Database scan error", http.StatusInternalServerError)
			return
		}

		p.UserID = userID
		p.TotalExercises = total
		p.CompletedExercises = completed
		if total > 0 {
			p.Progress = float64(completed) / float64(total) * 100
		} else {
			p.Progress = 0
		}

		progress = append(progress, p)
	}

	if err = rows.Err(); err != nil {
		http.Error(w, "Database rows error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(progress)
}
