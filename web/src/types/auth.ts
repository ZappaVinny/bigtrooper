import { User } from "./api";


export type LoginIdentifier =
  | { email: string; phone?: never }
  | { phone: string; email?: never };

export interface LoginRequest {
  identifier: LoginIdentifier;
  password: string;
}

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};


