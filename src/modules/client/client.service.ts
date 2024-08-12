import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LoginClientDto, SignupClientDto } from './dto';
import { client, Prisma, PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { user_types } from 'src/common/enums/user_types.enum';
import { AuthResponse } from 'src/common/types/auth-response.type';
import * as bcrypt from 'bcrypt';
import { envs } from 'src/config';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ClientService extends PrismaClient implements OnModuleInit {

    private readonly logger = new Logger('ClientService');

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

    async register(
        data: Prisma.clientCreateInput
    ): Promise<AuthResponse> {

        const { email, phone, password} = data;

        data.password = bcrypt.hashSync(password, 10);
        data.roles = [user_types.client];

        try {
            
            // Busco el usuario por email o phone
            await this.client.findFirstOrThrow({
                where: {
                    OR: [
                        {email},
                        {phone}
                    ]
                }
            })

            // Creo el nuevo cliente
            const newUser = await this.client.create({ data })

            // Preparo el payload para el token
            const payload: JwtPayload = {
                mongo_id: newUser.id,
                // user_id: newUser.user_id,
                user_types: newUser.roles as user_types[]
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

    async login(
        loginClientDto: LoginClientDto
    ): Promise<AuthResponse> {

        const { email, phone, password } = loginClientDto;

        try {

            // Busco el usuario por email o phone y que sea valido
            const user = await this.validateUser({ email, phone })

            // Verifico que las contraseñas coincidan
            if (!bcrypt.compareSync(password, user.password)) throw new RpcException({
                status: 400,
                message: 'Invalid credentials'
            })

            // Actualizo la fecha de ultimo login
            this.updateLastLoginDate({ whereUniqueInput: {id: user.id} })

            // Preparo el payload para el token
            const payload: JwtPayload = {
                mongo_id: user.id,
                // user_id: user.user_id,
                user_types: user.roles as user_types[]
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
        whereUniqueInput: Prisma.clientWhereUniqueInput
    }): Promise<void> {

        const { whereUniqueInput } = params;

        try {
            await this.client.update({
                where: whereUniqueInput,
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
                secret: envs.jwtSecretClient,
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
        whereUniqueInput: Prisma.clientWhereUniqueInput,
    ): Promise<client> {

        try {
            // Verifico que el usuario este activo
            const user = await this.client.findUniqueOrThrow({
                where: whereUniqueInput
            })
    
            // Verifico que el user este activo
            if (user.deleted_at) throw new RpcException({
                status: 401,
                message: 'Unauthorized'
            })
            
            return user;
        } catch (error) {
            throw new RpcException({
                status: 401,
                message: 'Unauthorized'
            });
        }

    }
}
