import { user_types } from "../enums/user_types.enum";

export interface JwtPayload {
    mongo_id: string;
    user_id: number;
    user_type: user_types[];
}