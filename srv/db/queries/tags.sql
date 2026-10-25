-- name: ListPetTags :many
SELECT * FROM pet_tags WHERE pet_id = $1 ORDER BY variant;

-- name: UpsertPetTag :exec
INSERT INTO pet_tags (pet_id, variant, key) VALUES ($1, $2, $3)
ON CONFLICT (pet_id, variant) DO UPDATE SET key = EXCLUDED.key;
