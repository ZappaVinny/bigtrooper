export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  preferences: string;
  admin: boolean;
};

export type CommunicationPreference = {
  sms: boolean;
  email: boolean;
};

export type RegisterRequest = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  preferences?: CommunicationPreference;
};

export type ListPet = {
  id: number;
  name: string;
  type: string;
  age: number;
  description: string;
  active: boolean;
};

export type Pet = {
  id: number;
  owner_id: number;
  code: string;
  name: string;
  type: string;
  age: number;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PetUpdate = {
  name?: string;
  type?: string;
  age?: number;
  description?: string;
  active?: boolean;
};

export type PetNew = {
  name: string;
  type: string;
  age: number;
  description: string;
  active: boolean;
};
