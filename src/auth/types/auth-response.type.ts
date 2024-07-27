import { user } from "@prisma/client";

export type AuthResponse = {
    token: string;
    user: user;
}