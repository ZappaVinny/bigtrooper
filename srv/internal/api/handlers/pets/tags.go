package pets

import (
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"

	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/service/tag"
	"github.com/gin-gonic/gin"
)

type TagObject struct {
	Variant string `json:"variant"`
	URL     string `json:"url"`
}

func (h *Handler) tagObjects(tags []db.PetTag) []TagObject {
	objects := make([]TagObject, 0, len(tags))
	for _, t := range tags {
		objects = append(objects, TagObject{Variant: t.Variant, URL: h.tagsR2.PublicURL(t.Key)})
	}
	return objects
}

var unsafeFileChars = regexp.MustCompile(`[^a-z0-9]+`)

func fileSafeName(name string) string {
	safe := strings.Trim(unsafeFileChars.ReplaceAllString(strings.ToLower(name), "_"), "_")
	if safe == "" {
		return "pet"
	}
	return safe
}

func (h *Handler) requireTagStorage(c *gin.Context) bool {
	if !h.tagsR2.Enabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Tag generation isn't configured"})
		return false
	}
	return true
}

func (h *Handler) ListTags(c *gin.Context) {
	if !h.requireTagStorage(c) {
		return
	}
	pet, ok := h.ownedPet(c)
	if !ok {
		return
	}

	tags, err := h.q.ListPetTags(c, pet.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get tags"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tags": h.tagObjects(tags)})
}

func (h *Handler) CreateTags(c *gin.Context) {
	if !h.requireTagStorage(c) {
		return
	}
	pet, ok := h.ownedPet(c)
	if !ok {
		return
	}

	existing, err := h.q.ListPetTags(c, pet.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get tags"})
		return
	}
	if len(existing) > 0 {
		c.JSON(http.StatusOK, gin.H{"tags": h.tagObjects(existing)})
		return
	}

	link := strings.TrimRight(os.Getenv("TAG_SERVICE_URL"), "/") + "/" + url.PathEscape(pet.Code)
	keys, err := tag.GenerateTag(c, h.tagsR2, pet.ID, fileSafeName(pet.Name), tag.Tag{Link: link, Type: "pet"})
	if err != nil {
		log.Printf("generate tag: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to generate tag"})
		return
	}

	saved := make(map[string]bool, len(keys))
	for variant, key := range keys {
		err := h.q.UpsertPetTag(c, db.UpsertPetTagParams{PetID: pet.ID, Variant: variant, Key: key})
		if err != nil {
			log.Printf("save pet tag: %v", err)
			for variant, key := range keys {
				if saved[variant] {
					continue
				}
				if err := h.tagsR2.Delete(c, key); err != nil {
					log.Printf("delete tag %s: %v", key, err)
				}
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save tag"})
			return
		}
		saved[variant] = true
	}

	tags, err := h.q.ListPetTags(c, pet.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get tags"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"tags": h.tagObjects(tags)})
}
