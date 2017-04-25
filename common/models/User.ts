
import { UserResponse } from "../responses/UserResponse";
import { PublicUser } from "../responses/PublicUser";
import { getRandomInt } from "../utils/numbers";
import { DEFAULT_IMAGES } from "../utils/images"
import { UserRoles } from "../roles";

export interface UserContext {
    saveUser: (user: User) => Promise<void>;
}

export class User implements PublicUser {
    protected _loggedIn: boolean = false;
    protected _context: UserContext;
    id_token: string;
    display: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    isAdmin: boolean;
    key: string;
    usingDefaultImage: boolean;
    faveDriver: string;
    faveTeam: string;
    points: number;
    numCorrectPicks: number;
    position: number;
    positionChange: number;

    constructor(dentedLotusUser: UserResponse, id_token: string, context: UserContext) {
        if (!dentedLotusUser) {
            this._loggedIn = false;
            return;
        }
        this.key = dentedLotusUser.key;
        this.display = dentedLotusUser.display;
        if (dentedLotusUser.role === UserRoles.ADMIN) {
            this.isAdmin = true;
        }
        this.email = dentedLotusUser.email;
        this.firstName = dentedLotusUser.firstName;
        this.lastName = dentedLotusUser.lastName;
        this.imageUrl = dentedLotusUser.imageUrl;
        this.faveDriver = dentedLotusUser.faveDriver;
        this.faveTeam = dentedLotusUser.faveTeam;
        this.numCorrectPicks = dentedLotusUser.numCorrectPicks;
        this.display = dentedLotusUser.display;
        this.position = dentedLotusUser.position;
        this.points = dentedLotusUser.points;
        this.positionChange = dentedLotusUser.positionChange;
        this._loggedIn = true;
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
        if (this.display) return this.display;
        return this.firstName + " " + this.lastName.substr(0, 1) + ".";
    }

    get json(): UserResponse {
        return {
            key: this.key,
            display: this.display,
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