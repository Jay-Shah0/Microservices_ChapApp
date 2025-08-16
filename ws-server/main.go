package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx := context.Background()
	
	// 1) Kafka producer
	kafkaProducer, err := initKafkaProducer(ctx, os.Getenv("KAFKA_BROKERS"))
	if err != nil {
		log.Fatalf("Failed to connect to Kafka: %v", err)
	}

	// 2) Redis client + subscriber
	redisClient, err := initRedis(ctx, os.Getenv("REDIS_ADDR"))
    if err != nil {
        log.Fatalf("Failed to connect to Redis: %v", err)
    }

	userSockets := &sync.Map{}

	go subscribeRedisAndBroadcast(ctx, redisClient, os.Getenv("SERVER_CHANNEL"), userSockets)

	srv, err := initSocketServer(redisClient, kafkaProducer, os.Getenv("KAFKA_TOPIC"), os.Getenv("SERVER_CHANNEL"), userSockets)
	if err != nil {
		log.Fatal(err)
	}

	http.Handle("/socket.io/", srv)
	log.Printf("ws-server listening on :%s", os.Getenv("PORT"))
	log.Fatal(http.ListenAndServe(":"+os.Getenv("PORT"), nil))
}
