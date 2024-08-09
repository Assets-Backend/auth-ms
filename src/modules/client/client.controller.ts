import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientService } from './client.service';
import { LoginClientDto, SignupClientDto } from './dto';
import { AuthResponse } from 'src/common/types/auth-response.type';
import { user_types } from 'src/common/enums/user_types.enum';

@Controller()
export class ClientController {
  
    constructor(private readonly clientService: ClientService) {}

    @MessagePattern('auth.register.client')
    register(
        @Payload() signupClientDto: SignupClientDto
    ): Promise<AuthResponse> {
        return this.clientService.register(signupClientDto as any)
    }

    @MessagePattern('auth.login.client')
    async login(
        @Payload() loginClientDto: LoginClientDto
    ): Promise<AuthResponse> {
        return await this.clientService.login(loginClientDto)
    }

    @MessagePattern('auth.verifyToken.client')
    verifyToken(
        @Payload() token: string
    ): Promise<AuthResponse> {
        return this.clientService.verifyToken(token)
    }
}
