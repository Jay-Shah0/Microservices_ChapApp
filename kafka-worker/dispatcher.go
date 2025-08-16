package main

import (
	"encoding/json"
	"log"
)

type GroupedEvent struct {
	Type       string                 `json:"type"`
	Data       map[string]interface{} `json:"data"`
	Recipients []string               `json:"recipients"`
}


func dispatchEvent(km *KafkaMessage) {
	serverGroups := make(map[string][]string)

	for _, userID := range km.Recipients {
		server := getUserServer(userID)
		if server == "" {
			continue
		}
		serverGroups[server] = append(serverGroups[server], userID)
	}

	for server, users := range serverGroups {
		grouped := GroupedEvent{
			Type:       km.Type,
			Data:       km.Data,
			Recipients: users,
		}
		payload, _ := json.Marshal(grouped)
		publishToServerChannel(server, payload)
	}
}

func publishToServerChannel(server string, payload []byte) {
	channel := "server:" + server
	if err := redisClient.Publish(ctx, channel, payload).Err(); err != nil {
		log.Printf("Failed to publish to %s: %v", channel, err)
	}
}
