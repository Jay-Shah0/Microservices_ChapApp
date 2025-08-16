package main

import (
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

func initRedis(addr string) (client *redis.Client) {
	client = redis.NewClient(&redis.Options{Addr: addr})
	return client
}

func getUserServerChannel(userID string, redisClient *redis.Client) (string, error) {
	serverChannel, err := redisClient.HGet(ctx, "user:server", userID).Result()
	if err == redis.Nil {
		// This means the user was not found in the hash. It's not a connection error.
		log.Printf("User %s does not have a server channel set.", userID)
		return "", fmt.Errorf("user %s not found", userID)
	} else if err != nil {
		// This handles other errors, like a connection problem.
		log.Printf("Failed to get user channel from Redis: %v", err)
		return "", err
	}
	return serverChannel, nil
}
