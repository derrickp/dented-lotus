
import { BlogResponse } from "../common/models/Blog";
import { User,PublicUser, GoogleUser, FacebookUser } from "../common/models/User";
import { RaceModel, RaceResponse, RaceModelContext } from "../common/models/Race";
import { TrackResponse, TrackModel } from "../common/models/Track";
import { DriverModel, DriverModelContext, DriverResponse } from "../common/models/Driver";
import { PredictionResponse, PredictionModel, PredictionContext, UserPickPayload } from "../common/models/Prediction";
import { TeamModel, TeamResponse } from "../common/models/Team";
import { SignupInfo } from "../common/models/Signup";
import { AuthenticationPayload, AuthenticationTypes, AuthenticationResponse } from "../common/models/Authentication";
import {
    getAllTracks,
    getBlogs,
    getAllDrivers,
    authenticate,
    saveDrivers,
    createDriver as serverCreateDriver,
    getAllRaces,
    saveRaces,
    saveUserPicks,
    getAllTeams,
    getTrack,
    getDriver,
    getRace,
    saveTeams,
    signup,
    getAllSeasonPredictions,
    getAllPublicUsers
} from "./utilities/ServerUtils"


export class StateManager {

    private _googleAuth: gapi.auth2.GoogleAuth;
    fbLoaded: boolean;
    googleLoaded: boolean;
    private _watches: Map<string, Function[]> = new Map<string, Function[]>();

    private _tracks: Promise<TrackResponse[]>;
    private _drivers: Promise<DriverModel[]>;
    private _races: Promise<RaceModel[]>;
    private _blogs: Promise<BlogResponse[]>;
    private _user: User;

    private _raceMap: Map<string, RaceModel> = new Map<string, RaceModel>();
    private _driverMap: Map<string, DriverModel> = new Map<string, DriverModel>();
    private _teamMap: Map<string, TeamModel> = new Map<string, TeamModel>();

    private _teams: Promise<TeamModel[]>;
    private _allUsers:Promise<PublicUser[]>;
    get teams(): Promise<TeamModel[]> {
        this._teams = this._teams ? this._teams : new Promise<TeamModel[]>((resolve, reject) => {
            return getAllTeams().then(teamResponses => {
                const teams: TeamModel[] = [];
                for (const teamResponse of teamResponses) {
                    const team = this.getTeam(teamResponse);
                    teams.push(team);
                }
                resolve(teams);
            });
        });
        return this._teams;
    }


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

    getRace(key: string): Promise<RaceModel> {
        return new Promise<RaceModel>((resolve, reject) => {
            return getRace(2017, key, this.user.id_token).then(raceResponse => {
                const model = new RaceModel(raceResponse, this.raceModelContext);
                if (this._raceMap.has(model.key)) {
                    this._raceMap.delete(model.key);
                }
                this._raceMap.set(model.key, model);
                this._publishWatches("races");
                resolve(model);
            });
        });
    }

    get raceModelContext(): RaceModelContext {
        const context: RaceModelContext = {
            refresh:(race:RaceModel)=>{
                return this.getRace(race.key).then((newRace)=>{
                    race.track = newRace.track;
                })
            },
            saveRace: (raceModel: RaceModel) => {
                return this.saveRace(raceModel);
            },
            getTrack: (response: TrackResponse): TrackModel => {
                return new TrackModel(response);
            },
            getDriver: (response: DriverResponse): DriverModel => {
                return this.getDriver(response);
            },
            getPrediction: (response: PredictionResponse): PredictionModel => {
                return new PredictionModel(response, this.predictionContext);
            }
        };
        return context;
    }

    private _getRaces(): Promise<RaceModel[]> {
        return new Promise<RaceModel[]>((resolve, reject) => {
            return getAllRaces(2017, this.user.id_token).then((raceResponses: RaceResponse[]) => {
                const raceModels: RaceModel[] = raceResponses.map(rr => {
                    return new RaceModel(rr, this.raceModelContext);
                });
                for (const raceModel of raceModels) {
                    if (!this._raceMap.has(raceModel.key)) this._raceMap.set(raceModel.key, raceModel);
                }
                this._publishWatches("races");
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
                return this.getDriver(response);
            },
            getTeam: (response: TeamResponse) => {
                return new TeamModel(response);
            }
        }
    }

    getDriver(response: DriverResponse): DriverModel {
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
                return this.getTeam(response);
            }
        };
    }

    get tracks(): Promise<TrackResponse[]> {
        this._tracks = this._tracks ? this._tracks : getAllTracks();
        return this._tracks;
    }

    get isLoggedIn(): boolean {
        return this.user != null && this.user.isLoggedIn;
    }

