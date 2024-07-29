import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, user } from '@prisma/client';
import { LoginDto, SignupDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';
import { AuthResponse } from './types/auth-response.type';
import { Prisma } from '@prisma/client';
import { user_types } from './enums/user_types.enum';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('AuthService');

    constructor(
        private readonly jwtService: JwtService
    ) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Connected to the database');
    }

    async signJWT(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }

    async registerUser(
        signupDto: SignupDto,
        roles: user_types[]
    ): Promise<AuthResponse> {

        const { email, phone, password } = signupDto;

        try {
            
            // Busco el usuario por email o phone
            const user = await this.user.findFirst({
                where: {
                    OR: [
                        {email},
                        {phone}
                    ]
                }
            })

            // Verifico que el usuario no exista
            if (user) {
                throw new RpcException({
                    status: 400,
                    message: 'User already exists'
                })
            }

            // Creo el nuevo usuario
            const newUser = await this.user.create({
                data: {
                    ...signupDto,
                    roles,
                    password: bcrypt.hashSync(password, 10),
                }
            })

            // Preparo el payload para el token
            const payload: JwtPayload = {
                mongo_id: newUser.id,
                user_id: newUser.user_id,
                user_type: newUser.roles as user_types[]
            }

            return {
                user: newUser,
                token: await this.signJWT(payload)
            }

        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message
            });
        }
    }

    async loginUser(
        loginDto: LoginDto
    ): Promise<AuthResponse> {

        const { email, phone, password } = loginDto;

        try {

            // Busco el usuario por email o phone y que sea valido
            const user = await this.validateUser({
                email,
                phone
            })

            // Verifico que las contraseñas coincidan
            if (!bcrypt.compareSync(password, user.password)) 
                throw new RpcException({
                    status: 400,
                    message: 'Invalid credentials'
                })

            // Actualizo la fecha de ultimo login
            this.updateLastLoginDate({
                userWhereUniqueInput: {id: user.id}
            })

            // Preparo el payload para el token
            const payload: JwtPayload = {
                mongo_id: user.id,
                user_id: user.user_id,
                user_type: user.roles as user_types[]
            }

            return {
                user,
                token: await this.signJWT(payload)
            }

        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message
            });
        }
    }

    private async updateLastLoginDate(params: {
        userWhereUniqueInput: Prisma.userWhereUniqueInput
    }): Promise<void> {
        const { userWhereUniqueInput } = params;

        try {
            await this.user.update({
                where: userWhereUniqueInput,
                data: {
                    last_login: new Date()
                }
            })

        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message
            });
        }
    }

    async verifyToken(
        token: string
    ): Promise<AuthResponse> {

        try {
            
            // Verifico el token
            const {sub, iat, exp, ...payload} = this.jwtService.verify(token, {
                secret: envs.jwtSecret,
            });

            // Verifico que el usuario exista
            const user = await this.validateUser({
                id: payload.mongo_id
            })

            return {
                user,
                token: await this.signJWT(payload)
            }

        } catch (error) {
            throw new RpcException({
                status: 401,
                message: 'Invalid token'
            })
        }
    }

    async validateUser(
        userWhereUniqueInput: Prisma.userWhereUniqueInput,
    ): Promise<user> {

        // Verifico que el usuario este activo
        const user = await this.user.findUnique({
            where: userWhereUniqueInput
        })

        // Verifico que el user este activo
        if (user.deleted_at)
            throw new RpcException({
                status: 401,
                message: 'Unauthorized'
            })

        return user;
    }
}
