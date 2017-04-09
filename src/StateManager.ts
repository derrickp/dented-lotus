import * as moment from "moment";

import { FULL_FORMAT } from "../common/utils/date";
import { BlogResponse } from "../common/models/Blog";
import { User, PublicUser, GoogleUser, FacebookUser, UserContext } from "../common/models/User";
import { RaceModel, RaceResponse, RaceModelContext, RacePrediction, PredictionChoices } from "../common/models/Race";
import { TrackResponse, TrackModel } from "../common/models/Track";
import { DriverModel, DriverModelContext, DriverResponse } from "../common/models/Driver";
import { PredictionResponse, PredictionModel, PredictionContext, UserPickPayload } from "../common/models/Prediction";
import { TeamModel, TeamResponse } from "../common/models/Team";
import { AuthenticationPayload, AuthenticationTypes, AuthenticationResponse } from "../common/models/Authentication";
import {
    getAllTracks,
    getBlogs,
    getAllDrivers,
    authenticate,
    saveDrivers,
    saveBlog as serverSaveBlog,
    createDriver as serverCreateDriver,
    getAllRaces,
    saveRaces,
    saveUserPicks,
    getAllTeams,
    getTrack,
    getDriver,
    getRace,
    saveTeams,
    getAllSeasonPredictions,
    getAllPublicUsers,
    getUser as serverGetUser,
    saveUserInfo,
    savePredictionChoices as serverSavePredictionChoices,
    saveRacePredictions as serverSaveRacePredictions
} from "./utilities/ServerUtils";


export class StateManager {

    private _googleAuth: gapi.auth2.GoogleAuth;
    fbLoaded: boolean;
    googleLoaded: boolean;

    blogs: BlogResponse[] = [];
    publicUsers: PublicUser[] = [];

    private _watches: Map<string, Function[]> = new Map<string, Function[]>();
    private _user: User;

    private _raceMap: Map<string, RaceModel> = new Map<string, RaceModel>();
    private _driverMap: Map<string, DriverModel> = new Map<string, DriverModel>();
    private _teamMap: Map<string, TeamModel> = new Map<string, TeamModel>();
    private _trackMap: Map<string, TrackResponse> = new Map<string, TrackResponse>();

    constructor() {
        this.signOut = this.signOut.bind(this);
        this.completeGoogleLogin = this.completeGoogleLogin.bind(this);
        this.saveDriver = this.saveDriver.bind(this);
        this.saveRace = this.saveRace.bind(this);
        this.saveTeam = this.saveTeam.bind(this);
        this.completeFacebookLogin = this.completeFacebookLogin.bind(this);
        this.saveBlog = this.saveBlog.bind(this);

        this.doFacebookLogin = this.doFacebookLogin.bind(this);
        this.doGoogleLogin = this.doGoogleLogin.bind(this);
    }

    initialize() {
        this._initFacebook();
        this._initGoogle();
        this.refreshTeams().then(() => {
            console.log("got teams");
        });
        this.refreshDrivers().then(() => {
            console.log("got drivers");
        });
        this.refreshBlogs();
        this.refreshTracks();
        this.refreshAllUsers();
    }

