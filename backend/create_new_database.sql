-- Создание нового пользователя и базы данных для Sonara Space
-- Выполните эти команды в PostgreSQL

-- Создание пользователя
CREATE USER sonara_space WITH PASSWORD 'sonara_space_pass';

-- Создание базы данных
CREATE DATABASE sonara_space OWNER sonara_space;

-- Предоставление привилегий
GRANT ALL PRIVILEGES ON DATABASE sonara_space TO sonara_space;

-- Подключение к новой базе данных
\c sonara_space;

-- Предоставление привилегий на схему
GRANT ALL ON SCHEMA public TO sonara_space;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sonara_space;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sonara_space;
