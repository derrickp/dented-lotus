
import { User, GoogleUser, FacebookUser, UserContext } from "../common/models/User";
import { AuthenticationTypes } from "../common/authentication";
import { AuthResponse } from "../common/responses/AuthResponse";
import { PublicUser } from "../common/responses/PublicUser";
import { AuthPayload } from "../common/payloads/AuthPayload";

import { authenticate, saveUserInfo } from "./utilities/server/users";

export class IdentityManager {
    private _initializePromise: Promise<void>;
    private _googleAuth: gapi.auth2.GoogleAuth;

    appUser: User;
    haveFB: boolean;
    haveGoogle: boolean;

    fbLoaded?: () => void;
    googleLoaded?: () => void;

    userChange: () => void;

    constructor() {
        this.completeFacebookLogin = this.completeFacebookLogin.bind(this);
        this.completeGoogleLogin = this.completeGoogleLogin.bind(this);
        this.doFacebookLogin = this.doFacebookLogin.bind(this);
        this.doGoogleLogin = this.doGoogleLogin.bind(this);
        this.getToken = this.getToken.bind(this);
    }

    initialize(): Promise<void> {
        this._initializePromise = this._initializePromise ? this._initializePromise : new Promise<void>((resolve, reject) => {
            // First we'll initialize google
            return this._initGoogle()
                .then(() => {
                    console.log("get google login");
                    return this._getGoogleLogin();
                })
                // Then we'll check if they've logged in with Google
                .then(googleUser => {
                    if (googleUser) {
                        this.appUser = googleUser;
                        this.userChange();
                    }
                })
                .catch((error: Error) => {
                    console.error(error.message);
                })
                // Then we'll initialize Facebook
                .then(() => {
                    console.log("attempting to init Facebook");
                    return this._initFacebook();
                })
                // If they've logged in with Google above, we're done.
                // If they haven't, then we'll try to log them in with Facebook
                .then(() => {
                    if (this.appUser) {
                        return null;
                    }
                    return this._getFacebookLoginStatus();
                })
                // If the Facebook login worked, then we set the user here
                .then(fbUser => {
                    if (fbUser) {
                        this.appUser = fbUser;
                        this.userChange();
                    }
                })
                // log any errors
                .catch((error: Error) => {
                    console.error(error.message);
                })
                // resolve once it's all done
                .then(() => {
                    resolve();
                });
        });
        return this._initializePromise;
    }

    signOut(): Promise<void> {
        return this.appUser.logOut().then(success => {
            this.appUser = new User(null, "", null);
        });
    }

    get isLoggedIn(): boolean {
        return this.appUser != null && this.appUser.isLoggedIn;
    }

    getToken() {
        return this.appUser.id_token;
    }

    get userContext(): UserContext {
        const context: UserContext = {
            saveUser: (user: User) => {
                return saveUserInfo(user.json, this.appUser.id_token).then(() => {
                    this.userChange && this.userChange();
                });
            }
        };
        return context;
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

    completeFacebookLogin(args: FB.LoginStatusResponse): Promise<FacebookUser> {
        return new Promise<FacebookUser>((resolve, reject) => {
            const authPayload: AuthPayload = {
                auth_token: args.authResponse.accessToken,
                authType: AuthenticationTypes.FACEBOOK
            };
            return authenticate(authPayload).then(authResponse => {
                const user = new FacebookUser(args, authResponse.user, authResponse.id_token, this.userContext);
                resolve(user);
            }).catch((error: Error) => {
                console.error(error.message);
                alert(error.message);
            });
        });
    }

    private _initFacebook(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return this._checkFB().then(() => {
                this.haveFB = true;
                this.fbLoaded && this.fbLoaded();
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    }

    private _getFacebookLoginStatus(): Promise<FacebookUser> {
        return new Promise<FacebookUser>((resolve, reject) => {
            return this._checkFB().then(() => {
                FB.getLoginStatus((response: FB.LoginStatusResponse) => {
                    // If we haven't been authorized yet, then we aren't going to use Facebook to login
                    if (response.status !== "connected") {
                        resolve(null);
                    }
                    else {
                        return this.completeFacebookLogin(response)
                            .then(fbUser => {
                                resolve(fbUser);
                            }).catch(reject);
                    }
                }, true);
            }).catch(reject);
        });
    }

    private _checkFB(): Promise<void> {
        // Start a counter to make sure that we'll eventually resolve, even if we never load Facebook
        let counter = 0;
        if (window["FB"]) {
            return Promise.resolve();
        }
        else {
            return new Promise<void>((resolve, reject) => {
                const interval = setInterval(() => {
                    counter++;
                    if (window["FB"]) {
                        clearInterval(interval);
                        resolve();
                    }
                    else if (counter > 10) {
                        clearInterval(interval);
                        reject(new Error("No FB loaded"));
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
                    this.appUser = googleUser;
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
            }).catch(error => reject(error));
        });
    }

    private _getGoogleLogin(): Promise<GoogleUser> {
        return new Promise<GoogleUser>((resolve, reject) => {
            const loggedIn = this._googleAuth.isSignedIn.get();
            if (loggedIn) {
                const user: gapi.auth2.GoogleUser = this._googleAuth.currentUser.get();
                return this.completeGoogleLogin(user).then(googleUser => {
                    resolve(googleUser);
                }).catch(error => reject(error));
            }
            else {
                resolve(null);
            }
        });
    }

    private _initGoogle(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return this._initGoogleAuth2().then(() => {
                this.googleLoaded && this.googleLoaded();
                this._googleAuth = gapi.auth2.getAuthInstance();
                this.haveGoogle = true;
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
        let counter = 0;
        if (window["gapi"]) {
            return Promise.resolve();
        }
        else {
            return new Promise<void>((resolve, reject) => {
                const interval = setInterval(() => {
                    counter++;
                    if (window["gapi"]) {
                        clearInterval(interval);
                        resolve();
                    }
                    else if (counter > 10) {
                        clearInterval(interval);
                        reject(new Error("google failed to load"));
                    }
                }, 100);
            });
        }
    }
}