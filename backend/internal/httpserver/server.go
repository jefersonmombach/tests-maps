package httpserver

import (
	"net/http"
	"time"
)

const (
	readHeaderTimeout = 5 * time.Second
	readTimeout       = 15 * time.Second
	writeTimeout      = 15 * time.Second
	idleTimeout       = 60 * time.Second
)

type Server struct {
	httpServer *http.Server
}

func New(port string, allowedOrigin string) *Server {
	return &Server{
		httpServer: &http.Server{
			Addr:              ":" + port,
			Handler:           routes(allowedOrigin),
			ReadHeaderTimeout: readHeaderTimeout,
			ReadTimeout:       readTimeout,
			WriteTimeout:      writeTimeout,
			IdleTimeout:       idleTimeout,
		},
	}
}

func (server *Server) Run() error {
	return server.httpServer.ListenAndServe()
}