package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	
	// 1) Kafka producer
	initKafkaProducer(os.Getenv("KAFKA_ADDRS"))

	// 2) Redis client + subscriber
	initRedis(os.Getenv("REDIS_ADDR"))
	go subscribeRedisAndBroadcast(os.Getenv("SERVER_CHANNEL"))

	// 3) Socket.IO server
	srv, err := initSocketServer()
	if err != nil {
		log.Fatal(err)
	}

	http.Handle("/socket.io/", srv)
	log.Printf("ws-server listening on :%s", os.Getenv("PORT"))
	log.Fatal(http.ListenAndServe(":"+os.Getenv("PORT"), nil))
}
