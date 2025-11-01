import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDTO } from './dto/RegisterUserDTO';
import { UserData } from './interfaces/user-data.interface';
import { LoginUserDTO } from './dto/LoginUserDTO';
import { UserRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import { UserResponseDTO } from './dto/UserResponseDTO';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './interfaces/user-data.interface';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) { }

    // RegisterUserDTO ya que solo me interesa guardar la informacion del usuario
    async registerUser(user: RegisterUserDTO): Promise<UserData> {
        const userExists = await this.userRepository.findByEmail(user.email);
        if (userExists) {
            throw new UnauthorizedException('User already exists');
        }
        const adult = new Date().getFullYear() - new Date(user.birthDate).getFullYear() >= 18;
        if (!adult) {
            throw new UnauthorizedException('User must be at least 18 years old');
        }
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        const userData: UserData = {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            password: hashedPassword,
            birthDate: user.birthDate,
            phone: user.phone,
            gender: user.gender,
            role: user.role,
            createdAt: new Date().toISOString(),
        };
        const userCreated = this.userRepository.create(userData);
        return this.userRepository.save(userCreated);
    }

    async loginUser(
        user: LoginUserDTO,
    ): Promise<{ user: UserResponseDTO; access_token: string }> {
        const userExists = await this.userRepository.findByEmail(user.email);

        if (!userExists) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
            user.password,
            userExists.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        // Usar destructuring para que no se envie la contraseña y el id
        const { password, ...safeUserData } = userExists;
        const userResponse = new UserResponseDTO(safeUserData);

        const payload: UserPayload = {
            id: userExists.id,
            name: userExists.name,
            lastName: userExists.lastName,
            email: userExists.email,
            role: userExists.role,
        };

        const token = await this.jwtService.signAsync(payload);

        return {
            user: userResponse,
            access_token: token,
        };
    }
}
