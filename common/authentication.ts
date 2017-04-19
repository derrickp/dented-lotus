export namespace AuthenticationTypes {
    export const GOOGLE = "google";
    export const FACEBOOK = "facebook";
}

export interface Credentials {
    scope: string[];
    key: string;
}