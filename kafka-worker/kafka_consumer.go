package main

import (
	"context"
	"encoding/json"
	"log"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/segmentio/kafka-go"
)

type KafkaMessage struct {
	Type       string                 `json:"type"`
	Data       map[string]interface{} `json:"data"`
	Recipients []string               `json:"recipients"`
}

func startKafkaConsumer(brokers string, Redisclient *redis.Client) {

    r := kafka.NewReader(kafka.ReaderConfig{
        Brokers:        strings.Split(brokers, ","),
        Topic:          "chat-events",
        GroupID:        "chat-app-worker-group", // Consumer group ID
        MinBytes:       10e3,                    // 10KB
        MaxBytes:       10e6,                    // 10MB
        CommitInterval: time.Second,             // Flush commits every second
    })
    defer r.Close()

    log.Println("Kafka consumer started. Waiting for messages...")

    for {
        // The ReadMessage method blocks until a new message is received
        m, err := r.ReadMessage(context.Background())
        if err != nil {
            log.Printf("Error while reading message: %v", err)
            continue 
        }

        var msg KafkaMessage
        if err := json.Unmarshal(m.Value, &msg); err != nil {
            log.Println("Invalid Kafka message:", err)
            continue
        }

        log.Printf("Received message for recipients: %v", msg.Recipients)
        dispatchEvent(&msg, Redisclient)
    }
}
