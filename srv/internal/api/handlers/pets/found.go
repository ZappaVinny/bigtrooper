package pets

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/netip"
	"net/url"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api/types"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/service/email"
	"github.com/ZappaVinny/bigtrooper/srv/internal/service/sms"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/sams96/rgeo"
)

type FoundPetObject struct {
	Name        string  `json:"name"`
	Type        string  `json:"type"`
	Age         int32   `json:"age"`
	Description string  `json:"description"`
	ImageURL    *string `json:"image_url"`
}

var (
	foundGeocoderOnce sync.Once
	foundGeocoder     *rgeo.Rgeo
	foundGeocoderErr  error
	finderPhone       = regexp.MustCompile(`^\+1\d{10}$`)
)

const defaultNotificationTimeout = 10 * time.Second

func notificationTimeout() time.Duration {
	value := strings.TrimSpace(os.Getenv("NOTIFICATION_TIMEOUT"))
	if value == "" {
		return defaultNotificationTimeout
	}

	timeout, err := time.ParseDuration(value)
	if err != nil || timeout <= 0 {
		log.Printf("found report: invalid NOTIFICATION_TIMEOUT %q; using %s", value, defaultNotificationTimeout)
		return defaultNotificationTimeout
	}
	return timeout
}

func getFoundGeocoder() (*rgeo.Rgeo, error) {
	foundGeocoderOnce.Do(func() {
		foundGeocoder, foundGeocoderErr = rgeo.New(rgeo.Provinces10, rgeo.Cities10)
		if foundGeocoderErr == nil {
			foundGeocoder.Build()
		}
	})
	return foundGeocoder, foundGeocoderErr
}

