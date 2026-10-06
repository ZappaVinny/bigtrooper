package email

import (
	"bytes"
	"context"
	"embed"
	"errors"
	"fmt"
	"html/template"
	"log"
	"os"
	"regexp"

	"github.com/cloudflare/cloudflare-go/v6"
	"github.com/cloudflare/cloudflare-go/v6/email_sending"
	"github.com/cloudflare/cloudflare-go/v6/option"
	"github.com/cloudflare/cloudflare-go/v6/shared"
	"github.com/go-playground/validator/v10"
)

//go:embed email.tpl.html
var templateFiles embed.FS

type EmailFinderInformation struct {
	Location *string `json:"location,omitempty"`
	Email    *string `json:"email,omitempty" binding:"required_without=Phone,email"`
	Phone    *string `json:"phone,omitempty" binding:"required_without=Email"`
}
type EmailFoundReport struct {
	OwnerID    string
	OwnerName  string
	OwnerEmail string
	PetName    string
	PetCode    string
	Finder     EmailFinderInformation
}

var usPhone = regexp.MustCompile(`^\+1(\d{3})(\d{3})(\d{4})$`)

func formatPhone(phone *string) string {
	if phone == nil {
		return ""
	}
	if m := usPhone.FindStringSubmatch(*phone); m != nil {
		return fmt.Sprintf("(%s) %s-%s", m[1], m[2], m[3])
	}
	return *phone
}

func SendEmail(ctx context.Context, to string, subject string, body string) error {
	token := os.Getenv("MAIL_TOKEN")
	accountID := os.Getenv("CF_ACCOUNT_ID")
	emailFrom := os.Getenv("ALERT_EMAIL")

	client := cloudflare.NewClient(
		option.WithAPIToken(token),
	)
	_, err := client.EmailSending.Send(ctx, email_sending.EmailSendingSendParams{
		AccountID: cloudflare.F(accountID),
		From:      cloudflare.F[email_sending.EmailSendingSendParamsFromUnion](shared.UnionString(emailFrom)),
		To:        cloudflare.F[email_sending.EmailSendingSendParamsToUnion](shared.UnionString(to)),
		Subject:   cloudflare.F(subject),
		HTML:      cloudflare.F(body),
		Text:      cloudflare.F("PLACEHOLDER FOR NOW"),
	})
	if err != nil {
		return err
	}
	return nil

}

func SendReport(ctx context.Context, report EmailFoundReport) error {
	var err error
	validate := validator.New()
	tmpl, err := template.New("email.tpl.html").
		Funcs(template.FuncMap{"formatPhone": formatPhone}).
		ParseFS(templateFiles, "email.tpl.html")
	if err != nil {
		return err
	}
	validate.SetTagName("binding")
	if err = validate.Struct(report.Finder); err != nil {
		fmt.Println("invalid:", err)
		return err
	}
	var buf bytes.Buffer
	if err = tmpl.Execute(&buf, report); err != nil {
		return err
	}

	if os.Getenv("EMAIL_FLAG") != "true" {
		return errors.New("email sending disabled by EMAIL_FLAG")
	}

	if err := SendEmail(
		ctx,
		report.OwnerEmail,
		fmt.Sprintf("Found your pet %s", report.PetName),
		buf.String(),
	); err != nil {
		return fmt.Errorf("send email: %w", err)
	}

	log.Printf("found report: sent email to %s", report.OwnerEmail)
	return nil
}

// info := FinderInformation{
// 	Email: nil,
// 	Phone: nil,
// }

// if err := validate.Struct(info); err != nil {
// 	fmt.Println("invalid:", err)
// 	return
// }
