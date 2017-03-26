
export interface UserResponse {
    key?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    points?: number;
    email?: string;
}
export interface PublicUser {
    display:string;
    points:number;
} 

export namespace UserRoles {
    export const ADMIN = "admin";
    export const USER = "user";
}

export class User {
    protected _loggedIn: boolean = false;
    id_token: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    isAdmin: boolean;

    constructor(dentedLotusUser: UserResponse, id_token: string) {
        if (dentedLotusUser) {
            this.displayName = dentedLotusUser.displayName;
            if (dentedLotusUser.role === UserRoles.ADMIN) {
                this.isAdmin = true;
            }
        }
        this.id_token = id_token;
    }

    get isLoggedIn(): boolean {
        return this._loggedIn;
    }

    get name(): string {
        if (this.displayName) return this.displayName;
        return this.firstName + " " + this.lastName.substr(0, 1) + ".";
    }

    logOut(): Promise<boolean> {
        console.log("Not Implemented");
        return Promise.resolve(false);
    }
}

export class GoogleUser extends User {
    constructor(googleUser: gapi.auth2.GoogleUser, dentedLotusUser: UserResponse, id_token: string) {
        super(dentedLotusUser, id_token);
        const profile = googleUser.getBasicProfile();
        this.email = profile.getEmail();
        this.firstName = profile.getGivenName();
        this.lastName = profile.getFamilyName();
        this.imageUrl = profile.getImageUrl();
        this._loggedIn = true;

        // !TEMP! just for testing purposes
        window["googleLogOut"] = this.logOut;
    }

    logOut(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const auth2 = gapi.auth2.getAuthInstance();

            auth2.signOut().then(() => {
                console.log('User signed out.');
                resolve(true);
            }, (reason: string) => {
                reject(new Error(reason));
            });
        });
    }


}
export class FacebookUser extends User {
    authToken: string;
    constructor(fbResponse: FB.LoginStatusResponse, dentedLotusUser: UserResponse, id_token: string) {
        super(dentedLotusUser, id_token);
        this.authToken = fbResponse.authResponse.accessToken;
        // We could maybe get some facebook info here if we wanted it.
        this._loggedIn = true;
    }

    logOut(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            FB.logout((response) => {
                this._loggedIn = false;
                resolve(true);
            });
        });
    }
}