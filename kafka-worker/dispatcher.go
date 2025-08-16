package main

import (
	"encoding/json"
	"log"

	"github.com/redis/go-redis/v9"
)

type GroupedEvent struct {
	Type       string                 `json:"type"`
	Data       map[string]interface{} `json:"data"`
	Recipients []string               `json:"recipients"`
}


func dispatchEvent(km *KafkaMessage, redisClient *redis.Client) {
	serverGroups := make(map[string][]string)

	for _, userID := range km.Recipients {
		serverChannel, err := getUserServerChannel(userID, redisClient)
		if err != nil {
			log.Printf("Error getting server for user %s: %v", userID, err)
			continue
		}
		if serverChannel == "" {
			continue // Skip if no server is found for the user
		}

		serverGroups[serverChannel] = append(serverGroups[serverChannel], userID)
	}

	for serverChannel, users := range serverGroups {
		grouped := GroupedEvent{
			Type:       km.Type,
			Data:       km.Data,
			Recipients: users,
		}
		payload, _ := json.Marshal(grouped)
		publishToServerChannel(serverChannel, payload, redisClient)
	}
}

func publishToServerChannel(serverChannel string, payload []byte, redisClient *redis.Client) {
	if err := redisClient.Publish(ctx, serverChannel, payload).Err(); err != nil {
		log.Printf("Failed to publish to %s: %v", serverChannel, err)
	}
}
