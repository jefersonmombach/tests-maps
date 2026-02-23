package httpserver

import (
	"encoding/json"
	"net/http"
)

type healthResponse struct {
	Status string `json:"status"`
}

type apiResponse struct {
	Message string `json:"message"`
	Version string `json:"version"`
}

func routes(allowedOrigin string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/api/v1", apiV1Handler)

	return corsMiddleware(mux, allowedOrigin)
}

func healthHandler(writer http.ResponseWriter, _ *http.Request) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)

	response := healthResponse{Status: "ok"}
	_ = json.NewEncoder(writer).Encode(response)
}

func apiV1Handler(writer http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodGet {
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)

	response := apiResponse{
		Message: "backend api v1",
		Version: "v1",
	}
	_ = json.NewEncoder(writer).Encode(response)
}

func corsMiddleware(next http.Handler, allowedOrigin string) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		writer.Header().Set("Vary", "Origin")
		writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if request.Method == http.MethodOptions {
			writer.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(writer, request)
	})
}