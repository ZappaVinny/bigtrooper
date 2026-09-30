-- name: CreateArticle :one
INSERT INTO articles (slug, title, date, category_id, published, deleted, body, excerpt, created_at, updated_at) 
VALUES ($1, $2, $3, $4, $5, FALSE, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *;

-- name: GetArticleById :one
SELECT a.*, sqlc.embed(c)
FROM articles a
JOIN categories c ON c.id = a.category_id
WHERE a.deleted = FALSE AND a.id = $1
ORDER BY a.date DESC;

-- name: GetArticleBySlug :one

SELECT a.*, sqlc.embed(c)
FROM articles a
JOIN categories c ON c.id = a.category_id
WHERE a.deleted = FALSE AND a.slug = $1
ORDER BY a.date DESC;


-- name: ListAllArticles :many
SELECT a.id, a.title, a.excerpt, a.slug, a.date, a.published, sqlc.embed(c)
FROM articles a
JOIN categories c ON c.id = a.category_id
WHERE a.deleted = FALSE
ORDER BY a.date DESC;

-- name: ListPublishedArticles :many
SELECT a.id, a.title, a.excerpt, a.slug, a.date, a.published, sqlc.embed(c)
FROM articles a
JOIN categories c ON c.id = a.category_id
WHERE a.deleted = FALSE AND a.published = TRUE
ORDER BY a.date DESC;

-- name: UpdateArticle :exec
UPDATE articles SET slug = $1, title = $2, date = $3, category_id = $4, published = $5, body = $6, excerpt = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8;

-- name: DeleteArticle :exec
UPDATE articles SET deleted = TRUE WHERE id = $1;

-- name: GetArticleCount :one
SELECT COUNT(*) FROM articles WHERE deleted = FALSE;
