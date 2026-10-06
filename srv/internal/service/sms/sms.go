package sms

import (
	"bytes"
	"context"
	"embed"
	"errors"
	"fmt"
	"log"
	"os"
	"text/template"
	"time"

	"github.com/twilio/twilio-go"
	twilioApi "github.com/twilio/twilio-go/rest/api/v2010"
)

//go:embed sms.tpl.html
var templateFiles embed.FS

type SMSFoundReport struct {
	OwnerName  string
	OwnerPhone string
	PetName    string
	FoundURL   string
}

func SendSMS(ctx context.Context, to string, body string) error {
	accountSid := os.Getenv("TWILIO_ACCOUNT_SID")
	authToken := os.Getenv("TWILIO_AUTH_TOKEN")
	fromNumber := os.Getenv("TWILIO_PHONE_NUMBER")

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSid,
		Password: authToken,
	})
	if deadline, ok := ctx.Deadline(); ok {
		remaining := time.Until(deadline)
		if remaining <= 0 {
			return ctx.Err()
		}
		client.SetTimeout(remaining)
	}

	params := &twilioApi.CreateMessageParams{}
	params.SetTo(to)
	params.SetFrom(fromNumber)
	params.SetBody(body)

	_, err := client.Api.CreateMessage(params)
	if err != nil {
		return err
	}
	return nil
}

func SendReport(ctx context.Context, report SMSFoundReport) error {
	var err error
	tmpl, err := template.New("sms.tpl.html").
		ParseFS(templateFiles, "sms.tpl.html")
	if err != nil {
		return err
	}
	var buf bytes.Buffer
	if err = tmpl.Execute(&buf, report); err != nil {
		return err
	}

	if os.Getenv("SMS_FLAG") != "true" {
		return errors.New("SMS sending disabled by SMS_FLAG")
	}

	if err := SendSMS(ctx, report.OwnerPhone, buf.String()); err != nil {
		return fmt.Errorf("send SMS: %w", err)
	}

	log.Printf("found report: sent SMS to %s", report.OwnerPhone)
	return nil
}
