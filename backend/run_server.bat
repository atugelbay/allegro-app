@echo off
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=allegro
set DB_PASSWORD=allegro_pass
set DB_NAME=allegro
set DB_SSLMODE=disable
set APP_PORT=8080
set REDIS_HOST=localhost
set REDIS_PORT=6379
set JWT_SECRET=my-super-secret-jwt-key-that-is-very-long-and-secure-for-production-use
go run main.go
