export class UserResponseDTO {
  id: number;
  name: string;
  lastName: string;
  email: string;
  birthDate: string;
  phone: string;
  gender: string;
  role: string;
  createdAt: string;

  constructor(partial: Partial<UserResponseDTO>) {
    Object.assign(this, partial);
  }
}
