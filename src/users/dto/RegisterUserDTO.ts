import { IsString } from 'class-validator';

export class RegisterUserDTO {
  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  birthDate: string;

  @IsString()
  gender: string;

  @IsString()
  phone: string;

  @IsString()
  role: string;
}