// done
func (h *Handler) GetFound(c *gin.Context) {
	pet, err := h.q.GetPetByCode(c, c.Param("code"))
	if errors.Is(err, pgx.ErrNoRows) || (err == nil && !pet.Active) {
		c.JSON(http.StatusNotFound, gin.H{"error": "tag not active"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to look up tag"})
		return
	}
	c.JSON(http.StatusOK, FoundPetObject{
		Name:        pet.Name,
		Type:        pet.Type,
		Age:         pet.Age,
		Description: pet.Description,
		ImageURL:    h.imageURL(pet.ImageKey),
	})
}

// TODO
type FoundReportRequest struct {
	Email       *string `json:"email" binding:"omitempty,email,max=254"`
	PhoneNumber *string `json:"phone" binding:"omitempty,max=20"`
	Location    *struct {
		Lat float64 `json:"lat" binding:"gte=-90,lte=90"`
		Lng float64 `json:"lng" binding:"gte=-180,lte=180"`
	} `json:"location" binding:"omitempty"`
}

func (h *Handler) ReportFound(c *gin.Context) {
	Pet, err := h.q.GetPetByCode(c, c.Param("code"))
	if errors.Is(err, pgx.ErrNoRows) || (err == nil && !Pet.Active) {
		c.JSON(http.StatusNotFound, gin.H{"error": "tag not active"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to look up tag"})
		return
	}

	PetOwner, err := h.q.GetUserById(c, Pet.OwnerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to look up pet owner"})
		return
	}

	PetFinder := FoundReportRequest{}
	if err := c.ShouldBindJSON(&PetFinder); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if PetFinder.Email != nil {
		trimmed := strings.TrimSpace(*PetFinder.Email)
		PetFinder.Email = &trimmed
		if trimmed == "" {
			PetFinder.Email = nil
		}
	}
	if PetFinder.PhoneNumber != nil {
		trimmed := strings.TrimSpace(*PetFinder.PhoneNumber)
		PetFinder.PhoneNumber = &trimmed
		if trimmed == "" {
			PetFinder.PhoneNumber = nil
		}
	}
	if PetFinder.Email == nil && PetFinder.PhoneNumber == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email or phone_number required"})
		return
	}
	if PetFinder.PhoneNumber != nil && !finderPhone.MatchString(*PetFinder.PhoneNumber) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "phone_number must be +1 followed by 10 digits"})
		return
	}

	finderPhoneValue := pgtype.Text{}
	if PetFinder.PhoneNumber != nil {
		finderPhoneValue = pgtype.Text{String: *PetFinder.PhoneNumber, Valid: true}
	}
	finderEmail := pgtype.Text{}
	if PetFinder.Email != nil {
		finderEmail = pgtype.Text{String: *PetFinder.Email, Valid: true}
	}

	finderLatitude := pgtype.Float8{}
	finderLongitude := pgtype.Float8{}
	if PetFinder.Location != nil {
		finderLatitude = pgtype.Float8{Float64: PetFinder.Location.Lat, Valid: true}
		finderLongitude = pgtype.Float8{Float64: PetFinder.Location.Lng, Valid: true}
	}

	var finderIP *netip.Addr //REPALCE THIS WITH CLOUDFLARE IP FORWARDING HEADER
	if parsedIP, parseErr := netip.ParseAddr(c.ClientIP()); parseErr != nil {
		log.Printf("found report: parse finder IP: %v", parseErr)
	} else {
		finderIP = &parsedIP
	}

	report, err := h.q.CreateReport(c.Request.Context(), db.CreateReportParams{
		PetID:           Pet.ID,
		OwnerID:         PetOwner.ID,
		OwnerNotified:   pgtype.Bool{Bool: false, Valid: true},
		FinderPhone:     finderPhoneValue,
		FinderEmail:     finderEmail,
		FinderIp:        finderIP,
		FinderLatitude:  finderLatitude,
		FinderLongitude: finderLongitude,
	})
	if err != nil {
		log.Printf("Failed to create found report: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create report"})
		return
	}
	requestContext := c.Request.Context()
	timeout := notificationTimeout()

	processSMS := func() error {
		siteURL := strings.TrimRight(strings.TrimSpace(os.Getenv("SITE_URL")), "/")
		if siteURL == "" {
			return errors.New("SITE_URL is not configured")
		}

		ctx, cancel := context.WithTimeout(requestContext, timeout)
		defer cancel()
		return sms.SendReport(ctx, sms.SMSFoundReport{
			OwnerName:  PetOwner.FirstName,
			OwnerPhone: PetOwner.PhoneNumber,
			PetName:    Pet.Name,
			FoundURL:   siteURL + "/pets/" + url.PathEscape(Pet.Code) + "/found",
		})
	}

	processEmail := func() error {
		var finderLocation *string
		if PetFinder.Location != nil {
			geocoder, err := getFoundGeocoder()
			if err != nil {
				log.Printf("found report: initialize reverse geocoder: %v", err)
			} else if location, err := geocoder.ReverseGeocode([]float64{
				PetFinder.Location.Lng,
				PetFinder.Location.Lat,
			}); err != nil {
				log.Printf("found report: reverse geocode finder location: %v", err)
			} else {
				locationParts := make([]string, 0, 3)
				if location.City != "" {
					locationParts = append(locationParts, location.City)
				}
				if location.Province != "" {
					locationParts = append(locationParts, location.Province)
				}
				if location.Country != "" {
					locationParts = append(locationParts, location.Country)
				}

				if locationName := strings.Join(locationParts, ", "); locationName != "" {
					finderLocation = &locationName
				}
			}
		}

		ctx, cancel := context.WithTimeout(requestContext, timeout)
		defer cancel()
		return email.SendReport(ctx, email.EmailFoundReport{
			PetName:    Pet.Name,
			OwnerName:  PetOwner.FirstName,
			OwnerEmail: PetOwner.Email,
			Finder: email.EmailFinderInformation{
				Location: finderLocation,
				Email:    PetFinder.Email,
				Phone:    PetFinder.PhoneNumber,
			},
		})
	}

	var ownerPrefs types.CommunicationPreference
	if err := json.Unmarshal(PetOwner.Preferences, &ownerPrefs); err != nil {
		log.Printf("found report: decode owner preferences: %v", err)
		c.JSON(http.StatusOK, gin.H{"message": "report received"})
		return
	}

	type notificationResult struct {
		channel string
		err     error
	}

	results := make(chan notificationResult, 2)
	attempts := 0
	if ownerPrefs.SMS {
		attempts++
		go func() {
			results <- notificationResult{channel: "SMS", err: processSMS()}
		}()
	}
	if ownerPrefs.Email {
		attempts++
		go func() {
			results <- notificationResult{channel: "email", err: processEmail()}
		}()
	}

	notificationSent := false
	for range attempts {
		result := <-results
		if result.err != nil {
			log.Printf("found report: %s notification failed: %v", result.channel, result.err)
		} else {
			notificationSent = true
		}
	}

	if notificationSent {
		if err := h.q.MarkReportNotified(c.Request.Context(), report.ID); err != nil {
			log.Printf("found report: mark owner notified: %v", err)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "report received"})
}

func (h *Handler) FoundInfo(c *gin.Context) {

	c.JSON(http.StatusNotImplemented, gin.H{"error": "reporting isn't available yet"})

}
