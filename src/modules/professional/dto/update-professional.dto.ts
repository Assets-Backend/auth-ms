import { PartialType } from '@nestjs/mapped-types';
import { SignupProfessionalDto } from './signup-professional.dto';
import { IsInt, IsPositive, Max } from 'class-validator';

export class UpdateProfessionalDto extends PartialType(SignupProfessionalDto) {

    @IsInt()
    @IsPositive()
    @Max(2147483647)
    user_id: number; 
}
