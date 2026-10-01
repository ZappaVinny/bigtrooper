package sms

import (
	"context"
	"log"
)

type Message struct {
	To   string
	Body string
}

func Send(_ context.Context, msg Message) error {
	log.Printf("sms (not sent): to=%s (%d chars)", msg.To, len(msg.Body))
	return nil
}
