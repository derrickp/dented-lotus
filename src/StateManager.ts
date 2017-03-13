
import { BlogResponse } from "../common/models/Blog";
import { User, GoogleUser, FacebookUser } from "../common/models/User";
import { RaceModel, RaceResponse, RaceModelContext } from "../common/models/Race";
import { TrackResponse, TrackModel } from "../common/models/Track";
import { DriverModel, DriverResponse, DriverModelContext } from "../common/models/Driver";
import { AuthenticationPayload, AuthenticationTypes, AuthenticationResponse } from "../common/models/Authentication";
import { getAllTracks, getAllDrivers, authenticate, saveDrivers, getAllRaces, saveRaces, getTrack, getDriver, getRace } from "./utilities/ServerUtils"


export class StateManager {
    blogs: BlogResponse[] = [
        {
            author: "Craig",
            postDate: "Sept. 33rd",
            message: "Today shouldn't exist!",
            title: "but Why!?"
        },
        {
            author: "Derrick",
            postDate: "Sept. 34th",
            message: "What have we done?!",
            title: "SEPTEMBER!!!"
        }
    ];

    private _watches: Map<string, Function[]> = new Map<string, Function[]>();

    private _tracks: Promise<TrackResponse[]>;
    private _drivers: Promise<DriverModel[]>;
    private _races: Promise<RaceModel[]>;
    private _user: User;

    private _dummyTeams = ["fer","mer","fin"]; 
    get user(): User {
        return this._user;
    }

    set user(user: User) {
        this._user = user;
        this._publishWatches("user");
    }

    get races(): Promise<RaceModel[]> {
        if (!this.isLoggedIn) return Promise.resolve(null);
        this._races = this._races ? this._races : this._getRaces();
        return this._races;
    }

    private _getRaces(): Promise<RaceModel[]> {
        return new Promise<RaceModel[]>((resolve, reject) => {
            return getAllRaces(2017, this.user.id_token).then((raceResponses: RaceResponse[]) => {
                const raceModels: RaceModel[] = raceResponses.map(rr => {
                    const context: RaceModelContext = {
                        saveRace: (raceModel: RaceModel) => {
                            return this.saveRace(raceModel);
                        },
                        getTrack: (key: string): Promise<TrackModel> => {
                            return getTrack(key).then(trackResponse => {
                                return Promise.resolve(new TrackModel(trackResponse));
                            });
                        },
                        getDriver: (key: string): Promise<DriverModel> => {
                            return getDriver(key).then(driverResponse => {
                                return Promise.resolve(new DriverModel(driverResponse));
                            });
                        }
                    };
                    return new RaceModel(rr, context);
                });
                resolve(raceModels);
            });
        });
    }

    get tracks(): Promise<TrackResponse[]> {
        this._tracks = this._tracks ? this._tracks : getAllTracks();
        return this._tracks;
    }

    get isLoggedIn(): boolean {
        return this.user != null && this.user.isLoggedIn;
    }

    get drivers(): Promise<DriverModel[]> {
        return new Promise<DriverModel[]>((resolve, reject) => {
            return getAllDrivers().then((driverResponses: DriverResponse[]) => {
                const driverModels: DriverModel[] = driverResponses.map(dr => {
                    const context: DriverModelContext = {
                        saveDriver: (driver: DriverModel) => {
                            return this.saveDriver(driver);
                        }
                    };
                    return new DriverModel(dr, context);
                });
                resolve(driverModels);
            });
        });
    }

    get teams():Promise<string[]>{

        return Promise.resolve(this._dummyTeams);
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
    getBlogs(whereClause?: string): Promise<BlogResponse[]> {
        return Promise.resolve(this.blogs.sort((a: BlogResponse, b: BlogResponse) => { return b.postDate.localeCompare(a.postDate) }));
    }

    get nextRace(): Promise<RaceModel> {
        return new Promise<RaceModel>((resolve, reject) => {
            return this.races.then((races: RaceModel[]) => {
                let nextRace: RaceModel;
                races.some(r => {
                    if (r.complete) {
                        nextRace = r;
                        return true;
                    }
                    return false;
                });
                resolve(nextRace);
            });
        });
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

    saveRace(model: RaceModel): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            return saveRaces(2017, [model.json], this.user.id_token).then(() => {
                resolve(true);
            })
        });
    }

    saveDriver(model: DriverModel): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            return saveDrivers([model], this.user.id_token).then(() => {
                resolve(true);
            })
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