@echo off
echo Setting up Sonara Space database...
echo.

echo Step 1: Creating database and user (requires PostgreSQL admin access)
echo Please run the following commands in PostgreSQL as admin:
echo.
echo CREATE USER sonara_space WITH PASSWORD 'sonara_space_pass';
echo CREATE DATABASE sonara_space OWNER sonara_space;
echo GRANT ALL PRIVILEGES ON DATABASE sonara_space TO sonara_space;
echo.
pause

echo Step 2: Running migrations and setup...
go run setup_new_database.go

echo.
echo ✅ Database setup completed!
echo You can now run: go run main.go
pause
