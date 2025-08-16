package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/joho/godotenv"
	"github.com/segmentio/kafka-go"
)

func initKafkaProducer(ctx context.Context, brokers string) (*kafka.Writer, error) {
	brokerList := strings.Split(brokers, ",")
	if len(brokerList) == 0 || brokerList[0] == "" {
		return nil, fmt.Errorf("KAFKA_BROKERS is not set or is empty")
	}

	// 1. Health Check: Attempt to connect to the first broker.
	// This will fail if Kafka is not reachable.
	conn, err := kafka.DialContext(ctx, "tcp", brokerList[0])
	if err != nil {
		return nil, err
	}
	conn.Close() 
	log.Println("Successfully connected to Kafka.")

	producer := kafka.NewWriter(kafka.WriterConfig{
		Brokers:  brokerList,
		Balancer: &kafka.LeastBytes{},
		Async:    true,
	})

	return producer, nil
}

type KafkaMessage struct {
	Event      string        `json:"event"`
	Recipients []string      `json:"recipients"`
	Data       interface{}   `json:"data"`
}

func produceToKafka(ctx context.Context, producer *kafka.Writer, topic string, eventName string, recipients []string, data interface{}) {

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
	err = producer.WriteMessages(ctx, kafka.Message{
		Topic: topic,
		Value: payload,
	})
	if err != nil {
		log.Printf("Failed to write message to Kafka: %v", err)
	}

}

