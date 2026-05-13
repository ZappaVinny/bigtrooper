package handlers

// Request validation objects

type SignupRequest struct {
	FirstName   string `json:"first_name"   binding:"required"`
	LastName    string `json:"last_name"    binding:"required"`
	Email       string `json:"email"        binding:"required,email"`
	PhoneNumber string `json:"phone_number" binding:"required"`
	Password    string `json:"password"     binding:"required,min=8"`
}

type LoginRequest struct {
	Email       string `json:"email"        binding:"required_without=PhoneNumber,omitempty,email"`
	PhoneNumber string `json:"phone_number" binding:"required_without=Email,omitempty"`
	Password    string `json:"password"     binding:"required,min=8"`
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
