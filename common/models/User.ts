
import { UserResponse } from "../responses/UserResponse";
import { getRandomInt } from "../utils/numbers";
import { DEFAULT_IMAGES } from "../utils/images"
import { DriverModel } from "./Driver";
import { TeamModel } from "./Team";

export interface PublicUser {
    imageUrl: string;
    display: string;
    points: number;
    key: string;
}

export namespace UserRoles {
    export const ADMIN = "admin";
    export const USER = "user";
}

export interface UserContext {
    saveUser: (user: User) => Promise<void>;
    getDriver: (key: string) => DriverModel;
    getTeam: (key: string) => TeamModel;
}

export class User {
    protected _loggedIn: boolean = false;
    protected _context: UserContext;
    id_token: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    isAdmin: boolean;
    key: string;
    usingDefaultImage: boolean;
    faveDriver: string;
    faveTeam: string;

    constructor(dentedLotusUser: UserResponse, id_token: string, context: UserContext) {
        if (dentedLotusUser) {
            this.key = dentedLotusUser.key;
            this.displayName = dentedLotusUser.displayName;
            if (dentedLotusUser.role === UserRoles.ADMIN) {
                this.isAdmin = true;
            }
            this.firstName = dentedLotusUser.firstName;
            this.lastName = dentedLotusUser.lastName;
            this.imageUrl = dentedLotusUser.imageUrl;
            this.faveDriver = dentedLotusUser.faveDriver;
            this.faveTeam = dentedLotusUser.faveTeam;
            this._loggedIn = true;
        }
        else {
            this._loggedIn = false;
        }
        this.id_token = id_token;
        this._context = context;
    }

    save(): Promise<void> {
        if (!this._context) {
            return Promise.reject(new Error("need context"));
        }
        return this._context.saveUser(this);
    }

    get isLoggedIn(): boolean {
        return this._loggedIn;
    }

    get name(): string {
        if (this.displayName) return this.displayName;
        return this.firstName + " " + this.lastName.substr(0, 1) + ".";
    }

    get json(): UserResponse {
        return {
            key: this.key,
            displayName: this.displayName,
            lastName: this.lastName,
            email: this.email,
            firstName: this.firstName,
            imageUrl: this.usingDefaultImage ? "" : this.imageUrl,
            faveDriver: this.faveDriver,
            faveTeam: this.faveTeam
        };
    }

    setDefaultImage() {
        const num = getRandomInt(0, 2);
        this.imageUrl = DEFAULT_IMAGES[num];
        this.usingDefaultImage = true;
    }

    logOut(): Promise<boolean> {
        console.log("Not Implemented");
        return Promise.resolve(false);
    }
}

export class GoogleUser extends User {
    constructor(googleUser: gapi.auth2.GoogleUser, dentedLotusUser: UserResponse, id_token: string, context: UserContext) {
        super(dentedLotusUser, id_token, context);
        const profile = googleUser.getBasicProfile();
        this.email = this.email || profile.getEmail();
        this.firstName = this.firstName || profile.getGivenName();
        this.lastName = this.lastName || profile.getFamilyName();
        this._loggedIn = true;

        if (!this.imageUrl) {
            this.setDefaultImage();
        }

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
    constructor(fbResponse: FB.LoginStatusResponse, dentedLotusUser: UserResponse, id_token: string, context: UserContext) {
        super(dentedLotusUser, id_token, context);
        this.authToken = fbResponse.authResponse.accessToken;
        // We could maybe get some facebook info here if we wanted it.
        this._loggedIn = true;
        if (!this.imageUrl) {
            this.setDefaultImage();
        }
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