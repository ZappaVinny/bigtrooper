// Package storage talks to Cloudflare R2 through its S3-compatible API.
//
// The browser never gets R2 credentials: the server hands out short-lived
// presigned PUT URLs, the browser uploads straight to R2, and the server
// verifies the object before saving its key. Images are then served from the
// bucket's public custom domain (R2_PUBLIC_URL).
//
// Every object in a bucket with a public domain is reachable by URL; files
// that must stay private need a second, non-public bucket (a second R2).
package storage

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var (
	// ErrNotFound is returned by Head when the object doesn't exist.
	ErrNotFound = errors.New("object not found")
	// ErrNotConfigured is returned by every method when the R2 settings are missing.
	ErrNotConfigured = errors.New("storage is not configured")
)

// NewKey names a new object "<prefix>/<random>.<ext>", e.g. "pets/12/9f3c….jpg".
func NewKey(prefix, ext string) string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%s/%s.%s", strings.TrimRight(prefix, "/"), hex.EncodeToString(b), ext)
}

type R2 struct {
	client    *s3.Client
	presigner *s3.PresignClient
	bucket    string
	publicURL string
}

// Settings for one bucket. main.go fills these from the R2_* env vars, once
// per bucket.
type Settings struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicURL       string
}

func (s Settings) configured() bool {
	return s.AccountID != "" && s.AccessKeyID != "" && s.SecretAccessKey != "" &&
		s.Bucket != "" && s.PublicURL != ""
}

// New builds an R2 client. When the settings are incomplete it still returns
// a client, whose methods all fail with ErrNotConfigured, so the API can run
// without uploads.
func New(ctx context.Context, settings Settings) (*R2, error) {
	if !settings.configured() {
		return &R2{}, nil
	}
	publicURL := strings.TrimRight(settings.PublicURL, "/")
	// Without a scheme, browsers treat the URL as a path on our own site.
	if !strings.HasPrefix(publicURL, "https://") && !strings.HasPrefix(publicURL, "http://") {
		publicURL = "https://" + publicURL
	}

	cfg, err := awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(settings.AccessKeyID, settings.SecretAccessKey, "")),
		awsconfig.WithRegion("auto"), // required by the SDK, ignored by R2
		// Newer SDK versions add CRC checksums to uploads by default, which
		// presigned browser PUTs can't satisfy. Only send them when required.
		awsconfig.WithRequestChecksumCalculation(aws.RequestChecksumCalculationWhenRequired),
		awsconfig.WithResponseChecksumValidation(aws.ResponseChecksumValidationWhenRequired),
	)
	if err != nil {
		return nil, fmt.Errorf("load r2 config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", settings.AccountID))
	})

	return &R2{
		client:    client,
		presigner: s3.NewPresignClient(client),
		bucket:    settings.Bucket,
		publicURL: publicURL,
	}, nil
}

// Enabled reports whether uploads are available.
func (r *R2) Enabled() bool {
	return r.client != nil
}

// PresignPut returns a URL the browser can PUT the object to until it expires.
// The content type and length are part of the signature, so the upload must
// send exactly those values.
func (r *R2) PresignPut(ctx context.Context, key, contentType string, size int64, expires time.Duration) (string, error) {
	if !r.Enabled() {
		return "", ErrNotConfigured
	}
	req, err := r.presigner.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(r.bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(size),
	}, s3.WithPresignExpires(expires))
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

// Head returns the size and content type of a stored object.
func (r *R2) Head(ctx context.Context, key string) (size int64, contentType string, err error) {
	if !r.Enabled() {
		return 0, "", ErrNotConfigured
	}
	out, err := r.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		var notFound interface{ ErrorCode() string }
		if errors.As(err, &notFound) && (notFound.ErrorCode() == "NotFound" || notFound.ErrorCode() == "NoSuchKey") {
			return 0, "", ErrNotFound
		}
		return 0, "", err
	}
	return aws.ToInt64(out.ContentLength), aws.ToString(out.ContentType), nil
}

// Delete removes an object. Deleting a missing key is not an error.
func (r *R2) Delete(ctx context.Context, key string) error {
	if !r.Enabled() {
		return ErrNotConfigured
	}
	_, err := r.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	})
	return err
}

// PublicURL is where a stored object can be viewed ("" when not configured).
func (r *R2) PublicURL(key string) string {
	if !r.Enabled() {
		return ""
	}
	return r.publicURL + "/" + key
}
