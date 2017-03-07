import { DentedLotusUser } from "./User";

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
    user: DentedLotusUser;
}