import * as moment from "moment";

import { FULL_FORMAT } from "../common/utils/date";
import { BlogResponse } from "../common/responses/BlogResponse";
import { User } from "../common/models/User";
import { PublicUser } from "../common/responses/PublicUser";
import { RaceModel, RaceModelContext, RacePrediction, PredictionChoices } from "../common/models/Race";
import { TrackModel } from "../common/models/Track";
import { TrackResponse } from "../common/responses/TrackResponse";
import { DriverModel, DriverModelContext } from "../common/models/Driver";
import { DriverResponse } from "../common/responses/DriverResponse";
import { RaceResponse } from "../common/responses/RaceResponse";
import { PredictionResponse } from "../common/responses/PredictionResponse";
import { PredictionModel, PredictionContext } from "../common/models/Prediction";
import { getHash } from "./utilities/url";
import { TeamModel } from "../common/models/Team";
import { TeamResponse } from "../common/responses/TeamResponse";
import {
    getAllTracks,
    getBlogs,
    saveBlog as serverSaveBlog,
    getAllRaces,
    saveRaces,
    getTrack,
    getRace as serverGetRace,
    sendToEndpoint
} from "./utilities/ServerUtils";

import { PredictionStore } from "./stores/PredictionStore";
import { UserStore } from "./stores/UserStore";
import { DriverStore } from "./stores/DriverStore";
import { TeamStore } from "./stores/TeamStore";
import { IdentityManager } from "./IdentityManager";
import { Paths } from "./Paths";


export class AppManager {
    _initialized: Promise<boolean>;

    blogs: BlogResponse[] = [];
    nextRace: RaceModel;

    currentPredictions: PredictionModel[];

    private _watches: Map<string, Function[]> = new Map<string, Function[]>();

    readonly predictionStore: PredictionStore;
    readonly userStore: UserStore;
    readonly driverStore: DriverStore;
    readonly teamStore: TeamStore;
    private readonly _identityManager: IdentityManager = new IdentityManager();

    private _raceMap: Map<string, RaceModel> = new Map<string, RaceModel>();
    private _trackMap: Map<string, TrackModel> = new Map<string, TrackModel>();
    private _working: boolean = false;


    doGoogleLogin: () => Promise<void>;
    doFacebookLogin: () => Promise<void>;
    refreshUser: (key: string) => Promise<void>;
    createDriver: (dr: DriverResponse) => Promise<DriverModel>;
    getDriver: (key: string) => DriverModel;
    getUser: (key: string) => User;
    getTeam: (key: string) => TeamModel;
    saveTeam: (model: TeamModel) => Promise<boolean>;
    createTeam: (response: TeamResponse) => Promise<TeamModel>;
    signOut: () => Promise<void>;

    constructor() {
        this.saveBlog = this.saveBlog.bind(this);

        this.adminSendToEndpoint = this.adminSendToEndpoint.bind(this);

        this._setupIdentityManager();

        this.userStore = new UserStore(this._identityManager.getToken);
        this.teamStore = new TeamStore(this._identityManager.getToken);
        this.driverStore = new DriverStore(this._identityManager.getToken, this.teamStore.get);
        this.predictionStore = new PredictionStore(this._identityManager.getToken, this.driverStore.get, this.teamStore.get);

        // Set our upper level convenience methods for our stores
        this.createDriver = this.driverStore.create;
        this.getDriver = this.driverStore.get;
        this.doGoogleLogin = this._identityManager.doGoogleLogin;
        this.doFacebookLogin = this._identityManager.doFacebookLogin;
        this.refreshUser = this.userStore.refreshUser;
        this.getUser = this.userStore.get;
        this.saveTeam = this.teamStore.save;
        this.createTeam = this.teamStore.create;
        this.signOut = this._identityManager.signOut;
        this.getTeam = this.teamStore.get;
    }

    private _setupIdentityManager() {
        this._identityManager.fbLoaded = () => {
            this._publishWatches("facebookLogin");
        };
        this._identityManager.userChange = () => {
            this._publishWatches("user");
        };
        this._identityManager.googleLoaded = () => {
            this._publishWatches("googleLogin");
        };
    }

    get isLoggedIn() {
        return this._identityManager.isLoggedIn;
    }

    get fbLoaded() {
        return this._identityManager.haveFB;
    }

    get googleLoaded() {
        return this._identityManager.haveGoogle;
    }

    /**
     * showLoadingSpinner
     */
    public showLoadingSpinner() {
        this._working = true;
        this._publishWatches("working", true);
    }

    /**
     * hideLoadingSpinner
     */
    public hideLoadingSpinner() {
        this._working = false;
        this._publishWatches("working", false);
    }

    isWorking(): boolean {
        return this._working;
    }

    initialize(): Promise<boolean> {
        this._initialized = this._initialized ? this._initialized : new Promise<boolean>((resolve, reject) => {
            // Initial batch of promises to go and do everything we need to start up.
            // Initialize our user store (log user in if they already were)
            // Get all of our "base" models - Some of this can probably be moved into "secondary init"
            const promises: Promise<void>[] = [];
            promises.push(this._identityManager.initialize());
            promises.push(this.userStore.initialize());
            promises.push(this.teamStore.initialize());
            promises.push(this.driverStore.initialize());
            promises.push(this.predictionStore.initialize());
            promises.push(this.refreshBlogs());
            promises.push(this.refreshTracks());
            promises.push(this.refreshRaces());
            return Promise.all(promises).then(() => {
                // Ok, we've got all of our initial stuff done.
                // Now we do a secondary initialization.
                // This will mean we have to check where in the app the user is starting at,
                // And then fetch what they need.
                const hash = getHash();
                // If it contains a : then it has an id of something
                const parts = hash.split(":");
                // Secondary promises. We've got all of our base models.
                // So let's go fetch anything that the user is going to be looking at on app load. (specific race, user, predictions, etc)
                promises.length = 0;
                if (parts[1]) {
                    switch (parts[0]) {
                        case Paths.RACE:
                            promises.push(this.predictionStore.getPredictions(parts[1]).then(predictions => {
                                this.currentPredictions = predictions;
                            }));
                            break;
                        case Paths.PROFILE:
                            promises.push(this.userStore.refreshUser(parts[1]).then(() => { }));
                            break;
                    }
                }
                return Promise.all(promises).then(() => {
                    resolve(true);
                });
            }).catch(error => {
                reject(error);
            });
        });
        return this._initialized;
    }

