package main

import (
	"context"
	"encoding/json"
	"log"
	"strings"
	"os"

	"github.com/segmentio/kafka-go"
	"github.com/joho/godotenv"
)

var kafkaProducer *kafka.Writer

func initKafkaProducer(brokers string) {
	kafkaProducer = kafka.NewWriter(kafka.WriterConfig{
		Brokers: strings.Split(brokers, ","),
		// Topic is set per-message, but you could set a default here
		Balancer: &kafka.LeastBytes{},
		Async:    true, // Make the writer asynchronous
	})
}

type KafkaMessage struct {
	Event      string        `json:"event"`
	Recipients []string      `json:"recipients"`
	Data       interface{}   `json:"data"`
}

func produceToKafka(ctx context.Context, eventName string, recipients []string, data interface{}) {
	// Serialize message
	msg := KafkaMessage{
		Event:      eventName,
		Recipients: recipients,
		Data:       data,
	}

	payload, err  := json.Marshal(msg)
	if err != nil {
		log.Printf("Failed to marshal Kafka message: %v", err)
		return
	}

	err = godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Send to Kafka
	err = kafkaProducer.WriteMessages(ctx, kafka.Message{
		Topic: os.Getenv("KAFKA_TOPIC"),
		Value: payload,
	})
	if err != nil {
		log.Printf("Failed to write message to Kafka: %v", err)
	}

}

