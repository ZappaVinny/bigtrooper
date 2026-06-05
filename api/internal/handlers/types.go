package handlers

// Request validation objects

type SignupRequest struct {
	FirstName   string `json:"first_name"   binding:"required"`
	LastName    string `json:"last_name"    binding:"required"`
	Email       string `json:"email"        binding:"required,email"`
	PhoneNumber string `json:"phone_number" binding:"required"`
	Password    string `json:"password"     binding:"required,min=8"`
}

type LoginIdentifier struct {
	Email *string `json:"email,omitempty" binding:"required_without=Phone,omitempty,email"`
	Phone *string `json:"phone,omitempty" binding:"required_without=Email,omitempty"`
}
type LoginRequest struct {
	Identifier LoginIdentifier `json:"identifier" binding:"required"`
	Password   string          `json:"password"   binding:"required"`
}

type CreatePetRequest struct {
	Name        string `json:"name" binding:"required"`
	Type        string `json:"type" binding:"required"`
	Age         int32  `json:"age" binding:"required"`
	Description string `json:"description"`
}

type UpdatePetRequest struct {
	Name        *string `json:"name"`
	Type        *string `json:"type"`
	Age         *int32  `json:"age"`
	Description *string `json:"description"`
}

type UpdateMeRequest struct {
	FirstName   *string `json:"first_name"`
	LastName    *string `json:"last_name"`
	Email       *string `json:"email"        binding:"omitempty,email"`
	PhoneNumber *string `json:"phone_number"`
	Password    *string `json:"password"     binding:"omitempty,min=8"`
}

// Response objects

type UserObject struct {
	ID          int32  `json:"id"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
	Preferences []byte `json:"preferences"`
	Admin       *bool  `json:"admin,omitempty"`
}
