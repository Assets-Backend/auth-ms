import { IsEmail, IsOptional, IsPhoneNumber, IsStrongPassword } from "class-validator";

export class LoginProfessionalDto {

    @IsOptional()
    @IsEmail()
    email?: string;
    
    @IsOptional()
    @IsPhoneNumber('AR')
    phone?: string;
    
    @IsStrongPassword()
    password: string;
}
