import { Controller, Post, Res } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { RegisterUserDTO } from './dto/RegisterUserDTO';
import { UsersService } from './users.service';
import { LoginUserDTO } from './dto/LoginUserDTO';
import { Response } from 'express';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Post('register')
    registerUser(@Body() user: RegisterUserDTO) {
        return this.usersService.registerUser(user);
    }

    @Post('login')
    async loginUser(@Body() loginDto: LoginUserDTO, @Res() res: Response) {
        const { user, access_token } = await this.usersService.loginUser(loginDto);
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
        });
        return res.status(200).json({
            message: 'Login successful',
            user,
        });
    }
}
