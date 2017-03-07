
import { Blog } from "../common/models/Blog";

import { Promise } from "bluebird";
import { User, GoogleUser, FacebookUser } from "../common/models/User";
import { Race, races } from "../common/models/Race";
import { Track } from "../common/models/Track";
import { DriverModel } from "../common/models/DriverModel";
import { AuthenticationPayload, AuthenticationTypes, AuthenticationResponse } from "../common/models/Authentication";
import { getAllTracks, getAllDrivers, authenticate, saveDrivers } from "./Utilities/ServerUtils"

declare var FB: FBSDK;
export class StateManager {
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

    private _watches: Map<string, Function[]> = new Map<string, Function[]>();

    private _tracks: Promise<Track[]>;
    private _drivers: Promise<DriverModel[]>;

    private _user: User;

    get user(): User {
        return this._user;
    }

    set user(user: User) {
        this._user = user;
        this._publishWatches("user");
    }

    get races(): Race[] {
        return races;
    }

    get tracks(): Promise<Track[]> {
        this._tracks = this._tracks ? this._tracks : getAllTracks();
        return this._tracks;
    }

    get isLoggedIn(): boolean {
        return this.user != null && this.user.isLoggedIn;
    }

    get drivers(): Promise<DriverModel[]> {
        this._drivers = this._drivers ? this._drivers : getAllDrivers();
        return this._drivers;
    }

    constructor() {
        // this._initFacebook();
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

    private _publishWatches(path: string) {
        if (this._watches.has(path)) {
            const callbacks = this._watches.get(path);
            callbacks.forEach(callback => {
                callback(this._user);
            });
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
        this.user.logOut().then(success => {
            this.user = null;
        });
    }

    updateDriver(driverModel: DriverModel): Promise<DriverModel> {
        if (!this.user.isAdmin || !this.user.id_token) {
            return Promise.reject(new Error("Unauthorized"));
        }
        return new Promise<DriverModel>((resolve, reject) => {
            return saveDrivers([driverModel], this.user.id_token).then(newModels => {
                if (newModels.length) {
                    resolve(newModels[0]);
                }
            });
        });
    }

    completeGoogleLogin(response: gapi.auth2.GoogleUser) {
        const authPayload: AuthenticationPayload = {
            auth_token: response.getAuthResponse().id_token,
            authType: AuthenticationTypes.GOOGLE
        };

        authenticate(authPayload).then(authResponse => {
            const googleUser = new GoogleUser(response, authResponse.user, authResponse.id_token);
            this.user = googleUser;
        });
    }
}