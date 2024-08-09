import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: envs.jwtSecretClient,
            signOptions: { expiresIn: '4h' },
        })
    ],
    controllers: [ClientController],
    providers: [ClientService],
})
export class ClientModule {}