package models

import "time"

type User struct {
	ID           int64     `db:"id"`
	Email        string    `db:"email"`
	PasswordHash string    `db:"password_hash"`
	FirstName    *string   `db:"first_name"`
	LastName     *string   `db:"last_name"`
	Locale       string    `db:"locale"`
	CreatedAt    time.Time `db:"created_at"`
}
