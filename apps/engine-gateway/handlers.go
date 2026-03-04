package main

import (
	"encoding/json"
	"io"
	"net/http"
)

type Handler struct {
	client *ServiceClient
	cache  *Cache
}

func NewHandler(client *ServiceClient, cache *Cache) *Handler {
	return &Handler{client: client, cache: cache}
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"ok":true,"service":"engine-gateway","version":"1.0.0"}`))
}

type IdeaScoreRequest struct {
	Text string `json:"text"`
}

type IdeaScoreResponse struct {
	Score      float64 `json:"score"`
	IsIdea     bool    `json:"is_idea"`
	Confidence float64 `json:"confidence"`
}

func (h *Handler) InferIdeaScore(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"error":"bad_request"}`, http.StatusBadRequest)
		return
	}

	var req IdeaScoreRequest
	if err := json.Unmarshal(body, &req); err != nil || req.Text == "" {
		http.Error(w, `{"error":"text_required"}`, http.StatusBadRequest)
		return
	}

	cacheKey := "idea:" + req.Text[:min(len(req.Text), 100)]
	if cached, ok := h.cache.Get(cacheKey); ok {
		w.Header().Set("Content-Type", "application/json")
		w.Write(cached)
		return
	}

	result, err := h.client.PredictIdea(req.Text)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"score":0.5,"is_idea":false,"confidence":0.0,"fallback":true}`))
		return
	}

	h.cache.Set(cacheKey, result)
	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

type QualityScoreRequest struct {
	Prompt string `json:"prompt"`
}

func (h *Handler) InferQualityScore(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"error":"bad_request"}`, http.StatusBadRequest)
		return
	}

	var req QualityScoreRequest
	if err := json.Unmarshal(body, &req); err != nil || req.Prompt == "" {
		http.Error(w, `{"error":"prompt_required"}`, http.StatusBadRequest)
		return
	}

	result, err := h.client.PredictQuality(req.Prompt)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"score":0.5,"confidence":0.0,"fallback":true}`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

type RetrieveRequest struct {
	Query string `json:"query"`
	TopK  int    `json:"top_k"`
}

func (h *Handler) RetrieveExamples(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"error":"bad_request"}`, http.StatusBadRequest)
		return
	}

	var req RetrieveRequest
	if err := json.Unmarshal(body, &req); err != nil || req.Query == "" {
		http.Error(w, `{"error":"query_required"}`, http.StatusBadRequest)
		return
	}

	if req.TopK <= 0 {
		req.TopK = 3
	}

	cacheKey := "retrieve:" + req.Query[:min(len(req.Query), 100)]
	if cached, ok := h.cache.Get(cacheKey); ok {
		w.Header().Set("Content-Type", "application/json")
		w.Write(cached)
		return
	}

	result, err := h.client.SearchExamples(req.Query, req.TopK)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"examples":[],"fallback":true}`))
		return
	}

	h.cache.Set(cacheKey, result)
	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func (h *Handler) Reload(w http.ResponseWriter, r *http.Request) {
	h.cache.Clear()
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"ok":true,"message":"cache cleared, artifacts will reload on next request"}`))
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
