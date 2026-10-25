package tag

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/ZappaVinny/bigtrooper/srv/internal/storage"
)

type Tag struct {
	Link string `json:"link"`
	Type string `json:"type"`
}

type Model struct {
	Variant     string `json:"variant"`
	ContentType string `json:"content_type"`
	Extension   string `json:"extension"`
	Data        []byte `json:"data"`
}

type modelsResponse struct {
	Models   []Model  `json:"models"`
	Warnings []string `json:"warnings"`
}

func GenerateTag(ctx context.Context, r2 *storage.R2, petID int32, tag Tag) (map[string]string, error) {
	models, err := fetchModels(ctx, tag)
	if err != nil {
		return nil, err
	}

	keys := make(map[string]string, len(models))
	for _, m := range models {
		key := storage.NewKey(fmt.Sprintf("tags/%d", petID), m.Extension)
		if err := r2.Put(ctx, key, m.ContentType, m.Data); err != nil {
			for _, uploaded := range keys {
				if err := r2.Delete(ctx, uploaded); err != nil {
					log.Printf("delete tag %s: %v", uploaded, err)
				}
			}
			return nil, fmt.Errorf("upload %s tag: %w", m.Variant, err)
		}
		keys[m.Variant] = key
	}
	return keys, nil
}

func fetchModels(ctx context.Context, tag Tag) ([]Model, error) {
	payload, err := json.Marshal(tag)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	var url = os.Getenv("TAG_SERVICE_INTERNAL_URL") + "/"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}

	//inner system auth should be set here
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("post %s: %w", url, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("post %s: status %d: %s", url, resp.StatusCode, body)
	}

	var out modelsResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	for _, warning := range out.Warnings {
		log.Printf("tag %s: %s", tag.Link, warning)
	}
	return out.Models, nil
}
