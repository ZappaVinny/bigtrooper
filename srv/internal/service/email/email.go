package email

import (
	"context"
	"log"
)

type Message struct {
	To      string
	Subject string
	Body    string
}

type Sender interface {
	Send(ctx context.Context, msg Message) error
}

type LogSender struct{}

func (LogSender) Send(_ context.Context, msg Message) error {
	log.Printf("email (not sent): to=%s subject=%q", msg.To, msg.Subject)
	return nil
}
