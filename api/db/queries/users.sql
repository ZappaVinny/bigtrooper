-- name: CreateUser :one
INSERT INTO users (first_name, last_name, email, phone_number, password) 
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByPhoneNumber :one
SELECT * FROM users WHERE phone_number = $1;

-- name: GetUserById :one
SELECT * FROM users WHERE id = $1;

-- name: UpdateUser :exec
UPDATE users SET first_name = $1, last_name = $2, email = $3, phone_number = $4, password = $5, preferences = $6, admin = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;