    get drivers(): Promise<DriverModel[]> {
        this._drivers = this._drivers ? this._drivers : new Promise<DriverModel[]>((resolve, reject) => {
            return getAllDrivers().then((driverResponses: DriverModel[]) => {
                const driverModels: DriverModel[] = driverResponses.map(dr => {
                    return this.getDriver(dr);
                });
                resolve(driverModels.sort((a, b) => { return a.team.name.localeCompare(b.team.name); }));
            });
        });

        return this._drivers;
    }
    
    get allUsers():Promise<PublicUser[]>{
        return this._allUsers ? this._allUsers:new Promise<PublicUser[]>((resolve,reject)=>{
            return getAllPublicUsers().then((users:PublicUser[]) => { 
                resolve(users);
            });
        });
    }

    get blogs(): Promise<BlogResponse[]> {
        this._blogs = this._blogs ? this._blogs : new Promise((resolve, reject) => {
            return getBlogs().then(blogResponses => {
                blogResponses.sort((a: BlogResponse, b: BlogResponse) => { return b.postDate.localeCompare(a.postDate) });
                this._publishWatches("blogs");
                resolve(blogResponses);
            });
        });
        return this._blogs;
    }

    private _allSeasonPredictions: Promise<PredictionModel[]>;
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

    constructor() {
        this.signup = this.signup.bind(this);
        this.signOut = this.signOut.bind(this);
        this.completeGoogleLogin = this.completeGoogleLogin.bind(this);
        this.saveDriver = this.saveDriver.bind(this);
        this.saveRace = this.saveRace.bind(this);
        this.saveTeam = this.saveTeam.bind(this);
        this.completeFacebookLogin = this.completeFacebookLogin.bind(this);

        this.doFacebookLogin = this.doFacebookLogin.bind(this);
        this.doGoogleLogin = this.doGoogleLogin.bind(this);
        this._initFacebook();
        this._initGoogle();

        this.teams.then(() => {
            console.log("got teams");
        });
        this.drivers.then(() => {
            console.log("got drivers");
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
                resolve();
            });
        });
    }

    private _initGoogle() {
        if (window["gapi"]) {
            gapi.load("auth2", () => {
                gapi.auth2.init({
                    client_id: "1047134015899-kpabbgk5b6bk0arj4b1hecktier9nki7.apps.googleusercontent.com"
                }).then(() => {
                    this._publishWatches("googleLogin");
                    this._googleAuth = gapi.auth2.getAuthInstance();
                    this._googleAuth.isSignedIn.listen(signedIn => {
                        if (signedIn) {
                            const user: gapi.auth2.GoogleUser = this._googleAuth.currentUser.get();
                            this.completeGoogleLogin(user);
                        }
                    });
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
            }, 10);
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

    get nextRace(): Promise<RaceModel> {
        return new Promise<RaceModel>((resolve, reject) => {
            return this.races.then((races: RaceModel[]) => {
                let nextRace: RaceModel;
                races.some(r => {
                    if (!r.complete) {
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
            return saveDrivers([driverModel], this.user.id_token).then(newDriverResponses => {
                const newDriverModels: DriverModel[] = [];
                if (newDriverResponses.length) {
                    for (const newDriverResponse of newDriverResponses) {
                        if (this._driverMap.has(newDriverResponse.key)) {
                            this._driverMap.delete(newDriverResponse.key);
                        }
                        newDriverModels.push(this.getDriver(newDriverResponse));
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
                    const newDriverModel = this.getDriver(newDriverResponse);
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
                        newDriverModels.push(this.getDriver(newDriverResponse));
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
                        newTeamModels.push(this.getTeam(newTeamResponse));
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
                        newTeamModels.push(this.getTeam(newTeamResponse));
                    }
                }
                resolve(newTeamModels);
            });
        });
    }

    getTeam(teamResponse: TeamResponse): TeamModel {
        if (this._teamMap.has(teamResponse.key)) return this._teamMap.get(teamResponse.key);
        const model = new TeamModel(teamResponse);
        this._teamMap.set(teamResponse.key, model);
        this._publishWatches("teams");
        return model;
    }

    completeFacebookLogin(args: FB.LoginStatusResponse): Promise<void> {
        const authPayload: AuthenticationPayload = {
            auth_token: args.authResponse.accessToken,
            authType: AuthenticationTypes.FACEBOOK
        };

        return authenticate(authPayload).then(authResponse => {
            const user = new FacebookUser(args, authResponse.user, authResponse.id_token);
            this.user = user;
        });
    }

    completeGoogleLogin(response: gapi.auth2.GoogleUser): Promise<void> {
        const authPayload: AuthenticationPayload = {
            auth_token: response.getAuthResponse().id_token,
            authType: AuthenticationTypes.GOOGLE
        };

        return authenticate(authPayload).then(authResponse => {
            const googleUser = new GoogleUser(response, authResponse.user, authResponse.id_token);
            this.user = googleUser;
        });
    }

    signup(type: string, info: SignupInfo): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            return signup(info).then(success => {
                resolve(true);
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }
}