import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProfessionalService } from './professional.service';
import { LoginProfessionalDto, SignupProfessionalDto, UpdateProfessionalDto } from './dto';
import { AuthResponse } from 'src/common/types/auth-response.type';
import { professional } from '@prisma/client';

@Controller()
export class ProfessionalController {
  
    constructor(private readonly professionalService: ProfessionalService) {}

    @MessagePattern('auth.register.professional')
    register(
        @Payload() signupProfessionalDto: SignupProfessionalDto
    ): Promise<AuthResponse> {

        return this.professionalService.register(signupProfessionalDto as any)
    }

    @MessagePattern('auth.login.professional')
    async login(
        @Payload() loginProfessionalDto: LoginProfessionalDto
    ): Promise<AuthResponse> {
        return await this.professionalService.login(loginProfessionalDto)
    }

    @MessagePattern('auth.verifyToken.professional')
    verifyToken(
        @Payload() token: string
    ): Promise<AuthResponse> {
        return this.professionalService.verifyToken(token)
    }

    @MessagePattern('auth.update.professional')
    update(
        @Payload('updateProfessionalDto') updateProfessionalDto: UpdateProfessionalDto
    ): Promise<professional> {

        const { user_id, ...data } = updateProfessionalDto

        return this.professionalService.update({
            whereUniqueInput: { user_id },
            data
        })
    }
}
