export interface UserData {
  name: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  phone: string;
  gender: string;
  role: string;
  createdAt: string;
}

export interface UserPayload {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: string;
}
  