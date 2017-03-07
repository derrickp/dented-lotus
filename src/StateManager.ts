
import { Blog } from "../common/models/Blog";

import { Promise } from "bluebird";
import { User, GoogleUser, FacebookUser } from "../common/models/User";
import { Race, races } from "../common/models/Race";
import { Track } from "../common/models/Track";
import { DriverModel } from "../common/models/DriverModel";
import { getAllTracks, getAllDrivers } from "./Utilities/ServerUtils"

declare var FB: FBSDK;
export class StateManager {
    modalVisible = false;
    onLogIn: () => void;
    blogs: Blog[] = [
        {
            author: "Craig",
            date: "Sept. 33rd",
            message: "Today shouldn't exist!",
            title: "but Why!?"
        },
        {
            author: "Derrick",
            date: "Sept. 34th",
            message: "What have we done?!",
            title: "SEPTEMBER!!!"
        }
    ];

    nextRace = {
        displayName: "Australian GP",
        date: "March 26, 2017"
    };

    private _googleAuth: gapi.auth2.GoogleAuth;

    private _watches: Map<string, Function[]> = new Map<string, Function[]>();

    private _tracks: Promise<Track[]>;
    private _drivers: Promise<DriverModel[]>;

    private _user: User;

    get user(): User {
        return this._user;
    }

    set user(user: User) {
        this._user = user;
        if (this._watches.has("user")) {
            const callbacks = this._watches.get("user");
            callbacks.forEach(callback => {
                callback(this._user);
            });
        }
    }

    get races(): Race[] {
        return races;
    }

    get tracks(): Promise<Track[]> {
        this._tracks = this._tracks ? this._tracks : getAllTracks();
        return this._tracks;
    }

    get isLoggedIn(): boolean {
        return this.user != null && this.user.isLoggedIn();
    }

    get drivers(): Promise<DriverModel[]> {
        this._drivers = this._drivers ? this._drivers : getAllDrivers();
        return this._drivers;
    }

    constructor() {
        this._initGoogle();
        this._initFacebook();
    }

    private _initGoogle() {
        if (window["gapi"]) {
            gapi.load("auth2", () => {
                gapi.auth2.init({
                    client_id: "1047134015899-kpabbgk5b6bk0arj4b1hecktier9nki7.apps.googleusercontent.com"
                }).then(() => {
                    this._googleAuth = gapi.auth2.getAuthInstance();
                    this._googleAuth.isSignedIn.listen(signedIn => {
                        const user: gapi.auth2.GoogleUser = this._googleAuth.currentUser.get();
                        this.onGoogleLogin(user);
                    });
                    const loggedIn = this._googleAuth.isSignedIn.get();
                    if (loggedIn) {
                        const user: gapi.auth2.GoogleUser = this._googleAuth.currentUser.get();
                        this.onGoogleLogin(user);
                    } else {
                        window.setTimeout(() => {
                            const signinPromise = this._googleAuth.signIn().then(() => {
                                debugger;
                            }, (error: Error) => {
                                debugger;
                            });
                        }, 1000);
                    }
                }, (reason: string) => {

                });
            });
        } else {
            window.addEventListener("gapi-loaded", () => {
                this._initGoogle();
            });
        }
    }

    private _initFacebook() {
        (<any>window).fbAsyncInit = function () {
            FB.init({
                appId: '1630122457296096',
                cookie: true,
                xfbml: true,
                version: 'v2.8'
            });

            (<any>FB).AppEvents.logPageView();
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    // Logged into your app and Facebook.
                    this.currentUser = new FacebookUser(response);
                    return;
                }
            });
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.8";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    watch(path: string, callback: Function) {
        if (this._watches.has(path)) {
            this._watches.get(path).push(callback);
        } else {
            this._watches.set(path, [callback]);
        }
    }

    /**
     *  Query for blog posts.
     *  returns Blog[]
     */
    getBlogs(whereClause?: string): Promise<Blog[]> {
        return Promise.resolve(this.blogs.sort((a: Blog, b: Blog) => { return b.date.localeCompare(a.date) }));
    }

    getNextRace(): Promise<Race> {
        return Promise.resolve(this.nextRace);
    }

    signOut(): void {
        this.user.logOut();
    }

    setUser(user) {
        this.user = user;
    }

    onGoogleLogin(response: gapi.auth2.GoogleUser) {
        const googleUser = new GoogleUser(response);
        this.user = googleUser;
    }
}