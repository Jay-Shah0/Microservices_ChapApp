package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	redisClient := initRedis(os.Getenv("REDIS_ADDR"))
	startKafkaConsumer(os.Getenv("KAFKA_BROKERS"), redisClient)
}
