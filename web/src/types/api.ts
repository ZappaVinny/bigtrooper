export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  preferences: CommunicationPreference;
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

export type UserUpdate = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  preferences?: CommunicationPreference;
  current_password?: string;
};

export type ChangePassword = {
  current_password: string;
  new_password: string;
};

export type ListPet = {
  id: number;
  name: string;
  type: string;
  age: number;
  description: string;
  active: boolean;
  image_url: string | null;
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
  image_url: string | null;
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

export type Category = {
  id: number;
  name: string;
  description: string;
};

export type ArticleListItem = {
  id: number;
  title: string;
  excerpt: string;
  date_published: string;
  published: boolean;
  category: Category;
  slug: string;
};

export type Article = ArticleListItem & {
  body: string;
};

export type ArticleInput = {
  title: string;
  excerpt: string;
  body: string;
  category_id: number;
  published: boolean;
  date_published: string;
};

export type CategoryInput = {
  name: string;
  description: string;
};

export type Statistics = {
  articles: number;
  pets: number;
  users: number;
};
