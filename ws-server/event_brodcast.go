package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/redis/go-redis/v9"
	socketio "github.com/googollee/go-socket.io"
)

var redisClient *redis.Client

func initRedis(addr string) {
	redisClient = redis.NewClient(&redis.Options{Addr: addr})
}

type GroupedEvent struct {
    Type       string                 `json:"type"`
    Data       map[string]interface{} `json:"data"`
    Recipients []string               `json:"recipients"`
}

func subscribeRedisAndBroadcast(channel string) {
    pubsub := redisClient.Subscribe(context.Background(), channel)
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
}

