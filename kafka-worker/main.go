package main

import (
	"os"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	redisClient := initRedis(os.Getenv("REDIS_ADDR"))
	startKafkaConsumer(os.Getenv("KAFKA_BROKERS"), redisClient)
}
