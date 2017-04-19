import { UserResponse } from "./UserResponse";

export interface AuthResponse {
    id_token: string;
    user: UserResponse;
}