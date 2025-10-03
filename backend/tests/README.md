# Тесты API Allegro

Эта папка содержит все тесты для API приложения Allegro.

## Структура

```
tests/
├── README.md              # Этот файл
├── integration_test.go     # Интеграционные тесты Go
└── standalone/
    └── main.go            # Автономный тест API
```

## Запуск тестов

### 1. Интеграционные тесты (Go)

Запуск всех интеграционных тестов:
```bash
cd backend
go test -v ./tests
```

Запуск конкретного теста:
```bash
go test -v ./tests -run="TestCompleteUserFlow"
```

### 2. Автономный тест API

Полный тест всех функций API:
```bash
cd backend
go run tests/standalone/main.go
```

## Что тестируется

### Интеграционные тесты (`integration_test.go`)
- ✅ Существование эндпоинтов
- ✅ Регистрация пользователей
- ✅ Аутентификация (логин/токены)
- ✅ Защищенные эндпоинты
- ✅ Создание подписок
- ✅ Доступ к премиум контенту
- ✅ Полный пользовательский флоу

### Автономный тест (`standalone/main.go`)
- ✅ Health check
- ✅ Регистрация и логин
- ✅ Защищенные эндпоинты
- ✅ Проверка блокировки премиум контента без подписки
- ✅ Создание подписки
- ✅ Доступ к премиум контенту с подпиской
- ✅ Получение информации о подписке

## API Endpoints

### Публичные эндпоинты
- `GET /health` - проверка состояния сервера
- `POST /auth/register` - регистрация пользователя
- `POST /auth/login` - вход пользователя

### Защищенные эндпоинты (требуют JWT токен)
- `GET /me` - информация о текущем пользователе
- `POST /subscriptions` - создание подписки
- `GET /subscriptions/me` - получение своей подписки

### Премиум эндпоинты (требуют активную подписку)
- `GET /lessons` - доступ к урокам

## Ручное тестирование через PowerShell

### Получение токена
```powershell
$token = (Invoke-RestMethod -Uri "http://localhost:8080/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"123456"}').access_token
```

### Тестирование защищенного эндпоинта
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/me" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

### Попытка доступа к премиум контенту (без подписки)
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/lessons" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

### Создание подписки
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/subscriptions" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body '{"plan":"basic"}'
```

### Доступ к премиум контенту (с подпиской)
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/lessons" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

### Получение информации о подписке
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/subscriptions/me" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

## Требования

- Go 1.20+
- PostgreSQL (через Docker)
- Зависимости: `testify/assert`, `testify/require`, `chi/v5`

## Настройка

1. Убедитесь, что база данных запущена:
   ```bash
   cd ../deploy
   docker compose up -d
   ```

2. Проверьте файл `.env` с правильными настройками БД

3. Запустите тесты

## Примеры ответов API

### Успешный логин
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Создание подписки
```json
{
  "id": 1,
  "plan": "basic",
  "status": "active",
  "started_at": "2025-10-03T00:00:00Z",
  "renew_at": "2025-11-03T00:00:00Z"
}
```

### Премиум контент
```json
{
  "lessons": [
    "Guitar Basics 🎸",
    "Piano Fundamentals 🎹", 
    "Music Theory 🎵",
    "Advanced Techniques 🎼"
  ]
}
```