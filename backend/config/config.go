package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort string
	DBHost  string
	DBUser  string
	DBPass  string
	DBName  string
	Redis   string
	JWT     string
}

func LoadConfig() (Config, error) {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	return Config{
		AppPort: os.Getenv("APP_PORT"),
		DBHost:  os.Getenv("DB_HOST"),
		DBUser:  os.Getenv("DB_USER"),
		DBPass:  os.Getenv("DB_PASSWORD"),
		DBName:  os.Getenv("DB_NAME"),
		Redis:   os.Getenv("REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"),
		JWT:     os.Getenv("JWT_SECRET"),
	}, nil
}
