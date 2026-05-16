-- name: CreatePet :one
INSERT INTO pets (owner_id, code, name, type, age, description) 
VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;

-- name: GetPetByCode :one
SELECT * FROM pets WHERE code = $1;

-- name: GetPetById :one
SELECT * FROM pets WHERE id = $1;

-- name: CodeExists :one
SELECT EXISTS(SELECT 1 FROM pets WHERE code = $1);

-- name: ListPets :many
SELECT id, name, type, age, description FROM pets WHERE owner_id = $1;

-- name: UpdatePet :exec
UPDATE pets SET owner_id = $1, code = $2, name = $3, type = $4, age = $5, description = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7;

-- name: DeletePet :exec
DELETE FROM pets WHERE id = $1;