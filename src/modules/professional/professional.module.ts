import { Module } from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { ProfessionalController } from './professional.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { NatsModule } from 'src/transport/nats.module';

@Module({
    imports: [
        NatsModule,
        JwtModule.register({
            global: true,
            secret: envs.jwtSecretProfessional,
            signOptions: { expiresIn: '4h' },
        })
    ],
    controllers: [ProfessionalController],
    providers: [ProfessionalService],
})
export class ProfessionalModule {}
