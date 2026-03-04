package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type ServiceClient struct {
	mlURL       string
	retrieverURL string
	httpClient  *http.Client
}

func NewServiceClient(mlURL, retrieverURL string) *ServiceClient {
	return &ServiceClient{
		mlURL:       mlURL,
		retrieverURL: retrieverURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *ServiceClient) PredictIdea(text string) ([]byte, error) {
	body, _ := json.Marshal(map[string]string{"text": text})
	return c.post(c.mlURL+"/predict/idea", body)
}

func (c *ServiceClient) PredictQuality(prompt string) ([]byte, error) {
	body, _ := json.Marshal(map[string]string{"prompt": prompt})
	return c.post(c.mlURL+"/predict/quality", body)
}

func (c *ServiceClient) SearchExamples(query string, topK int) ([]byte, error) {
	body, _ := json.Marshal(map[string]interface{}{"query": query, "top_k": topK})
	return c.post(c.retrieverURL+"/search", body)
}

func (c *ServiceClient) post(url string, body []byte) ([]byte, error) {
	resp, err := c.httpClient.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read failed: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("service error %d: %s", resp.StatusCode, string(data))
	}

	return data, nil
}
