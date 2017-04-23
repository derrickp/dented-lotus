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
    getAllDrivers,
    saveDrivers,
    saveBlog as serverSaveBlog,
    createDriver as serverCreateDriver,
    getAllRaces,
    saveRaces,
    getAllTeams,
    getTrack,
    getDriver,
    getRace as serverGetRace,
    saveTeams,
    getAllPublicUsers,
    sendToEndpoint
} from "./utilities/ServerUtils";

import { PredictionStore } from "./stores/PredictionStore";
import { UserStore } from "./stores/UserStore";
import { Paths } from "./Paths";


export class AppManager {
    _initialized: Promise<boolean>;

    blogs: BlogResponse[] = [];
    publicUsers: PublicUser[] = [];
    nextRace: RaceModel;

    currentPredictions: PredictionModel[];

    private _watches: Map<string, Function[]> = new Map<string, Function[]>();

    private readonly _predictionStore: PredictionStore;
    private readonly _userStore: UserStore = new UserStore();

    private _raceMap: Map<string, RaceModel> = new Map<string, RaceModel>();
    private _driverMap: Map<string, DriverModel> = new Map<string, DriverModel>();
    private _teamMap: Map<string, TeamModel> = new Map<string, TeamModel>();
    private _trackMap: Map<string, TrackModel> = new Map<string, TrackModel>();

    doGoogleLogin: () => Promise<void>;
    doFacebookLogin: () => Promise<void>;
    refreshUser: (key: string) => Promise<void>;

    constructor() {
        this.signOut = this.signOut.bind(this);
        this.saveDriver = this.saveDriver.bind(this);
        this.saveRace = this.saveRace.bind(this);
        this.saveTeam = this.saveTeam.bind(this);

        this.saveBlog = this.saveBlog.bind(this);

        this.adminSendToEndpoint = this.adminSendToEndpoint.bind(this);
        this.getUser = this.getUser.bind(this);
        this.getDriver = this.getDriver.bind(this);
        this.getTeam = this.getTeam.bind(this);

        this._predictionStore = new PredictionStore();
        this._predictionStore.getDriver = this.getDriver;
        this._predictionStore.getTeam = this.getTeam;
        this._setupUserStore();
        this.doGoogleLogin = this._userStore.doGoogleLogin;
        this.doFacebookLogin = this._userStore.doFacebookLogin;
        this.refreshUser = this._userStore.refreshUser;
    }

    private _setupUserStore() {
        this._userStore.getDriver = this.getDriver;
        this._userStore.getTeam = this.getTeam;
        this._userStore.fbLoaded = () => {
            this._publishWatches("facebookLogin");
        };
        this._userStore.userChange = () => {
            this._predictionStore.user = this._userStore.user;
            this._publishWatches("user");
        };
        this._userStore.googleLoaded = () => {
            this._publishWatches("googleLogin");
        };
    }

    get fbLoaded() {
        return this._userStore.haveFB;
    }

    get googleLoaded() {
        return this._userStore.haveGoogle;
    }

    initialize(): Promise<boolean> {
        this._initialized = this._initialized ? this._initialized : new Promise<boolean>((resolve, reject) => {
            // Initial batch of promises to go and do everything we need to start up.
            // Initialize our user store (log user in if they already were)
            // Get all of our "base" models - Some of this can probably be moved into "secondary init"
            const promises: Promise<void>[] = [];
            promises.push(this._userStore.initialize());
            promises.push(this.refreshTeams().then(() => {
                console.log("got teams");
            }));
            promises.push(this.refreshDrivers().then(() => {
                console.log("got drivers");
            }));
            promises.push(this.refreshBlogs());
            promises.push(this.refreshTracks());
            promises.push(this.refreshAllUsers());
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
                            promises.push(this._predictionStore.getPredictions(parts[1]).then(predictions => {
                                this.currentPredictions = predictions;
                            }));
                            break;
                        case Paths.PROFILE:
                            promises.push(this._userStore.refreshUser(parts[1]).then(() => { }));
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
        return Array.from(this._teamMap.values());
    }

    getDriver(key: string) {
        return this._driverMap.get(key);
    }

    getTeam(key: string) {
        return this._teamMap.get(key);
    }

    refreshTeams(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return getAllTeams().then(teamResponses => {
                const teams: TeamModel[] = [];
                for (const teamResponse of teamResponses) {
                    const team = this._getTeam(teamResponse);
                    teams.push(team);
                }
                this._publishWatches("teams");
                resolve();
            });
        });
    }

