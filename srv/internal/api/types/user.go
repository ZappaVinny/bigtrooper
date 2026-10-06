package types

type CommunicationPreference struct {
	SMS   bool `json:"sms"`
	Email bool `json:"email"`
}
