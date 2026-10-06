-- name: CreateReport :one
INSERT INTO reports (
    pet_id,
    owner_id,
    owner_notified,
    finder_phone,
    finder_email,
    finder_ip,
    finder_latitude,
    finder_longitude
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetReportById :one
SELECT *
FROM reports
WHERE id = $1;

-- name: ListReports :many
SELECT *
FROM reports
ORDER BY created_at DESC;

-- name: UpdateReport :exec
UPDATE reports
SET pet_id = $1,
    owner_id = $2,
    owner_notified = $3,
    finder_phone = $4,
    finder_email = $5,
    finder_ip = $6,
    finder_latitude = $7,
    finder_longitude = $8,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $9;

-- name: DeleteReport :exec
DELETE FROM reports
WHERE id = $1;

-- name: MarkReportNotified :exec
UPDATE reports
SET owner_notified = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1;
