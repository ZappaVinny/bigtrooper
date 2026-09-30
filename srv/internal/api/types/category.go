package types

import "github.com/ZappaVinny/bigtrooper/srv/internal/db"

type CategoryObject struct {
	ID          int32  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func ToCategoryObject(cat db.Category) CategoryObject {
	return CategoryObject{
		ID:          cat.ID,
		Name:        cat.Name,
		Description: cat.Description.String,
	}
}
