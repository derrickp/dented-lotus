import { UserResponse } from "./User";

export interface AuthenticationPayload {
    auth_token: string;
    authType: string;
}

export namespace AuthenticationTypes {
    export const GOOGLE = "google";
    export const FACEBOOK = "facebook";
}

export interface AuthenticationResponse {
    id_token: string;
    user: UserResponse;
}

export interface Credentials {
    scope: string[];
    key: string;
}