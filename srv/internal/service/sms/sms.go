package sms

import (
	"context"
	"log"
)

type Message struct {
	To   string
	Body string
}

type Sender interface {
	Send(ctx context.Context, msg Message) error
}

type LogSender struct{}

func (LogSender) Send(_ context.Context, msg Message) error {
	log.Printf("sms (not sent): to=%s (%d chars)", msg.To, len(msg.Body))
	return nil
}
