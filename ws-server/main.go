package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"github.com/twmb/franz-go/pkg/kgo"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Event struct {
	Type    string      `json:"type"`             // message / typing / stop typing
	ChatID  string      `json:"chatId"`           // Chat ID
	Message interface{} `json:"message,omitempty"`// message is just string content
	UserID  string      `json:"userId"`           // Sender
}

type Message struct {
	Sender   string    `bson:"sender"`
	Content  string    `bson:"content"`
	Chat     string    `bson:"chat"`
	ReadBy   []string  `bson:"readBy"`
	CreatedAt time.Time `bson:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt"`
}

var (
	upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	ctx      = context.Background()
)

var userSockets = struct {
	sync.RWMutex
	conns map[string]*websocket.Conn
}{conns: make(map[string]*websocket.Conn)}

func main() {
	_ = godotenv.Load()

	// MongoDB setup
	mongoURI := os.Getenv("MONGODB_URI")
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("MongoDB connection error:", err)
	}
	msgCollection := mongoClient.Database("chat-app").Collection("messages")

	// Redis setup
	rdb := redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_ADDR"),
		DB:   0,
	})

	// Kafka setup
	kafkaClient, err := kgo.NewClient(kgo.SeedBrokers("localhost:9092"))
	if err != nil {
		log.Fatal("Kafka connection error:", err)
	}
	defer kafkaClient.Close()

	// Redis subscriber
	go func() {
		pubsub := rdb.Subscribe(ctx, "message-events")
		ch := pubsub.Channel()

		for msg := range ch {
			var evt Event
			if err := json.Unmarshal([]byte(msg.Payload), &evt); err != nil {
				log.Println("Redis Unmarshal error:", err)
				continue
			}

			userSockets.RLock()
			conn, ok := userSockets.conns[evt.UserID]
			userSockets.RUnlock()

			if ok {
				_ = conn.WriteJSON(evt)
			} else if evt.Type == "message" {
				// Save message to DB for offline user
				doc := Message{
					Sender:    evt.UserID,
					Content:   evt.Message.(string),
					Chat:      evt.ChatID,
					ReadBy:    []string{evt.UserID},
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				}
				if _, err := msgCollection.InsertOne(ctx, doc); err != nil {
					log.Println("Mongo insert error:", err)
				}
			}
		}
	}()

	// WebSocket handler
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}
		defer conn.Close()

		// First message must be setup
		_, setupMsg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Setup read error:", err)
			return
		}
		var setupData Event
		if err := json.Unmarshal(setupMsg, &setupData); err != nil || setupData.Type != "setup" {
			log.Println("Invalid setup message")
			return
		}
		userID := setupData.UserID

		userSockets.Lock()
		userSockets.conns[userID] = conn
		userSockets.Unlock()

		conn.WriteJSON(map[string]string{"type": "connected"})

		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}

			var evt Event
			if err := json.Unmarshal(msg, &evt); err != nil {
				log.Println("Unmarshal error:", err)
				continue
			}

			// Kafka - only for messages
			if evt.Type == "message" {
				payload, _ := json.Marshal(evt)
				record := kgo.Record{Value: payload, Topic: "incoming-messages"}
				go kafkaClient.Produce(ctx, &record, nil)
			}

			// Redis publish for all events
			go func() {
				payload, _ := json.Marshal(evt)
				if err := rdb.Publish(ctx, "message-events", payload).Err(); err != nil {
					log.Println("Redis publish error:", err)
				}
			}()
		}

		// Cleanup
		userSockets.Lock()
		delete(userSockets.conns, userID)
		userSockets.Unlock()
	})

	log.Println("WebSocket server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
