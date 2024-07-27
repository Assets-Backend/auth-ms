import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto, SignupDto } from './dto';
import { user_types } from './enums/user_types.enum';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // foo.* matches foo.bar, foo.baz, and so on, but not foo.bar.baz
    // foo.*.bar matches foo.baz.bar, foo.qux.bar, and so on, but not foo.bar or foo.bar.baz
    // foo.> matches foo.bar, foo.bar.baz, and so on
    @MessagePattern('auth.register.client')
    registerClient(
        @Payload() signupDto: SignupDto
    ) {
        const roles = [user_types.clientAdmin]
        return this.authService.registerUser(signupDto, roles)
    }

    @MessagePattern('auth.register.professional')
    registerProfessional(
        @Payload() signupDto: SignupDto
    ) {
        const roles = [user_types.professional]
        return this.authService.registerUser(signupDto, roles)
    }

    @MessagePattern('auth.login.user')
    async loginUser(
        @Payload() loginDto: LoginDto
    ) {
        const user  = await this.authService.loginUser(loginDto)
        return user
    }

    @MessagePattern('auth.verify.token')
    verifyToken(
        @Payload() token: string
    ) {
        return this.authService.verifyToken(token)
    }
}
