package main

import (
	"context"
	"errors" 
	"log"
	"os"
	"sync"

	socketio "github.com/googollee/go-socket.io"
)

var userSockets sync.Map

// redisClient and produceToKafka are assumed to be defined elsewhere in your package
// var redisClient *redis.Client 
// func produceToKafka(...) 

func initSocketServer() (*socketio.Server, error) {
	srv := socketio.NewServer(nil)

	// CHANGED: OnConnect now handles user identification securely
	srv.OnConnect("/", func(so socketio.Conn) error {
		// 1. Read the TRUSTED header passed by the Nginx gateway
		userID := so.RemoteHeader().Get("X-User-Id")

		// 2. If the header is missing, the connection is unauthorized. Reject it.
		if userID == "" {
			log.Println("Rejecting connection: Missing or empty X-User-Id header.")
			return errors.New("unauthorized") // This closes the connection
		}

		// 3. The user is authenticated. Associate the ID with the connection.
		so.SetContext(userID)
		userSockets.Store(userID, so)

		// 4. Register the user's server location in Redis
		err := redisClient.HSet(
			context.Background(),
			"user:server",
			userID,
			os.Getenv("SERVER_CHANNEL"),
		).Err()
		if err != nil {
			log.Println("Redis HSet error:", err)
		}

		log.Printf("User %s connected and registered on server %s", userID, os.Getenv("SERVER_CHANNEL"))
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
				
				produceToKafka(context.Background(), eventName, recipients, dataPayload)
			}
		}(event))
	}

	return srv, nil
}