    get teams(): TeamModel[] {
        return this.teamStore.getAll();
    }

    get drivers() {
        return this.driverStore.getAll().sort((a, b) => { return a.team.name.localeCompare(b.team.name); });
    }

    get user(): User {
        return this._identityManager.appUser;
    }

    get races() {
        return Array.from(this._raceMap.values());
    }

    get allSeasonPredictions() {
        return this.predictionStore.allSeasonPredictions;
    }

    userIsAdmin(): boolean {
        if (!this.user) {
            return false;
        }
        return this.user.isAdmin;
    }

    refreshRaces(): Promise<void> {
        return this._getAllRaces().then(raceModels => {
            this._publishWatches("races");
        });
    }

    refreshPredictions(raceKey: string): Promise<void> {
        return this.predictionStore.getPredictions(raceKey).then(predictions => {
            this.currentPredictions = predictions;
            this._publishWatches("currentPredictions");
        });
    }

    refreshRace(key: string): Promise<RaceModel> {
        return new Promise<RaceModel>((resolve, reject) => {
            return serverGetRace(2017, key, this.user.id_token).then(raceResponse => {
                const model = new RaceModel(raceResponse, this.raceModelContext);
                if (this._raceMap.has(model.key)) {
                    this._raceMap.delete(model.key);
                }
                this._raceMap.set(model.key, model);
                resolve(model);
            });
        });
    }

    getRace(key: string): RaceModel {
        if (this._raceMap.has(key)) return this._raceMap.get(key);
        return null;
    }

    get raceModelContext(): RaceModelContext {
        const context: RaceModelContext = {
            refresh: (race: RaceModel) => {
                return this.refreshRace(race.key);
            },
            saveRace: (raceModel: RaceModel) => {
                return this.saveRace(raceModel);
            },
            getTrack: (key: string): TrackModel => {
                if (this._trackMap.has(key)) {
                    return this._trackMap.get(key);
                }
                else {
                    return null;
                }
            },
            getDriver: (key: string): DriverModel => {
                return this.driverStore.get(key);
            }
        };
        return context;
    }

    private _getAllRaces(): Promise<RaceModel[]> {
        return new Promise<RaceModel[]>((resolve, reject) => {
            this._raceMap.clear();
            this.nextRace = null;
            return getAllRaces(2017).then((raceResponses: RaceResponse[]) => {
                const raceModels: RaceModel[] = raceResponses.map(rr => {
                    return new RaceModel(rr, this.raceModelContext);
                });
                for (const raceModel of raceModels) {
                    this._raceMap.set(raceModel.key, raceModel);
                    if (!this.nextRace && !raceModel.complete) {
                        this.nextRace = raceModel;
                    }
                }

                resolve(raceModels);
            });
        });
    }

    get tracks(): TrackModel[] {
        return Array.from(this._trackMap.values());
    }

    refreshTracks(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._trackMap.clear();
            return getAllTracks().then(trackResponses => {
                for (const trackResponse of trackResponses) {
                    this._trackMap.set(trackResponse.key, new TrackModel(trackResponse));
                }
                this._publishWatches("tracks");
                resolve();
            });
        });
    }

    get publicUsers(): PublicUser[] {
        return this.userStore.getAll();
    }

    refreshBlogs(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return getBlogs().then(blogResponses => {
                blogResponses.sort((a: BlogResponse, b: BlogResponse) => {
                    return (moment(b.postDate, FULL_FORMAT).diff(moment(a.postDate, FULL_FORMAT)));
                });
                this.blogs = blogResponses;
                this._publishWatches("blogs");
                resolve();
            });
        });
    }

    watch(path: string, callback: Function) {
        if (this._watches.has(path)) {
            this._watches.get(path).push(callback);
        } else {
            this._watches.set(path, [callback]);
        }
    }

    private _publishWatches(path: string,callbackParams:any = null) {
        if (this._watches.has(path)) {
            const callbacks = this._watches.get(path);
            callbacks.forEach(callback => {
                callback(callbackParams);
            });

        }
    }

    saveRace(model: RaceModel): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            return saveRaces(2017, [model.json], this.user.id_token).then(() => {
                resolve(true);
            })
        });
    }

    saveBlog(blog: BlogResponse): Promise<void> {
        const finalBlog: BlogResponse = {
            author: {
                key: this.user.key
            },
            message: blog.message,
            postDate: moment().format(FULL_FORMAT),
            title: blog.title
        };
        return serverSaveBlog(finalBlog, this.user.id_token).then(() => {
            return this.refreshBlogs();
        }).then(() => {
            return Promise.resolve();
        });
    }

    adminSendToEndpoint(urlFragment: string, body: string): Promise<any> {
        if (!this.user.isAdmin) {
            return Promise.reject("Unauthorized");
        }
        return new Promise<any>((resolve, reject) => {
            return sendToEndpoint(urlFragment, body, this.user.id_token).then(value => {
                resolve(value);
            }).catch(reject);
        });
    }
}