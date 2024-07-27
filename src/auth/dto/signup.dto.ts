import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString, IsStrongPassword } from "class-validator";
import { user_types } from "../enums/user_types.enum";
import { gender_options } from "../enums/gender_options.enum";

export class SignupDto {

    @IsNumber()
    @IsPositive()
    user_id: number;

    @IsString()
    name: string;

    @IsString()
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