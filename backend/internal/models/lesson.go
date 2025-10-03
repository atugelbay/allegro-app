package models

import "time"

type Lesson struct {
	ID          int64     `db:"id"`
	Title       string    `db:"title"`
	Instrument  string    `db:"instrument"`
	Description *string   `db:"description"`
	CreatedAt   time.Time `db:"created_at"`
}

type Exercise struct {
	ID         int64     `db:"id"`
	LessonID   int64     `db:"lesson_id"`
	Title      string    `db:"title"`
	Expected   string    `db:"expected"`
	Type       string    `db:"type"`
	OrderIndex int       `db:"order_index"`
	CreatedAt  time.Time `db:"created_at"`
}

type Progress struct {
	ID          int64      `db:"id"`
	UserID      int64      `db:"user_id"`
	ExerciseID  int64      `db:"exercise_id"`
	Completed   bool       `db:"completed"`
	Attempts    int        `db:"attempts"`
	BestScore   float64    `db:"best_score"`
	CompletedAt *time.Time `db:"completed_at"`
	CreatedAt   time.Time  `db:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at"`
}
