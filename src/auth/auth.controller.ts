import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto, SignupDto } from './dto';
import { user_types } from './enums/user_types.enum';
import { AuthResponse } from './types/auth-response.type';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // foo.* matches foo.bar, foo.baz, and so on, but not foo.bar.baz
    // foo.*.bar matches foo.baz.bar, foo.qux.bar, and so on, but not foo.bar or foo.bar.baz
    // foo.> matches foo.bar, foo.bar.baz, and so on
    @MessagePattern('auth.register.client')
    registerClient(
        @Payload() signupDto: SignupDto
    ): Promise<AuthResponse> {
        const roles = [user_types.clientAdmin]
        return this.authService.registerUser(signupDto, roles)
    }

    @MessagePattern('auth.register.professional')
    async registerProfessional(
        @Payload() signupDto: SignupDto
    ): Promise<AuthResponse> {
        const roles = [user_types.professional]
        return await this.authService.registerUser(signupDto, roles)
    }

    @MessagePattern('auth.login.user')
    async loginUser(
        @Payload() loginDto: LoginDto
    ): Promise<AuthResponse> {
        return await this.authService.loginUser(loginDto)
    }

    @MessagePattern('auth.verify.token')
    verifyToken(
        @Payload() token: string
    ): Promise<AuthResponse> {
        return this.authService.verifyToken(token)
    }
}
