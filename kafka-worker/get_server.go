package main

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

var redisClient *redis.Client
var ctx = context.Background()

func initRedis(addr string) {
	redisClient = redis.NewClient(&redis.Options{Addr: addr})
}

func getUserServer(userID string) string {
	server, err := redisClient.HGet(ctx, "user:server", userID).Result()
	if err != nil {
		log.Printf("User %s server not found or error: %v", userID, err)
		return ""
	}
	return server
}
