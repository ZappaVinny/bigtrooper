-- name: CreateArticle :one
INSERT INTO articles (slug, title, date, category_id, published, deleted, body, excerpt, created_at, updated_at) 
VALUES ($1, $2, $3, $4, $5, FALSE, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *;

-- name: GetArticle :one
SELECT * FROM articles WHERE id = $1 AND deleted = FALSE;

-- name: ListArticles :many
SELECT id, title, excerpt, category_id, slug, date FROM articles WHERE deleted = FALSE;

-- name: UpdateArticle :exec
UPDATE articles SET slug = $1, title = $2, date = $3, category_id = $4, published = $5, body = $6, excerpt = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8;

-- name: DeleteArticle :exec
UPDATE articles SET deleted = TRUE WHERE id = $1;

-- name: GetArticleCount :one
SELECT COUNT(*) FROM articles WHERE deleted = FALSE;