    get teams(): TeamModel[] {
        return Array.from(this._teamMap.values());
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
            return getAllDrivers().then((driverResponses: DriverModel[]) => {
                const driverModels: DriverModel[] = driverResponses.map(dr => {
                    return this._getDriver(dr);
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
        return this._user;
    }

    set user(user: User) {
        this._user = user;
        this._publishWatches("user");
    }

    get races() {
        return Array.from(this._raceMap.values());
    }

    refreshRaces(): Promise<void> {
        if (!this.isLoggedIn) return Promise.resolve();
        return this._getAllRaces().then(raceModels => {
            this._publishWatches("races");
        });
    }

    getRace(key: string): Promise<RaceModel> {
        return new Promise<RaceModel>((resolve, reject) => {
            return getRace(2017, key, this.user.id_token).then(raceResponse => {
                const model = new RaceModel(raceResponse, this.raceModelContext);
                if (this._raceMap.has(model.key)) {
                    this._raceMap.delete(model.key);
                }
                this._raceMap.set(model.key, model);
                resolve(model);
            });
        });
    }

    saveRacePredictions(model: RaceModel): Promise<void> {
        if (!this.user.isLoggedIn || !this.user.isAdmin) return Promise.reject("Unauthorized");
        return new Promise<void>((resolve, reject) => {
            // First save the actual predictions
            if (model.predictions && model.predictions.length > 0) {
                const racePredictions = model.predictions.map(pm => {
                    const racePrediction: RacePrediction = {
                        race: model.key,
                        prediction: pm.predictionResponse.key,
                        value: pm.predictionResponse.value,
                        modifier: pm.predictionResponse.modifier
                    };
                    return racePrediction;
                });
                // Save them to the server
                return serverSaveRacePredictions(model.key, racePredictions, this.user.id_token);
            }
            return Promise.resolve();
        }).then(() => {
            // Then save the choices if there are any.
            if (model.predictions && model.predictions.length > 0) {
                const all: PredictionChoices[] = [];
                for (const prediction of model.predictions) {
                    if (prediction.choices && prediction.choices.length) {
                        const predictionChoices: PredictionChoices = {
                            race: model.key,
                            prediction: prediction.predictionResponse.key,
                            choices: prediction.choices.map(c => c.key).join(",")
                        };
                        all.push(predictionChoices);
                    }
                }
                // Save to the server
                return serverSavePredictionChoices(model.key, all, this.user.id_token);
            }
            return Promise.resolve();
        });
    }

    get raceModelContext(): RaceModelContext {
        const context: RaceModelContext = {
            refresh: (race: RaceModel) => {
                return this.getRace(race.key);
            },
            saveRace: (raceModel: RaceModel) => {
                return this.saveRace(raceModel);
            },
            getTrack: (response: TrackResponse): TrackModel => {
                return new TrackModel(response);
            },
            getDriver: (response: DriverResponse): DriverModel => {
                return this._getDriver(response);
            },
            getPrediction: (response: PredictionResponse): PredictionModel => {
                return new PredictionModel(response, this.predictionContext);
            },
            saveRacePredictions: (model: RaceModel) => {
                return this.saveRacePredictions(model);
            }
        };
        return context;
    }

    private _getAllRaces(): Promise<RaceModel[]> {
        return new Promise<RaceModel[]>((resolve, reject) => {
            this._raceMap.clear();
            return getAllRaces(2017, this.user.id_token).then((raceResponses: RaceResponse[]) => {
                const raceModels: RaceModel[] = raceResponses.map(rr => {
                    return new RaceModel(rr, this.raceModelContext);
                });
                for (const raceModel of raceModels) {
                    this._raceMap.set(raceModel.key, raceModel);
                }
                resolve(raceModels);
            });
        });
    }

    get predictionContext(): PredictionContext {
        return {
            saveUserPicks: (model: PredictionModel) => {
                if (!this.user.isLoggedIn) {
                    return Promise.reject(new Error("Need to be logged in to save"));
                }
                const payload: UserPickPayload[] = [];
                payload.push({
                    race: model.predictionResponse.raceKey,
                    prediction: model.predictionResponse.key,
                    choice: model.predictionResponse.userPick
                });
                return saveUserPicks(payload, this.user.id_token);
            },
            getDriver: (response: DriverResponse) => {
                return this._getDriver(response);
            },
            getTeam: (response: TeamResponse) => {
                return new TeamModel(response);
            }
        }
    }

    private _getDriver(response: DriverResponse): DriverModel {
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
            getTeam: (response: TeamResponse) => {
                return this._getTeam(response);
            }
        };
    }

    get tracks(): TrackResponse[] {
        return Array.from(this._trackMap.values());
    }

    refreshTracks(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._trackMap.clear();
            return getAllTracks().then(trackResponses => {
                for (const trackResponse of trackResponses) {
                    this._trackMap.set(trackResponse.key, trackResponse);
                }
                this._publishWatches("tracks");
                resolve();
            });
        });
    }

    get isLoggedIn(): boolean {
        return this.user != null && this.user.isLoggedIn;
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

    getUser(key: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            return serverGetUser(key, this.user.id_token).then(userResponse => {
                resolve(new User(userResponse, "", this.userContext));
            }).catch(reject);
        });
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

    get allSeasonPredictions(): Promise<PredictionModel[]> {
        return new Promise<PredictionModel[]>((resolve, reject) => {
            return getAllSeasonPredictions(this.user.id_token).then(predictionResponses => {
                const allSeasonPredictions: PredictionModel[] = [];
                for (const predictionResponse of predictionResponses) {
                    const pm = new PredictionModel(predictionResponse, this.predictionContext);
                    allSeasonPredictions.push(pm);
                }
                resolve(allSeasonPredictions);
            });
        });
    }

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

    private _initFacebook() {
        if (window["FB"]) {
            this.fbLoaded = true;
            this._publishWatches("facebookLogin");
            FB.getLoginStatus((response: FB.LoginStatusResponse) => {
                // If we haven't been authorized yet, then we aren't going to use Facebook to login
                if (response.status !== "connected") {
                    return;
                }
                else {
                    this.completeFacebookLogin(response);
                }
            }, true);
        }
        else {
            const interval = setInterval(() => {
                if (window["FB"]) {
                    clearInterval(interval);
                    this._initFacebook();
                }
            }, 100);
        }
    }

    doGoogleLogin(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._googleAuth.signIn().then(() => {
                const user = this._googleAuth.currentUser.get();
                return this.completeGoogleLogin(user).then(resolve);
            });
        });

    }

    private _initGoogle() {
        if (window["gapi"]) {
            gapi.load("auth2", () => {
                gapi.auth2.init({
                    client_id: "1047134015899-kpabbgk5b6bk0arj4b1hecktier9nki7.apps.googleusercontent.com"
                }).then(() => {
                    this.googleLoaded = true;
                    this._googleAuth = gapi.auth2.getAuthInstance();
                    this._publishWatches("googleLogin");
                    const loggedIn = this._googleAuth.isSignedIn.get();
                    if (loggedIn) {
                        const user: gapi.auth2.GoogleUser = this._googleAuth.currentUser.get();
                        this.completeGoogleLogin(user);
                    }
                }, (reason: string) => {
                    console.error("component:GoogleLogin:" + reason);
                });
            });
        } else {
            const interval = setInterval(() => {
                if (window["gapi"]) {
                    clearInterval(interval);
                    this._initGoogle();
                }
            }, 1000);
        }
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

    get nextRace(): RaceModel {
        if (!this.races.length) {
            return null;
        }
        let nextRace: RaceModel;
        for (const race of this.races) {
            if (!race.complete) {
                nextRace = race;
                break;
            }
        }
        return nextRace;
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
            return saveDrivers([driverModel], this.user.id_token).then(newDriverResponses => {
                const newDriverModels: DriverModel[] = [];
                if (newDriverResponses.length) {
                    for (const newDriverResponse of newDriverResponses) {
                        if (this._driverMap.has(newDriverResponse.key)) {
                            this._driverMap.delete(newDriverResponse.key);
                        }
                        newDriverModels.push(this._getDriver(newDriverResponse));
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
                    const newDriverModel = this._getDriver(newDriverResponse);
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
                        newDriverModels.push(this._getDriver(newDriverResponse));
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

    get userContext(): UserContext {
        const context: UserContext = {
            saveUser: (user: User) => {
                return saveUserInfo(user.json, this.user.id_token).then(() => {
                    this._publishWatches("user");
                });
            },
            getDriver: (key: string) => {
                if (this._driverMap.has(key)) return this._driverMap.get(key);
                return null;
            },
            getTeam: (key: string) => {
                if (this._teamMap.has(key)) return this._teamMap.get(key);
                return null;
            }
        };
        return context;
    }

    completeFacebookLogin(args: FB.LoginStatusResponse): Promise<void> {
        const authPayload: AuthenticationPayload = {
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

    completeGoogleLogin(response: gapi.auth2.GoogleUser): Promise<void> {
        const authPayload: AuthenticationPayload = {
            auth_token: response.getAuthResponse().id_token,
            authType: AuthenticationTypes.GOOGLE
        };
        return authenticate(authPayload).then(authResponse => {
            const googleUser = new GoogleUser(response, authResponse.user, authResponse.id_token, this.userContext);
            this.user = googleUser;
        });
    }
}