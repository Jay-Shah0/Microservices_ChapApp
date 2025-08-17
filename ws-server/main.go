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

	godotenv.Load()

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

	// *** Start background serve loop for go-socket.io ***
	go func() {
		if err := srv.Serve(); err != nil {
			log.Fatalf("socketio serve error: %v", err)
		}
	}()
	defer srv.Close()

	http.Handle("/socket.io/", srv)
	log.Printf("ws-server listening on :%s", os.Getenv("PORT"))
	log.Fatal(http.ListenAndServe(":"+os.Getenv("PORT"), nil))
}
