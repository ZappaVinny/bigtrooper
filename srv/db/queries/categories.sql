-- name: CreateCategory :one
INSERT INTO categories (name, description) 
VALUES ($1, $2) RETURNING *;

-- name: GetCategory :one
SELECT * FROM categories WHERE id = $1;

-- name: ListCategories :many
SELECT id, name, description FROM categories;

-- name: UpdateCategory :exec
UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3;

-- name: DeleteCategory :exec
DELETE FROM categories WHERE id = $1;

