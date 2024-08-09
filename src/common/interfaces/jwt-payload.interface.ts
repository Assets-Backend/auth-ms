import { user_types } from "../enums/user_types.enum";

export interface JwtPayload {
    mongo_id: string;
    user_types: user_types[];
}