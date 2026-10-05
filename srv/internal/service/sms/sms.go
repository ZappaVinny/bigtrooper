package sms

import (
	"bytes"
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"text/template"

	"github.com/twilio/twilio-go"
	twilioApi "github.com/twilio/twilio-go/rest/api/v2010"
)

//go:embed sms.tpl.html
var templateFiles embed.FS

type SMSFoundReport struct {
	OwnerName  string
	OwnerPhone string
	PetName    string
	PetCode    string
}

func SendSMS(ctx context.Context, to string, body string) error {
	accountSid := os.Getenv("TWILIO_ACCOUNT_SID")
	authToken := os.Getenv("TWILIO_AUTH_TOKEN")
	fromNumber := os.Getenv("TWILIO_PHONE_NUMBER")

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSid,
		Password: authToken,
	})

	params := &twilioApi.CreateMessageParams{}
	params.SetTo(to)
	params.SetFrom(fromNumber)
	params.SetBody(body)

	resp, err := client.Api.CreateMessage(params)
	if err != nil {
		fmt.Println("Error sending SMS message: " + err.Error())
	} else {
		response, _ := json.Marshal(*resp)
		fmt.Println("Response: " + string(response))
	}
	return err
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

	flags := os.Getenv("SMS_FLAG")
	if flags == "true" {
		SendSMS(ctx, report.OwnerPhone, buf.String())
		log.Printf("found report: send sms to %s", report.OwnerPhone)
	} else {
		log.Printf("found report (SMS Attempted): sms sending disabled by EMAIL_FLAG env var")
	}

	return err
}
