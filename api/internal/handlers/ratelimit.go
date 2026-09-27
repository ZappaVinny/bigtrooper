package handlers

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// RateLimit allows each client IP `perMinute` requests per minute, with
// short bursts of up to `burst`. Each call creates its own independent
// limiter, so every route can have its own budget.
//
// The IP comes from c.ClientIP(), which only trusts forwarded headers from
// the proxies configured in main.go (TRUSTED_PROXIES / TRUSTED_PLATFORM).
func RateLimit(perMinute, burst int) gin.HandlerFunc {
	type client struct {
		limiter  *rate.Limiter
		lastSeen time.Time
	}
	var (
		mu      sync.Mutex
		clients = map[string]*client{}
	)

	// Forget clients that have been quiet for a while so the map can't grow forever.
	go func() {
		for range time.Tick(time.Minute) {
			mu.Lock()
			for ip, cl := range clients {
				if time.Since(cl.lastSeen) > 10*time.Minute {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()

	every := rate.Every(time.Minute / time.Duration(perMinute))

	return func(c *gin.Context) {
		ip := c.ClientIP()
		mu.Lock()
		cl, ok := clients[ip]
		if !ok {
			cl = &client{limiter: rate.NewLimiter(every, burst)}
			clients[ip] = cl
		}
		cl.lastSeen = time.Now()
		allowed := cl.limiter.Allow()
		mu.Unlock()

		if !allowed {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "too many requests, try again shortly"})
			return
		}
		c.Next()
	}
}
