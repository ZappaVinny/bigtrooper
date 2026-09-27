// Package storage talks to Cloudflare R2 through its S3-compatible API.
//
// The browser never gets R2 credentials: the server hands out short-lived
// presigned PUT URLs, the browser uploads straight to R2, and the server
// verifies the object before saving its key. Images are then served from the
// bucket's public custom domain (R2_PUBLIC_URL).
package storage

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// ErrNotFound is returned by Head when the object doesn't exist.
var ErrNotFound = errors.New("object not found")

type R2 struct {
	client    *s3.Client
	presigner *s3.PresignClient
	bucket    string
	publicURL string
}

// New builds an R2 client from the R2_* environment variables. It returns
// (nil, nil) when they aren't set, so the API can run without photo uploads.
func New(ctx context.Context) (*R2, error) {
	accountID := os.Getenv("R2_ACCOUNT_ID")
	accessKey := os.Getenv("R2_ACCESS_KEY_ID")
	secretKey := os.Getenv("R2_SECRET_ACCESS_KEY")
	bucket := os.Getenv("R2_BUCKET")
	publicURL := strings.TrimRight(os.Getenv("R2_PUBLIC_URL"), "/")
	if accountID == "" || accessKey == "" || secretKey == "" || bucket == "" || publicURL == "" {
		return nil, nil
	}
	// Without a scheme, browsers treat the URL as a path on our own site.
	if !strings.HasPrefix(publicURL, "https://") && !strings.HasPrefix(publicURL, "http://") {
		publicURL = "https://" + publicURL
	}

	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		config.WithRegion("auto"), // required by the SDK, ignored by R2
		// Newer SDK versions add CRC checksums to uploads by default, which
		// presigned browser PUTs can't satisfy. Only send them when required.
		config.WithRequestChecksumCalculation(aws.RequestChecksumCalculationWhenRequired),
		config.WithResponseChecksumValidation(aws.ResponseChecksumValidationWhenRequired),
	)
	if err != nil {
		return nil, fmt.Errorf("load r2 config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID))
	})

	return &R2{
		client:    client,
		presigner: s3.NewPresignClient(client),
		bucket:    bucket,
		publicURL: publicURL,
	}, nil
}

// PresignPut returns a URL the browser can PUT the object to until it expires.
// The content type and length are part of the signature, so the upload must
// send exactly those values.
func (r *R2) PresignPut(ctx context.Context, key, contentType string, size int64, expires time.Duration) (string, error) {
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
	_, err := r.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	})
	return err
}

// PublicURL is where a stored object can be viewed.
func (r *R2) PublicURL(key string) string {
	return r.publicURL + "/" + key
}
