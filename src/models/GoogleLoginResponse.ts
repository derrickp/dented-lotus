// Based on https://developers.google.com/identity/sign-in/web/reference
export interface GoogleLoginResponse {
    getBasicProfile(): BasicProfile;
    getAuthResponse(): AuthResponse;
    getGrantedScopes(): string;
    getHostedDomain(): string;
    getId(): string;
    isSignedIn(): boolean;
    hasGrantedScopes(scopes: string): boolean;
    disconnect(): void;
    grantOfflineAccess(options: GrantOfflineAccessOptions): Promise<GoogleLoginResponseOffline>;
    signIn(options: SignInOptions): Promise<any>;
    grant(options: SignInOptions): Promise<any>;
}

export interface AuthResponse {
    readonly access_token: string;
    readonly id_token: string;
    readonly login_hint: string;
    readonly scope: string;
    readonly expires_in: number;
    readonly first_issued_at: number;
    readonly expires_at: number;
}

export interface BasicProfile {
    getId(): string;
    getEmail(): string;
    getName(): string;
    getGivenName(): string;
    getFamilyName(): string;
    getImageUrl(): string;
}

export interface GrantOfflineAccessOptions {
    readonly scope?: string;
    readonly redirect_uri?: string;
}

export interface GoogleLoginResponseOffline {
    readonly code: string;
}

export interface SignInOptions {
    readonly scope?: string;
    readonly app_package_name?: string;
    readonly fetch_basic_profile?: boolean;
    readonly prompt?: string;
}