import { IsEmail, IsOptional, IsPhoneNumber, IsStrongPassword } from "class-validator";


export class LoginDto {

    // TODO: Validar con regex
    @IsOptional()
    @IsEmail()
    email?: string;
    
    // TODO: Validar con regex
    @IsOptional()
    @IsPhoneNumber('AR')
    phone?: string;
    
    // TODO: Validar con regex
    @IsStrongPassword()
    password: string;
}
