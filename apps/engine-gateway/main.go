package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = time.RFC3339
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: "15:04:05"})

	port := os.Getenv("GATEWAY_PORT")
	if port == "" {
		port = "4000"
	}

	mlURL := os.Getenv("ML_SERVICE_URL")
	if mlURL == "" {
		mlURL = "http://localhost:5000"
	}

	retrieverURL := os.Getenv("RETRIEVER_URL")
	if retrieverURL == "" {
		retrieverURL = "http://localhost:6000"
	}

	client := NewServiceClient(mlURL, retrieverURL)
	cache := NewCache(5 * time.Minute)
	handler := NewHandler(client, cache)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handler.Health)
	mux.HandleFunc("POST /infer/idea_score", handler.InferIdeaScore)
	mux.HandleFunc("POST /infer/quality_score", handler.InferQualityScore)
	mux.HandleFunc("POST /retrieve/examples", handler.RetrieveExamples)
	mux.HandleFunc("POST /reload", handler.Reload)

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      logMiddleware(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Info().Str("port", port).Msg("Engine Gateway starting")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Server failed")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info().Msg("Shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
}

func logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Dur("latency", time.Since(start)).
			Msg("request")
	})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	fmt.Fprintf(w, `%v`, toJSON(data))
}

func toJSON(v interface{}) string {
	switch val := v.(type) {
	case string:
		return val
	case map[string]interface{}:
		result := "{"
		first := true
		for k, vv := range val {
			if !first {
				result += ","
			}
			result += fmt.Sprintf(`"%s":%v`, k, toJSON(vv))
			first = false
		}
		return result + "}"
	case float64:
		return fmt.Sprintf("%v", val)
	case bool:
		return fmt.Sprintf("%v", val)
	default:
		return fmt.Sprintf(`"%v"`, val)
	}
}
