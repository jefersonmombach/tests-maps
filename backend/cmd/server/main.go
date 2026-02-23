package main

import (
	"log"
	"os"

	"backend/internal/httpserver"
)

const defaultPort = "8080"
const defaultWebappOrigin = "http://localhost:3000"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	webappOrigin := os.Getenv("WEBAPP_ORIGIN")
	if webappOrigin == "" {
		webappOrigin = defaultWebappOrigin
	}

	server := httpserver.New(port, webappOrigin)

	log.Printf("backend running on port %s", port)
	if err := server.Run(); err != nil {
		log.Fatalf("failed to start backend: %v", err)
	}
}