import { Module } from '@nestjs/common';
import { 
    ProfessionalModule,
    ClientModule
} from './modules';

@Module({
    imports: [
        ProfessionalModule, 
        ClientModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
