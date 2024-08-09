import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { gender_options } from 'src/common/enums/gender_options.enum';

export class SignupProfessionalDto {
  
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    last_name: string;
    
    @IsEmail()
    email: string;

    @IsOptional()
    @IsPhoneNumber('AR')
    phone?: string;
    
    @IsStrongPassword()
    password: string;

    @IsEnum(gender_options)
    gender: string;

    last_login: Date = null; 

    deleted_at: Date = null;
}
