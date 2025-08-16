package main

import (
	"context"
	"errors"
	"log"
	"sync"

	socketio "github.com/googollee/go-socket.io"
	"github.com/redis/go-redis/v9"
	"github.com/segmentio/kafka-go"
)


func initSocketServer(redisClient *redis.Client, kafkaProducer *kafka.Writer, topic string, serverChannel string, userSockets *sync.Map) (*socketio.Server, error) {
	srv := socketio.NewServer(nil)

	srv.OnConnect("/", func(so socketio.Conn) error {
		userID := so.RemoteHeader().Get("X-User-Id")

		if userID == "" {
			log.Println("Rejecting connection: Missing or empty X-User-Id header.")
			return errors.New("unauthorized") 
		}

		so.SetContext(userID)
		userSockets.Store(userID, so)

		//Register the user's server location in Redis
		err := redisClient.HSet(
			context.Background(),
			"user:server",
			userID,
			serverChannel,
		).Err()
		if err != nil {
			log.Println("Redis HSet error:", err)
		}

		log.Printf("User %s connected and registered on server %s", userID, serverChannel)
		so.Emit("connected") // Let the client know it's ready
		return nil
	})
	
	srv.OnDisconnect("/", func(so socketio.Conn, _ string) {
		if so.Context() == nil {
			log.Printf("Anonymous client %s disconnected", so.ID())
			return
		}

		userID := so.Context().(string)
		userSockets.Delete(userID)
		redisClient.HDel(context.Background(), "user:server", userID)
		log.Printf("User %s disconnected", userID)
	})

	for _, event := range []string{"new message", "typing", "stop typing"} {
		srv.OnEvent("/", event, func(eventName string) func(socketio.Conn, interface{}) {
			return func(so socketio.Conn, raw interface{}) {
				wrapper, ok := raw.(map[string]interface{})
				if !ok {
					log.Println("Invalid payload type, expected object")
					return
				}

				recRaw, ok := wrapper["recipients"].([]interface{})
				if !ok {
					log.Println("Missing or invalid recipients")
					return
				}
				recipients := make([]string, len(recRaw))
				for i, v := range recRaw {
					recipients[i] = v.(string)
				}

				dataPayload, exists := wrapper["data"]
				if !exists {
					log.Println("Missing data field")
					return
				}

				produceToKafka(context.Background(), kafkaProducer, topic, eventName, recipients, dataPayload)
			}
		}(event))
	}

	return srv, nil
}