    refreshDrivers(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return getAllDrivers().then((driverResponses: DriverResponse[]) => {
                const driverModels: DriverModel[] = driverResponses.map(dr => {
                    return this._getDriverModel(dr);
                });
                this._publishWatches("drivers");
                resolve();
            });
        });
    }

    get drivers() {
        const drivers = Array.from(this._driverMap.values()).sort((a, b) => { return a.team.name.localeCompare(b.team.name); });
        return drivers;
    }

    get user(): User {
        return this._userStore.user;
    }

    get races() {
        return Array.from(this._raceMap.values());
    }

    get allSeasonPredictions() {
        return this._predictionStore.allSeasonPredictions;
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
        return this._predictionStore.getPredictions(raceKey).then(predictions => {
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
                return this._driverMap.get(key);
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

    private _getDriverModel(response: DriverResponse): DriverModel {
        if (this._driverMap.has(response.key)) return this._driverMap.get(response.key);
        const driverModel = new DriverModel(response, this.driverContext);
        this._driverMap.set(response.key, driverModel);
        this._publishWatches("drivers");
        return driverModel;
    }

    get driverContext(): DriverModelContext {
        return {
            saveDriver: (driver: DriverModel) => {
                return this.saveDriver(driver);
            },
            getTeam: (key: string) => {
                return this._teamMap.get(key);
            }
        };
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

    get isLoggedIn(): boolean {
        return this._userStore.isLoggedIn;
    }

    refreshAllUsers(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return getAllPublicUsers().then((users: PublicUser[]) => {
                this.publicUsers = users;
                this._publishWatches("publicUsers");
                resolve();
            });
        });
    }

    getUser(key: string): User {
        return this._userStore.getUser(key);
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

    private _publishWatches(path: string) {
        if (this._watches.has(path)) {
            const callbacks = this._watches.get(path);
            callbacks.forEach(callback => {
                callback();
            });

        }
    }

    signOut(): Promise<void> {
        return this._userStore.signOut();
    }

    updateDriver(driverModel: DriverModel): Promise<DriverModel> {
        if (!this.user.isAdmin || !this.user.id_token) {
            return Promise.reject(new Error("Unauthorized"));
        }
        return new Promise<DriverModel>((resolve, reject) => {
            return saveDrivers([driverModel.json], this.user.id_token).then(newDriverResponses => {
                const newDriverModels: DriverModel[] = [];
                if (newDriverResponses.length) {
                    for (const newDriverResponse of newDriverResponses) {
                        if (this._driverMap.has(newDriverResponse.key)) {
                            this._driverMap.delete(newDriverResponse.key);
                        }
                        newDriverModels.push(this._getDriverModel(newDriverResponse));
                    }
                }
                resolve(newDriverModels[0]);
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

    createDriver(dr: DriverResponse): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            // Ensure the key is nulled out for a new driver
            dr.key = null;
            return serverCreateDriver(dr, this.user.id_token).then((newDriverResponse) => {
                const newDriverModel: DriverModel = null;
                if (newDriverResponse) {
                    if (this._driverMap.has(newDriverResponse.key)) {
                        this._driverMap.delete(newDriverResponse.key);
                    }
                    const newDriverModel = this._getDriverModel(newDriverResponse);
                }
                resolve(true);
            });
        });
    }

    saveDriver(model: DriverModel): Promise<DriverModel[]> {
        return new Promise<DriverModel[]>((resolve, reject) => {
            const payload = [model.json];
            return saveDrivers(payload, this.user.id_token).then((newDriverResponses) => {
                const newDriverModels: DriverModel[] = [];
                if (newDriverResponses.length) {
                    for (const newDriverResponse of newDriverResponses) {
                        if (this._driverMap.has(newDriverResponse.key)) {
                            this._driverMap.delete(newDriverResponse.key);
                        }
                        newDriverModels.push(this._getDriverModel(newDriverResponse));
                    }
                }
                resolve(newDriverModels);
            });
        });
    }

    createTeam(tr: TeamResponse): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const payload = [tr];
            return saveTeams(payload, this.user.id_token).then((newResponses) => {
                const newTeamModels: TeamModel[] = [];
                if (newResponses.length) {
                    for (const newTeamResponse of newResponses) {
                        if (this._teamMap.has(newTeamResponse.key)) {
                            this._teamMap.delete(newTeamResponse.key);
                        }
                        newTeamModels.push(this._getTeam(newTeamResponse));
                    }
                }
                resolve(true);
            });
        });
    }

    saveTeam(model: TeamModel): Promise<TeamModel[]> {
        return new Promise<TeamModel[]>((resolve, reject) => {
            const payload = [model.json];
            return saveTeams(payload, this.user.id_token).then((newResponses) => {
                const newTeamModels: TeamModel[] = [];
                if (newResponses.length) {
                    for (const newTeamResponse of newResponses) {
                        if (this._teamMap.has(newTeamResponse.key)) {
                            this._teamMap.delete(newTeamResponse.key);
                        }
                        newTeamModels.push(this._getTeam(newTeamResponse));
                    }
                }
                resolve(newTeamModels);
            });
        });
    }

    private _getTeam(teamResponse: TeamResponse): TeamModel {
        if (this._teamMap.has(teamResponse.key)) return this._teamMap.get(teamResponse.key);
        const model = new TeamModel(teamResponse);
        this._teamMap.set(teamResponse.key, model);
        this._publishWatches("teams");
        return model;
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