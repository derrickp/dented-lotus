
import { User, GoogleUser, FacebookUser, UserContext } from "../../common/models/User";
import { DriverModel } from "../../common/models/Driver";
import { TeamModel } from "../../common/models/Team";
import { AuthenticationTypes } from "../../common/authentication";
import { AuthResponse } from "../../common/responses/AuthResponse";
import { PublicUser } from "../../common/responses/PublicUser";
import { AuthPayload } from "../../common/payloads/AuthPayload";

import { authenticate, saveUserInfo, getUser as serverGetUser, getAllPublicUsers } from "../utilities/server/users";

export class UserStore {
    private _initializePromise: Promise<void>;
    private _googleAuth: gapi.auth2.GoogleAuth;

    private _userMap: Map<string, User> = new Map<string,User>();

    user: User;
    haveFB: boolean;
    haveGoogle: boolean;
    publicUsers: PublicUser[] = [];

    userChange: () => void;
    fbLoaded?: () => void;
    googleLoaded?: () => void;
    getDriver: (key: string) => DriverModel;
    getTeam: (key: string) => TeamModel;

    constructor() {
        this.completeFacebookLogin = this.completeFacebookLogin.bind(this);
        this.completeGoogleLogin = this.completeGoogleLogin.bind(this);
        this.doFacebookLogin = this.doFacebookLogin.bind(this);
        this.doGoogleLogin = this.doGoogleLogin.bind(this);
        this.getUser = this.getUser.bind(this);
        this.refreshUser = this.refreshUser.bind(this);
    }

    get isLoggedIn(): boolean {
        return this.user != null && this.user.isLoggedIn;
    }

    get userContext(): UserContext {
        const context: UserContext = {
            saveUser: (user: User) => {
                return saveUserInfo(user.json, this.user.id_token).then(() => {
                    this.userChange && this.userChange();
                });
            }
        };
        return context;
    }

    initialize(): Promise<void> {
        this._initializePromise = this._initializePromise ? this._initializePromise : new Promise<void>((resolve, reject) => {
            const promises: Promise<void>[] = [];
            promises.push(this._initFacebook());
            promises.push(this._initGoogle());
            promises.push(this.refreshAllUsers());
            return Promise.all(promises).then(() => {
                resolve();
            });
        });
        return this._initializePromise;
    }

    getUser(key: string) {
        if (this._userMap.has(key)) return this._userMap.get(key);
        return null;
    }

    refreshUser(key: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return serverGetUser(key, this.user.id_token).then(userResponse => {
                const user = new User(userResponse, "", this.userContext);
                this._userMap.set(key, user);
                resolve();
            }).catch(reject);
        });
    }

    signOut(): Promise<void> {
        return this.user.logOut().then(success => {
            this.user = new User(null, "", null);
        });
    }

    refreshAllUsers(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return getAllPublicUsers().then((users: PublicUser[]) => {
                this.publicUsers = users;
                resolve();
            });
        });
    }

    // Facebook
    doFacebookLogin(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            FB.login((response) => {
                // handle the response
                return this.completeFacebookLogin(response).then(() => {
                    resolve();
                });
            }, { scope: 'public_profile,email' });
        });
    }

    completeFacebookLogin(args: FB.LoginStatusResponse): Promise<void> {
        const authPayload: AuthPayload = {
            auth_token: args.authResponse.accessToken,
            authType: AuthenticationTypes.FACEBOOK
        };

        return authenticate(authPayload).then(authResponse => {
            const user = new FacebookUser(args, authResponse.user, authResponse.id_token, this.userContext);
            this.user = user;
        }).catch((error: Error) => {
            console.error(error.message);
            alert(error.message);
        });
    }

    private _initFacebook(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return this._getFacebookLoginStatus().then(response => {
                this.haveFB = true;
                this.fbLoaded && this.fbLoaded();
                // If we haven't been authorized yet, then we aren't going to use Facebook to login
                if (response.status !== "connected") {
                    return Promise.resolve();
                }
                else {
                    return this.completeFacebookLogin(response);
                }
            }).then(() => {
                resolve();
            });
        });
    }

    private _getFacebookLoginStatus(): Promise<FB.LoginStatusResponse> {
        return new Promise<FB.LoginStatusResponse>((resolve, reject) => {
            return this._checkFB().then(() => {
                FB.getLoginStatus((response: FB.LoginStatusResponse) => {
                    resolve(response);
                }, true);
            });
        });
    }

    private _checkFB(): Promise<void> {
        if (window["FB"]) {
            return Promise.resolve();
        }
        else {
            return new Promise<void>((resolve, reject) => {
                const interval = setInterval(() => {
                    if (window["FB"]) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }
    }


    // Google
    doGoogleLogin(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._googleAuth.signIn().then(() => {
                const user = this._googleAuth.currentUser.get();
                return this.completeGoogleLogin(user).then((googleUser) => {
                    this.user = googleUser;
                    this.userChange();
                    resolve();
                });
            });
        });
    }

    completeGoogleLogin(response: gapi.auth2.GoogleUser): Promise<GoogleUser> {
        const authPayload: AuthPayload = {
            auth_token: response.getAuthResponse().id_token,
            authType: AuthenticationTypes.GOOGLE
        };
        return new Promise<GoogleUser>((resolve, reject) => {
            return authenticate(authPayload).then(authResponse => {
                const googleUser = new GoogleUser(response, authResponse.user, authResponse.id_token, this.userContext);
                resolve(googleUser);
            }).catch(reject);
        });
    }

    private _initGoogle(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return this._initGoogleAuth2().then(() => {
                this.googleLoaded && this.googleLoaded();
                this._googleAuth = gapi.auth2.getAuthInstance();
                this.haveGoogle = true;
                const loggedIn = this._googleAuth.isSignedIn.get();
                if (loggedIn) {
                    const user: gapi.auth2.GoogleUser = this._googleAuth.currentUser.get();
                    return this.completeGoogleLogin(user);
                }
                else {
                    return Promise.resolve<GoogleUser>(null);
                }
            }).then(googleUser => {
                this.user = googleUser;
                this.userChange();
                resolve();
            }).catch((error: Error) => {
                console.error(error.stack);
            });
        });
    }

    private _initGoogleAuth2(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return this._checkGoogleAPI().then(() => {
                gapi.load("auth2", () => {
                    gapi.auth2.init({
                        client_id: "1047134015899-kpabbgk5b6bk0arj4b1hecktier9nki7.apps.googleusercontent.com"
                    }).then(() => {
                        resolve();
                    }, (reason: string) => {
                        reject(new Error(reason));
                    });
                });
            });
        });
    }

    private _checkGoogleAPI(): Promise<void> {
        if (window["gapi"]) {
            return Promise.resolve();
        }
        else {
            return new Promise<void>((resolve, reject) => {
                const interval = setInterval(() => {
                    if (window["gapi"]) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }
    }
}