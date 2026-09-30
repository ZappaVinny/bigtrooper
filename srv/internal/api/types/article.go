package types

import (
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
)

type ListArticleObject struct {
	ID        int32          `json:"id"`
	Title     string         `json:"title"`
	Excerpt   string         `json:"excerpt"`
	Date      string         `json:"date_published"`
	Published bool           `json:"published"`
	Category  CategoryObject `json:"category"`
	Slug      string         `json:"slug"`
}

type ArticleObject struct {
	ID        int32          `json:"id"`
	Title     string         `json:"title"`
	Body      string         `json:"body"`
	Excerpt   string         `json:"excerpt"`
	Date      string         `json:"date_published"`
	Published bool           `json:"published"`
	Category  CategoryObject `json:"category"`
	Slug      string         `json:"slug"`
}

func ToListArticleObject(id int32, title, excerpt, slug string, date pgtype.Date, published bool, cat db.Category) ListArticleObject {
	return ListArticleObject{
		ID:        id,
		Title:     title,
		Excerpt:   excerpt,
		Slug:      slug,
		Published: published,
		Date:      date.Time.Format("2006-01-02"),
		Category:  ToCategoryObject(cat),
	}
}

func ToArticleObject(a db.GetArticleBySlugRow) ArticleObject {
	return ArticleObject{
		ID:        a.ID,
		Title:     a.Title,
		Body:      a.Body,
		Excerpt:   a.Excerpt,
		Date:      a.Date.Time.Format("2006-01-02"),
		Published: a.Published,
		Category:  ToCategoryObject(a.Category),
		Slug:      a.Slug,
	}
}
