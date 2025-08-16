package main

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	socketio "github.com/googollee/go-socket.io"
	"github.com/redis/go-redis/v9"
)

// This function is already correct.
func initRedis(ctx context.Context, addr string) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	// Ping to verify the connection is alive at startup.
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	log.Println("Successfully connected to Redis.")
	return client, nil
}

type GroupedEvent struct {
	Type       string                 `json:"type"`
	Data       map[string]interface{} `json:"data"`
	Recipients []string               `json:"recipients"`
}

func subscribeRedisAndBroadcast(ctx context.Context, client *redis.Client, channel string, userSockets *sync.Map) {
	// 1. Wrap the entire subscription in a permanent loop.
	for {
		pubsub := client.Subscribe(ctx, channel)

		// Check for an error on the initial subscription.
		_, err := pubsub.Receive(ctx)
		if err != nil {
			log.Printf("Error subscribing to Redis: %v. Reconnecting in 5 seconds...", err)
			time.Sleep(5 * time.Second)
			continue 
		}

		log.Printf("Successfully subscribed to Redis channel: %s", channel)
		ch := pubsub.Channel()

		for msg := range ch {
			var ge GroupedEvent
			if err := json.Unmarshal([]byte(msg.Payload), &ge); err != nil {
				log.Println("Failed to unmarshal GroupedEvent:", err)
				continue
			}

			for _, userID := range ge.Recipients {
				if so, ok := userSockets.Load(userID); ok {
					conn := so.(socketio.Conn)
					conn.Emit(ge.Type, ge.Data)
				}
			}
		}

		log.Println("Redis subscription lost. Attempting to reconnect...")
		pubsub.Close()
		time.Sleep(5 * time.Second)
	}
}